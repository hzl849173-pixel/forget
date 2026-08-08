import { useState, useMemo } from 'react';
import { useWorkout, WorkoutSession, PersonalRecord, Exercise, LoggedExercise } from './use-workout-storage';
import { MuscleGroup, SHOULDER_EXERCISE_IDS } from '../constants/exercises';

export interface OverallStats {
  totalWorkouts: number;
  totalSets: number;
  totalReps: number;
  totalVolume: number;
  currentStreak: number;
  longestStreak: number;
}

export interface PRDisplay {
  exerciseId: string;
  exerciseName: string;
  muscleGroup: string;
  weight: number;
  reps: number;
  date: string;
  estimatedOneRM: number;
  isNew: boolean;
}

export interface ExerciseComparison {
  latestWorkoutDate?: string;
  previousWorkoutDate?: string;
  latestMaxWeight: number;
  prevMaxWeight: number;
  weightChangePercent: number;
  latestMaxReps: number;
  prevMaxReps: number;
  repsChangePercent: number;
  latestVolume: number;
  prevVolume: number;
  volumeChangePercent: number;
  historyPoints: { date: string; maxWeight: number; totalVolume: number; estimatedOneRM: number }[];
}

export interface MuscleVolumeDistribution {
  muscleGroup: MuscleGroup;
  volume: number;
  sets: number;
  percentage: number;
}

export interface MonthlySummary {
  workoutsCompleted: number;
  totalVolume: number;
  totalSets: number;
  totalReps: number;
  mostActiveDay: string;
  mostActiveDayCount: number;
  mostFrequentExercise?: { id: string; name: string; count: number };
}

export interface AdvancedInsights {
  strongestImprovingExercise?: { id: string; name: string; pctIncrease: number };
  longestStagnantExercise?: { id: string; name: string; daysStagnant: number };
  mostFrequentMuscle?: { muscle: MuscleGroup; count: number };
  leastFrequentMuscle?: { muscle: MuscleGroup; count: number };
  avgWorkoutsPerWeek: number;
  avgRestDays: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  isUnlocked: boolean;
  progress: number; // percentage
  targetLabel: string;
}

export const useWorkoutAnalytics = () => {
  const { history, prs, exercises, restDaysOfWeek = [] } = useWorkout();
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('');

  // 1. Overall Stats
  const overallStats = useMemo<OverallStats>(() => {
    let totalSets = 0;
    let totalReps = 0;
    let totalVolume = 0;

    for (const session of history) {
      for (const logEx of session.exercises) {
        for (const set of logEx.sets) {
          totalSets++;
          totalReps += set.reps;
          totalVolume += set.weight * set.reps;
        }
      }
    }

    // Streak calculations
    const historyDates = new Set(history.map((s) => s.date.split('T')[0]));
    const activeDates: string[] = [];

    if (historyDates.size > 0) {
      const datesList = Array.from(historyDates).sort();
      const firstDate = new Date(datesList[0]);
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      
      const checkDate = new Date(firstDate);
      while (true) {
        const dateStr = checkDate.toISOString().split('T')[0];
        if (dateStr > todayStr) break;
        
        const dayOfWeek = checkDate.getDay();
        const isWorkout = historyDates.has(dateStr);
        const isRest = restDaysOfWeek.includes(dayOfWeek);
        
        if (isWorkout || isRest) {
          activeDates.push(dateStr);
        }
        
        checkDate.setDate(checkDate.getDate() + 1);
      }
    }
    
    let longestStreak = 0;
    let tempStreak = 0;
    for (let i = 0; i < activeDates.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const prevDate = new Date(activeDates[i - 1]);
        const currDate = new Date(activeDates[i]);
        const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          tempStreak++;
        } else if (diffDays > 1) {
          if (tempStreak > longestStreak) longestStreak = tempStreak;
          tempStreak = 1;
        }
      }
    }
    if (tempStreak > longestStreak) longestStreak = tempStreak;

    // Current Streak (ending today or yesterday)
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const datesSet = new Set(activeDates);
    let currentStreak = 0;
    const checkDateStr = datesSet.has(todayStr) ? todayStr : (datesSet.has(yesterdayStr) ? yesterdayStr : null);

    if (checkDateStr) {
      const checkDate = new Date(checkDateStr);
      while (datesSet.has(checkDate.toISOString().split('T')[0])) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      }
    }

    return {
      totalWorkouts: history.length,
      totalSets,
      totalReps,
      totalVolume,
      currentStreak,
      longestStreak,
    };
  }, [history, restDaysOfWeek]);

  // 2. Personal Records (PRs)
  const prDisplayList = useMemo<PRDisplay[]>(() => {
    const latestSessionDate = history.length > 0 ? history[0].date.split('T')[0] : '';
    return prs.map((pr) => {
      const ex = exercises.find((e) => e.id === pr.exerciseId);
      const prDateStr = pr.date.split('T')[0];
      return {
        exerciseId: pr.exerciseId,
        exerciseName: ex?.name || 'Unknown Exercise',
        muscleGroup: (ex?.muscleGroup === 'Abs & Shoulders' ? (SHOULDER_EXERCISE_IDS.has(pr.exerciseId) ? 'Shoulders' : 'Abs') : ex?.muscleGroup) || 'Other',
        weight: pr.weight,
        reps: pr.reps,
        date: pr.date,
        estimatedOneRM: pr.estimatedOneRM,
        isNew: prDateStr === latestSessionDate,
      };
    }).sort((a, b) => b.estimatedOneRM - a.estimatedOneRM);
  }, [prs, history, exercises]);

  // 3. Exercise Progress Comparison for selected exercise
  const exerciseComparison = useMemo<ExerciseComparison | null>(() => {
    if (!selectedExerciseId) return null;

    // Get all sessions containing this exercise, ordered by date ascending
    const exSessions = history
      .filter((s) => s.exercises.some((e) => e.exerciseId === selectedExerciseId))
      .map((s) => {
        const logEx = s.exercises.find((e) => e.exerciseId === selectedExerciseId)!;
        let vol = 0;
        let maxW = 0;
        let maxR = 0;
        let max1RM = 0;
        for (const set of logEx.sets) {
          vol += set.weight * set.reps;
          if (set.weight > maxW) maxW = set.weight;
          if (set.reps > maxR) maxR = set.reps;
          const e1rm = Math.round(set.weight * (1 + set.reps / 30));
          if (e1rm > max1RM) max1RM = e1rm;
        }
        return {
          date: s.date,
          maxWeight: maxW,
          maxReps: maxR,
          volume: vol,
          estimatedOneRM: max1RM,
        };
      })
      .reverse(); // history is desc (newest first), so reverse to make it asc (oldest first)

    if (exSessions.length === 0) {
      return {
        latestMaxWeight: 0,
        prevMaxWeight: 0,
        weightChangePercent: 0,
        latestMaxReps: 0,
        prevMaxReps: 0,
        repsChangePercent: 0,
        latestVolume: 0,
        prevVolume: 0,
        volumeChangePercent: 0,
        historyPoints: [],
      };
    }

    const latest = exSessions[exSessions.length - 1];
    const prev = exSessions.length >= 2 ? exSessions[exSessions.length - 2] : null;

    const calcChange = (cur: number, p: number) => {
      if (p === 0) return 0;
      return Number((((cur - p) / p) * 100).toFixed(1));
    };

    return {
      latestWorkoutDate: latest.date,
      previousWorkoutDate: prev?.date,
      latestMaxWeight: latest.maxWeight,
      prevMaxWeight: prev?.maxWeight || 0,
      weightChangePercent: prev ? calcChange(latest.maxWeight, prev.maxWeight) : 0,
      latestMaxReps: latest.maxReps,
      prevMaxReps: prev?.maxReps || 0,
      repsChangePercent: prev ? calcChange(latest.maxReps, prev.maxReps) : 0,
      latestVolume: latest.volume,
      prevVolume: prev?.volume || 0,
      volumeChangePercent: prev ? calcChange(latest.volume, prev.volume) : 0,
      historyPoints: exSessions.map((pt) => ({
        date: pt.date,
        maxWeight: pt.maxWeight,
        totalVolume: pt.volume,
        estimatedOneRM: pt.estimatedOneRM,
      })),
    };
  }, [selectedExerciseId, history]);

  // 4. Muscle Group Analysis (Weekly / Monthly / All-time Distribution)
  const muscleGroupDistribution = useMemo(() => {
    const calculateDistributionForPeriod = (days?: number) => {
      const cutoff = days ? new Date(Date.now() - days * 24 * 60 * 60 * 1000) : null;
      const filteredHistory = cutoff
        ? history.filter((s) => new Date(s.date) >= cutoff)
        : history;

      const volumeMap: Record<string, number> = {};
      const setsMap: Record<string, number> = {};
      let totalPeriodVolume = 0;

      for (const session of filteredHistory) {
        for (const logEx of session.exercises) {
          const ex = exercises.find((e) => e.id === logEx.exerciseId);
          if (ex) {
            let muscle = ex.muscleGroup;
            if (muscle === 'Abs & Shoulders') {
              // Separate them if we want them shown independently everywhere else
              muscle = SHOULDER_EXERCISE_IDS.has(ex.id) ? 'Shoulders' : 'Abs';
            }
            let exVol = 0;
            for (const set of logEx.sets) {
              exVol += set.weight * set.reps;
              setsMap[muscle] = (setsMap[muscle] || 0) + 1;
            }
            volumeMap[muscle] = (volumeMap[muscle] || 0) + exVol;
            totalPeriodVolume += exVol;
          }
        }
      }

      const list: MuscleVolumeDistribution[] = [];
      for (const muscle of ['Chest', 'Triceps', 'Biceps', 'Back', 'Legs', 'Abs', 'Shoulders'] as MuscleGroup[]) {
        const vol = volumeMap[muscle] || 0;
        const sets = setsMap[muscle] || 0;
        const pct = totalPeriodVolume > 0 ? (vol / totalPeriodVolume) * 100 : 0;
        list.push({
          muscleGroup: muscle,
          volume: vol,
          sets,
          percentage: Number(pct.toFixed(1)),
        });
      }
      return list;
    };

    const weekly = calculateDistributionForPeriod(7);
    const monthly = calculateDistributionForPeriod(30);
    const allTime = calculateDistributionForPeriod();

    // Find most and least trained (All time)
    const sortedAllTime = [...allTime].sort((a, b) => b.volume - a.volume);
    const mostTrained = sortedAllTime.length > 0 && sortedAllTime[0].volume > 0 ? sortedAllTime[0].muscleGroup : undefined;
    const leastTrained = sortedAllTime.length > 0 ? sortedAllTime[sortedAllTime.length - 1].muscleGroup : undefined;

    return {
      weekly,
      monthly,
      allTime,
      mostTrained,
      leastTrained,
    };
  }, [history, exercises]);

  // 5. Monthly Summary
  const monthlySummary = useMemo<MonthlySummary>(() => {
    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = now.getMonth();

    const thisMonthSessions = history.filter((s) => {
      const d = new Date(s.date);
      return d.getFullYear() === curYear && d.getMonth() === curMonth;
    });

    let totalVolume = 0;
    let totalSets = 0;
    let totalReps = 0;

    // Group workouts by day of the week
    const weekdayCounts: Record<string, number> = {
      Sunday: 0, Monday: 0, Tuesday: 0, Wednesday: 0, Thursday: 0, Friday: 0, Saturday: 0
    };
    
    // Group exercise occurrences this month
    const exerciseCountMap: Record<string, number> = {};

    for (const session of thisMonthSessions) {
      const dayName = new Date(session.date).toLocaleDateString('en-US', { weekday: 'long' });
      weekdayCounts[dayName] = (weekdayCounts[dayName] || 0) + 1;

      for (const logEx of session.exercises) {
        exerciseCountMap[logEx.exerciseId] = (exerciseCountMap[logEx.exerciseId] || 0) + logEx.sets.length;
        for (const set of logEx.sets) {
          totalSets++;
          totalReps += set.reps;
          totalVolume += set.weight * set.reps;
        }
      }
    }

    // Most active day of week (all-time)
    const allTimeWeekdayCounts: Record<string, number> = {
      Sunday: 0, Monday: 0, Tuesday: 0, Wednesday: 0, Thursday: 0, Friday: 0, Saturday: 0
    };
    for (const session of history) {
      const dayName = new Date(session.date).toLocaleDateString('en-US', { weekday: 'long' });
      allTimeWeekdayCounts[dayName] = (allTimeWeekdayCounts[dayName] || 0) + 1;
    }

    let mostActiveDay = 'None';
    let mostActiveDayCount = 0;
    for (const [day, count] of Object.entries(allTimeWeekdayCounts)) {
      if (count > mostActiveDayCount) {
        mostActiveDay = day;
        mostActiveDayCount = count;
      }
    }

    // Top exercise this month
    let topEx: { id: string; name: string; count: number } | undefined;
    let maxSetsCount = 0;
    for (const [exId, count] of Object.entries(exerciseCountMap)) {
      if (count > maxSetsCount) {
        const ex = exercises.find((e) => e.id === exId);
        maxSetsCount = count;
        topEx = {
          id: exId,
          name: ex?.name || 'Unknown',
          count,
        };
      }
    }

    return {
      workoutsCompleted: thisMonthSessions.length,
      totalVolume,
      totalSets,
      totalReps,
      mostActiveDay,
      mostActiveDayCount,
      mostFrequentExercise: topEx,
    };
  }, [history, exercises]);

  // 6. Advanced Insights
  const advancedInsights = useMemo<AdvancedInsights>(() => {
    let strongestImproving: { id: string; name: string; pctIncrease: number } | undefined;
    let maxImprovementPct = -999;

    let longestStagnant: { id: string; name: string; daysStagnant: number } | undefined;
    let maxStagnationDays = -1;

    const exerciseSessionsMap: Record<string, { date: string; max1RM: number }[]> = {};
    for (const session of history) {
      const sDate = session.date;
      for (const logEx of session.exercises) {
        const exId = logEx.exerciseId;
        let max1RM = 0;
        for (const set of logEx.sets) {
          const e1rm = set.weight * (1 + set.reps / 30);
          if (e1rm > max1RM) max1RM = e1rm;
        }
        if (!exerciseSessionsMap[exId]) exerciseSessionsMap[exId] = [];
        exerciseSessionsMap[exId].push({ date: sDate, max1RM });
      }
    }

    for (const [exId, sessList] of Object.entries(exerciseSessionsMap)) {
      if (sessList.length < 2) continue;

      const sortedSess = [...sessList].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      const first1RM = sortedSess[0].max1RM;
      const last1RM = sortedSess[sortedSess.length - 1].max1RM;
      if (first1RM > 0) {
        const pctIncrease = ((last1RM - first1RM) / first1RM) * 100;
        if (pctIncrease > maxImprovementPct) {
          maxImprovementPct = pctIncrease;
          const ex = exercises.find((e) => e.id === exId);
          strongestImproving = {
            id: exId,
            name: ex?.name || 'Unknown',
            pctIncrease: Number(pctIncrease.toFixed(1)),
          };
        }
      }

      // Stagnation calculation
      let best1RM = 0;
      let bestDate = new Date(sortedSess[0].date);
      for (const s of sortedSess) {
        if (s.max1RM > best1RM) {
          best1RM = s.max1RM;
          bestDate = new Date(s.date);
        }
      }
      
      const latestWorkoutDate = new Date(sortedSess[sortedSess.length - 1].date);
      const diffMs = latestWorkoutDate.getTime() - bestDate.getTime();
      const stagnantDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
      
      if (stagnantDays > maxStagnationDays) {
        maxStagnationDays = stagnantDays;
        const ex = exercises.find((e) => e.id === exId);
        longestStagnant = {
          id: exId,
          name: ex?.name || 'Unknown',
          daysStagnant: stagnantDays,
        };
      }
    }

    const allTimeSets = muscleGroupDistribution.allTime;
    const sortedSets = [...allTimeSets].sort((a, b) => b.sets - a.sets);
    
    const mostFrequentMuscle = sortedSets.length > 0 && sortedSets[0].sets > 0
      ? { muscle: sortedSets[0].muscleGroup, count: sortedSets[0].sets }
      : undefined;

    const activeSortedSets = sortedSets.filter(s => s.sets > 0);
    const leastFrequentMuscle = activeSortedSets.length > 0
      ? { muscle: activeSortedSets[activeSortedSets.length - 1].muscleGroup, count: activeSortedSets[activeSortedSets.length - 1].sets }
      : undefined;

    let avgWorkoutsPerWeek = 0;
    if (history.length > 0) {
      const oldestSess = new Date(history[history.length - 1].date);
      const newestSess = new Date(history[0].date);
      const diffWeeks = Math.max(1, (newestSess.getTime() - oldestSess.getTime()) / (1000 * 60 * 60 * 24 * 7));
      avgWorkoutsPerWeek = Number((history.length / diffWeeks).toFixed(1));
    }

    let avgRestDays = 0;
    if (history.length >= 2) {
      const uniqueSortedDates = Array.from(new Set(history.map(s => s.date.split('T')[0])))
        .map(d => new Date(d))
        .sort((a, b) => a.getTime() - b.getTime());

      let totalRestDiff = 0;
      for (let i = 1; i < uniqueSortedDates.length; i++) {
        const diffMs = uniqueSortedDates[i].getTime() - uniqueSortedDates[i - 1].getTime();
        totalRestDiff += Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24)) - 1);
      }
      avgRestDays = Number((totalRestDiff / (uniqueSortedDates.length - 1)).toFixed(1));
    }

    return {
      strongestImprovingExercise: maxImprovementPct > 0 ? strongestImproving : undefined,
      longestStagnantExercise: maxStagnationDays > 0 ? longestStagnant : undefined,
      mostFrequentMuscle,
      leastFrequentMuscle,
      avgWorkoutsPerWeek,
      avgRestDays,
    };
  }, [history, exercises, muscleGroupDistribution]);

  // 7. Achievements
  const achievements = useMemo<Achievement[]>(() => {
    const list: Achievement[] = [];
    const totalVolume = overallStats.totalVolume;
    const workouts = history.length;
    const longestStreak = overallStats.longestStreak;
    const prsCount = prs.length;

    let activeDaysSpan = 0;
    if (history.length >= 2) {
      const dates = history.map(s => new Date(s.date).getTime());
      const minDate = Math.min(...dates);
      const maxDate = Math.max(...dates);
      const diffMs = maxDate - minDate;
      activeDaysSpan = Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1;
    } else if (history.length === 1) {
      activeDaysSpan = 1;
    }

    const addAchievement = (id: string, title: string, description: string, isUnlocked: boolean, progress: number, targetLabel: string) => {
      list.push({ id, title, description, isUnlocked, progress: Math.min(100, Math.round(progress)), targetLabel });
    };

    addAchievement('wo-1', 'First Steps', 'Complete your first workout session', workouts >= 1, workouts >= 1 ? 100 : 0, '1 workout');
    addAchievement('wo-10', 'Dedicated Lifter', 'Complete 10 workout sessions', workouts >= 10, (workouts / 10) * 100, '10 workouts');
    addAchievement('wo-25', 'Habit Builder', 'Complete 25 workout sessions', workouts >= 25, (workouts / 25) * 100, '25 workouts');
    addAchievement('wo-50', 'Gym Warrior', 'Complete 50 workout sessions', workouts >= 50, (workouts / 50) * 100, '50 workouts');
    addAchievement('wo-75', 'Seasoned Athlete', 'Complete 75 workout sessions', workouts >= 75, (workouts / 75) * 100, '75 workouts');
    addAchievement('wo-100', 'Elite Athlete', 'Complete 100 workout sessions', workouts >= 100, (workouts / 100) * 100, '100 workouts');
    addAchievement('wo-150', 'Century & Beyond', 'Complete 150 workout sessions', workouts >= 150, (workouts / 150) * 100, '150 workouts');

    addAchievement('st-7', 'Weekly Rhythm', 'Achieve a 7-day workout streak', longestStreak >= 7, (longestStreak / 7) * 100, '7 days');
    addAchievement('st-30', 'Iron Consistency', 'Achieve a 30-day workout streak', longestStreak >= 30, (longestStreak / 30) * 100, '30 days');

    addAchievement('st-30-span', 'Habit Pioneer', 'Train across a 30-day span', activeDaysSpan >= 30, (activeDaysSpan / 30) * 100, '30 days');
    addAchievement('st-60-span', 'Consistent Journey', 'Train across a 60-day span', activeDaysSpan >= 60, (activeDaysSpan / 60) * 100, '60 days');
    addAchievement('st-90-span', 'Three-Month Lifestyle', 'Train consistently for 3 months', activeDaysSpan >= 90, (activeDaysSpan / 90) * 100, '90 days');

    addAchievement('pr-1', 'Breaking Limits', 'Record your first Personal Record', prsCount >= 1, prsCount >= 1 ? 100 : 0, '1 PR');
    addAchievement('pr-10', 'Record Collector', 'Record 10 unique Personal Records', prsCount >= 10, (prsCount / 10) * 100, '10 PRs');
    addAchievement('pr-20', 'PR Enthusiast', 'Record 20 unique Personal Records', prsCount >= 20, (prsCount / 20) * 100, '20 PRs');
    addAchievement('pr-40', 'PR Titan', 'Record 40 unique Personal Records', prsCount >= 40, (prsCount / 40) * 100, '40 PRs');

    addAchievement('vol-5k', 'Iron Initiate', 'Reach 5,000 kg of total training volume', totalVolume >= 5000, (totalVolume / 5000) * 100, '5k kg');
    addAchievement('vol-25k', 'Bronze Beast', 'Reach 25,000 kg of total training volume', totalVolume >= 25000, (totalVolume / 25000) * 100, '25k kg');
    addAchievement('vol-100k', 'Silver Titan', 'Reach 100,000 kg of total training volume', totalVolume >= 100000, (totalVolume / 100000) * 100, '100k kg');
    addAchievement('vol-500k', 'Golden God', 'Reach 500,000 kg of total training volume', totalVolume >= 500000, (totalVolume / 500000) * 100, '500k kg');
    addAchievement('vol-1m', 'Iron Millionaire', 'Reach 1,000,000 kg of total training volume', totalVolume >= 1000000, (totalVolume / 1000000) * 100, '1M kg');

    return list;
  }, [overallStats, history, prs]);

  const frequentExercises = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const session of history) {
      for (const logEx of session.exercises) {
        counts[logEx.exerciseId] = (counts[logEx.exerciseId] || 0) + logEx.sets.length;
      }
    }
    return Object.entries(counts)
      .map(([id, count]) => {
        const ex = exercises.find(e => e.id === id);
        return {
          exerciseId: id,
          name: ex?.name || 'Unknown Exercise',
          muscleGroup: ex?.muscleGroup || 'Other',
          count,
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  }, [history, exercises]);

  return {
    overallStats,
    prs: prDisplayList,
    exerciseComparison,
    selectedExerciseId,
    setSelectedExerciseId,
    muscleGroupDistribution,
    monthlySummary,
    advancedInsights,
    achievements,
    exercises,
    frequentExercises,
  };
};
