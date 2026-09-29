import { useMemo } from 'react';
import { WorkoutSession, Exercise } from '../../hooks/use-workout-storage';
import { MuscleGroup } from '../../constants/exercises';

export interface MuscleReadiness {
  muscle: MuscleGroup;
  percentage: number; // 0 - 100
  status: 'Reloaded' | 'Recovering' | 'Fatigued' | 'Exhausted' | 'Primed';
  statusLabel: string;
  color: string;
  badgeBg: string;
  badgeText: string;
  hoursAgo: number;
  daysAgo: number;
  lastTrainedLabel: string;
  lastSets: number;
}

export interface RoutineExerciseTarget {
  exerciseId: string;
  exerciseName: string;
  muscleGroup: string;
  lastWeight: number;
  lastReps: number;
  targetWeight: number;
  targetReps: string;
  overloadType: 'weight' | 'reps' | 'solidified';
  badgeLabel: string;
  badgeColor: string;
  guidanceText: string;
  isSolidified?: boolean;
}

export interface UpcomingSessionRoutine {
  hasRoutines: boolean;
  isDayZero?: boolean;
  isWeekOne?: boolean;
  dayName: string;
  daySubtitle: string;
  isToday: boolean;
  targets: RoutineExerciseTarget[];
  splitName: string;
}

export interface MilestoneTarget {
  exerciseId: string;
  exerciseName: string;
  muscleGroup: string;
  currentMaxWeight: number;
  currentReps: number;
  targetWeight: number;
  weightNeeded: number;
  progressPercent: number;
}

export interface StrengthTier {
  category: 'Push' | 'Pull' | 'Legs';
  tierName: 'Beginner' | 'Novice' | 'Intermediate' | 'Advanced' | 'Elite';
  score: number;
  nextTierProgress: number; // 0 - 100
  color: string;
  keyLiftName?: string;
  keyLiftWeight?: number;
}

export interface RecentPRWin {
  exerciseId: string;
  exerciseName: string;
  muscleGroup: string;
  weight: number;
  reps: number;
  date: string;
  estimatedOneRM: number;
}

const TRACKED_MUSCLES: MuscleGroup[] = ['Chest', 'Back', 'Legs', 'Shoulders', 'Biceps', 'Triceps'];

export const useProgressCommandCenter = (
  history: WorkoutSession[],
  exercises: Exercise[]
) => {
  // 1. Muscle Readiness & Recovery Battery
  const muscleReadiness = useMemo<MuscleReadiness[]>(() => {
    const now = Date.now();

    return TRACKED_MUSCLES.map((muscle) => {
      // Find the most recent session containing this muscle
      let latestSession: WorkoutSession | null = null;
      let lastSetsCount = 0;

      for (const session of history) {
        let muscleSetsInSession = 0;
        for (const logEx of session.exercises) {
          const details = exercises.find((e) => e.id === logEx.exerciseId);
          if (details) {
            const isMatch =
              details.muscleGroup === muscle ||
              ((details.muscleGroup === 'Back & Shoulders' || details.muscleGroup === 'Abs & Shoulders') &&
                muscle === 'Shoulders');
            if (isMatch) {
              muscleSetsInSession += logEx.sets.length;
            }
          }
        }

        if (muscleSetsInSession > 0) {
          if (!latestSession || new Date(session.date).getTime() > new Date(latestSession.date).getTime()) {
            latestSession = session;
            lastSetsCount = muscleSetsInSession;
          }
        }
      }

      if (!latestSession) {
        return {
          muscle,
          percentage: 100,
          status: 'Reloaded',
          statusLabel: 'Reloaded',
          color: '#10B981',
          badgeBg: '#10B98115',
          badgeText: '#059669',
          hoursAgo: 999,
          daysAgo: 999,
          lastTrainedLabel: 'Ready to train',
          lastSets: 0,
        };
      }

      const diffMs = now - new Date(latestSession.date).getTime();
      const hoursAgo = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));
      const daysAgo = Math.floor(hoursAgo / 24);

      // Volume-aware recovery duration:
      // Baseline recovery duration is ~42 hours for moderate volume (4-6 sets).
      // Higher volume (8-12 sets) extends recovery up to 52 hours.
      // Lighter volume (1-3 sets) reloads faster in ~36 hours.
      const recoveryDurationHours = Math.min(
        52,
        Math.max(36, 42 + (lastSetsCount > 6 ? (lastSetsCount - 6) * 1.5 : (lastSetsCount < 4 ? -4 : 0)))
      );

      let percentage = 100;
      let status: MuscleReadiness['status'] = 'Reloaded';
      let statusLabel = 'Reloaded';
      let color = '#10B981';
      let badgeBg = '#10B98115';
      let badgeText = '#059669';

      if (hoursAgo < recoveryDurationHours) {
        // Continuous, smooth percentage climbing from 25% up to 98%
        const progressRatio = Math.min(0.98, Math.max(0, hoursAgo / recoveryDurationHours));
        // Biological curve: slightly faster initial neuromuscular repair, smooth taper
        percentage = Math.round(25 + 73 * Math.pow(progressRatio, 0.85));

        if (percentage < 35) {
          status = 'Exhausted';
          statusLabel = 'Exhausted';
          color = '#EF4444'; // Deep Red
          badgeBg = '#EF444415';
          badgeText = '#DC2626';
        } else if (percentage < 55) {
          status = 'Fatigued';
          statusLabel = 'Repairing';
          color = '#F97316'; // Warm Orange
          badgeBg = '#F9731615';
          badgeText = '#EA580C';
        } else if (percentage < 75) {
          status = 'Recovering';
          statusLabel = 'Rebuilding';
          color = '#F59E0B'; // Amber Gold
          badgeBg = '#F59E0B15';
          badgeText = '#D97706';
        } else if (percentage < 95) {
          status = 'Primed';
          statusLabel = 'Almost Ready';
          color = '#84CC16'; // Lime Green
          badgeBg = '#84CC1615';
          badgeText = '#65A30D';
        } else {
          status = 'Reloaded';
          statusLabel = 'Reloaded';
          color = '#10B981'; // Emerald Green
          badgeBg = '#10B98115';
          badgeText = '#059669';
        }
      } else {
        percentage = 100;
        status = 'Reloaded';
        statusLabel = 'Reloaded';
        color = '#10B981';
        badgeBg = '#10B98115';
        badgeText = '#059669';
      }

      let lastTrainedLabel = '';
      if (hoursAgo < 2) {
        lastTrainedLabel = 'Just now';
      } else if (hoursAgo < 24) {
        lastTrainedLabel = `${hoursAgo}h ago`;
      } else if (daysAgo === 1) {
        lastTrainedLabel = 'Yesterday';
      } else {
        lastTrainedLabel = `${daysAgo}d ago`;
      }

      return {
        muscle,
        percentage,
        status,
        statusLabel,
        color,
        badgeBg,
        badgeText,
        hoursAgo,
        daysAgo,
        lastTrainedLabel,
        lastSets: lastSetsCount,
      };
    });
  }, [history, exercises]);

  // Overall readiness recommendation
  const readinessSummary = useMemo(() => {
    const readyMuscles = muscleReadiness.filter((m) => m.percentage >= 90);
    if (readyMuscles.length === 0) {
      return {
        title: 'Rest & Repairing',
        subtitle: 'Muscles are actively repairing tissue. A rest day or light walk is optimal.',
        isRestRecommended: true,
      };
    }
    const names = readyMuscles.map((m) => m.muscle).join(', ');
    return {
      title: `${readyMuscles[0].muscle} Primed`,
      subtitle: `${names} ${readyMuscles.length === 1 ? 'is' : 'are'} reloaded and ready to train.`,
      isRestRecommended: false,
    };
  }, [muscleReadiness]);

  // 2. Next Milestone Countdown
  const milestones = useMemo<MilestoneTarget[]>(() => {
    // Find top lifts for each muscle
    const exerciseMaxes: Record<string, { maxWeight: number; maxReps: number; name: string; muscle: string }> = {};

    for (const session of history) {
      for (const logEx of session.exercises) {
        const details = exercises.find((e) => e.id === logEx.exerciseId);
        if (!details) continue;

        for (const set of logEx.sets) {
          if (set.weight > 0) {
            const current = exerciseMaxes[logEx.exerciseId];
            if (!current || set.weight > current.maxWeight) {
              exerciseMaxes[logEx.exerciseId] = {
                maxWeight: set.weight,
                maxReps: set.reps,
                name: details.name,
                muscle: details.muscleGroup,
              };
            }
          }
        }
      }
    }

    const list: MilestoneTarget[] = [];

    Object.entries(exerciseMaxes).forEach(([exId, data]) => {
      const cur = data.maxWeight;
      let target = 0;

      if (cur < 20) {
        target = Math.ceil((cur + 1) / 2.5) * 2.5;
      } else if (cur < 60) {
        target = Math.ceil((cur + 1) / 5) * 5;
      } else if (cur < 100) {
        target = Math.ceil((cur + 1) / 5) * 5;
        // Make 100kg a special landmark
        if (cur >= 90 && cur < 100) target = 100;
      } else if (cur < 140) {
        target = Math.ceil((cur + 1) / 10) * 10;
      } else {
        target = Math.ceil((cur + 1) / 10) * 10;
      }

      if (target <= cur) target = cur + 5;

      const weightNeeded = Number((target - cur).toFixed(1));
      const prevStep = Math.max(0, target - (target >= 100 ? 10 : 5));
      const progressPercent = Math.min(99, Math.max(10, Math.round(((cur - prevStep) / (target - prevStep)) * 100)));

      list.push({
        exerciseId: exId,
        exerciseName: data.name,
        muscleGroup: data.muscle,
        currentMaxWeight: cur,
        currentReps: data.maxReps,
        targetWeight: target,
        weightNeeded,
        progressPercent,
      });
    });

    // Sort by closest to hitting the milestone (highest progress)
    return list.sort((a, b) => b.progressPercent - a.progressPercent).slice(0, 3);
  }, [history, exercises]);

  // 2b. Intelligent Habit-Learned Upcoming Routine Targets (Double Progression with 12 Reps)
  const upcomingRoutine = useMemo<UpcomingSessionRoutine>(() => {
    if (!history || history.length === 0) {
      // Day 0: Brand new user with 0 workouts logged
      // No fake prescribed exercises - prompts the user to log their real workout
      return {
        hasRoutines: true,
        isDayZero: true,
        isWeekOne: false,
        dayName: 'TARGETS TO BEAT',
        daySubtitle: 'What to aim for next session',
        isToday: true,
        targets: [],
        splitName: 'Your Routine',
      };
    }

    const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const sortedHistory = [...history].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const isWeekOne = sortedHistory.length >= 1 && sortedHistory.length <= 3;

    const now = new Date();
    const todayYear = now.getFullYear();
    const todayMonth = now.getMonth();
    const todayDate = now.getDate();
    const todayDow = now.getDay();

    const hasWorkoutToday = sortedHistory.some((s) => {
      const d = new Date(s.date);
      return (
        d.getFullYear() === todayYear &&
        d.getMonth() === todayMonth &&
        d.getDate() === todayDate
      );
    });

    // 2-week rolling window (14 days)
    const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000;
    const recentSessions = sortedHistory.filter(
      (s) => now.getTime() - new Date(s.date).getTime() <= TWO_WEEKS_MS
    );

    // Group sessions by day of the week (0 = Sunday ... 6 = Saturday)
    const dayToRecentSessions: Record<number, WorkoutSession[]> = {};
    for (let i = 0; i < 7; i++) {
      dayToRecentSessions[i] = [];
    }
    recentSessions.forEach((s) => {
      const dow = new Date(s.date).getDay();
      dayToRecentSessions[dow].push(s);
    });

    // Determine target day of week
    let targetDow = -1;
    let isToday = false;
    let dayName = '';

    if (!hasWorkoutToday && dayToRecentSessions[todayDow].length > 0) {
      targetDow = todayDow;
      isToday = true;
      dayName = `TODAY'S (${DAYS[todayDow].toUpperCase()})`;
    } else {
      // Look forward through the week starting from tomorrow
      for (let offset = 1; offset <= 7; offset++) {
        const candidateDow = (todayDow + offset) % 7;
        if (dayToRecentSessions[candidateDow].length > 0) {
          targetDow = candidateDow;
          if (offset === 1) {
            dayName = `TOMORROW'S (${DAYS[candidateDow].toUpperCase()})`;
          } else if (candidateDow === todayDow) {
            dayName = `NEXT ${DAYS[candidateDow].toUpperCase()}`;
          } else {
            dayName = `NEXT ${DAYS[candidateDow].toUpperCase()}`;
          }
          break;
        }
      }

      // If no session found in the 2-week window, fall back to historical workouts
      if (targetDow === -1) {
        const fallbackDow = new Date(sortedHistory[0].date).getDay();
        targetDow = fallbackDow;
        dayName = `NEXT ${DAYS[fallbackDow].toUpperCase()}`;
      }
    }

    // Identify habitual exercises on targetDow
    // The most recent session on that day takes highest priority (adapts to habits changed in the last 2 weeks)
    const sessionsOnTargetDay =
      dayToRecentSessions[targetDow].length > 0
        ? dayToRecentSessions[targetDow]
        : sortedHistory.filter((s) => new Date(s.date).getDay() === targetDow);

    const primarySession = sessionsOnTargetDay.length > 0 ? sessionsOnTargetDay[0] : sortedHistory[0];

    // Collect candidate exercise IDs maintaining their workout order
    const orderedExIds: string[] = [];
    if (primarySession) {
      primarySession.exercises.forEach((e) => {
        if (!orderedExIds.includes(e.exerciseId)) {
          orderedExIds.push(e.exerciseId);
        }
      });
    }

    // Also include any other recurring exercises on this day in the 2-week window (up to 6 exercises)
    sessionsOnTargetDay.slice(1).forEach((sess) => {
      sess.exercises.forEach((e) => {
        if (!orderedExIds.includes(e.exerciseId) && orderedExIds.length < 6) {
          orderedExIds.push(e.exerciseId);
        }
      });
    });

    if (orderedExIds.length === 0) {
      return {
        hasRoutines: false,
        dayName: dayName || 'UPCOMING WORKOUT',
        daySubtitle: 'No exercises found for this day',
        isToday,
        targets: [],
        splitName: '',
      };
    }

    // Detect muscle split name
    const muscleCounts: Record<string, number> = {};
    orderedExIds.forEach((id) => {
      const det = exercises.find((e) => e.id === id);
      if (det && det.muscleGroup) {
        muscleCounts[det.muscleGroup] = (muscleCounts[det.muscleGroup] || 0) + 1;
      }
    });

    const topMuscles = Object.entries(muscleCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([m]) => m);

    let splitName = '';
    if (topMuscles.length === 1) {
      splitName = `${topMuscles[0]} Routine`;
    } else if (topMuscles.length >= 2) {
      splitName = `${topMuscles[0]} & ${topMuscles[1]} Routine`;
    } else {
      splitName = 'Target Routine';
    }

    // Compute Double Progression target per exercise (12-rep threshold)
    const targets: RoutineExerciseTarget[] = [];

    orderedExIds.forEach((exId) => {
      const details = exercises.find((e) => e.id === exId);
      const exName = details ? details.name : 'Exercise';
      const muscleGroup = details ? details.muscleGroup : 'All';

      // Find all sessions containing this exercise in descending date order
      const pastSessionsWithEx: { sessionDate: Date; topSet: { weight: number; reps: number } }[] = [];

      for (const session of sortedHistory) {
        const match = session.exercises.find((e) => e.exerciseId === exId);
        if (match && match.sets.length > 0) {
          let best = match.sets[0];
          for (const s of match.sets) {
            if (s.weight > best.weight || (s.weight === best.weight && s.reps > best.reps)) {
              best = s;
            }
          }
          if (best) {
            pastSessionsWithEx.push({
              sessionDate: new Date(session.date),
              topSet: { weight: best.weight, reps: best.reps },
            });
          }
        }
      }

      if (pastSessionsWithEx.length === 0) {
        targets.push({
          exerciseId: exId,
          exerciseName: exName,
          muscleGroup,
          lastWeight: 0,
          lastReps: 0,
          targetWeight: 0,
          targetReps: '8–12 reps',
          overloadType: 'reps',
          badgeLabel: 'BASELINE',
          badgeColor: '#6B7280',
          guidanceText: 'Establish your baseline weight and reps',
        });
        return;
      }

      const latest = pastSessionsWithEx[0].topSet;
      const prior = pastSessionsWithEx.length > 1 ? pastSessionsWithEx[1].topSet : null;

      // Check if performed twice within 10 days with same weight & reps (Consolidation)
      const isSolidified =
        prior !== null &&
        latest.weight === prior.weight &&
        latest.reps === prior.reps &&
        latest.weight > 0 &&
        Math.abs(pastSessionsWithEx[0].sessionDate.getTime() - pastSessionsWithEx[1].sessionDate.getTime()) <=
          10 * 24 * 60 * 60 * 1000;

      // 12-Rep Progressive Overload Rule:
      if (latest.reps >= 12) {
        // Mastered 12 reps! Upgrade weight
        const inc = latest.weight < 15 ? 1.25 : 2.5;
        const newWeight = latest.weight > 0 ? Number((latest.weight + inc).toFixed(1)) : 2.5;

        targets.push({
          exerciseId: exId,
          exerciseName: exName,
          muscleGroup,
          lastWeight: latest.weight,
          lastReps: latest.reps,
          targetWeight: newWeight,
          targetReps: '8–10 reps',
          overloadType: 'weight',
          badgeLabel: `+${inc} kg boost`,
          badgeColor: '#10B981',
          guidanceText: '',
          isSolidified,
        });
      } else {
        // Below 12 reps: Focus on reps at current weight
        let targetReps = '';
        let badgeLabel = '';
        let badgeColor = '#3B82F6';
        let overloadType: RoutineExerciseTarget['overloadType'] = 'reps';

        if (isSolidified) {
          overloadType = 'solidified';
          badgeLabel = 'solidified';
          badgeColor = '#8B5CF6';
          targetReps = `${latest.reps + 1}–${Math.min(12, latest.reps + 2)}`;
        } else if (latest.reps === 11) {
          targetReps = '12';
          badgeLabel = '+1 rep to cap';
          badgeColor = '#3B82F6';
        } else if (latest.reps === 10) {
          targetReps = '11–12';
          badgeLabel = '+1–2 reps';
          badgeColor = '#3B82F6';
        } else {
          const nextReps = Math.min(12, latest.reps + 2);
          targetReps = `${latest.reps + 1}–${nextReps}`;
          badgeLabel = '+1–2 reps';
          badgeColor = '#3B82F6';
        }

        targets.push({
          exerciseId: exId,
          exerciseName: exName,
          muscleGroup,
          lastWeight: latest.weight,
          lastReps: latest.reps,
          targetWeight: latest.weight,
          targetReps,
          overloadType,
          badgeLabel,
          badgeColor,
          guidanceText: '',
          isSolidified,
        });
      }
    });

    const routineSubtitle = `${splitName} · What to aim for next session`;

    return {
      hasRoutines: true,
      isDayZero: false,
      isWeekOne,
      dayName: 'TARGETS TO BEAT',
      daySubtitle: routineSubtitle,
      isToday,
      targets,
      splitName,
    };
  }, [history, exercises]);

  // 3. Strength Tiers (Push, Pull, Legs)
  const strengthTiers = useMemo<StrengthTier[]>(() => {
    let maxPush = 0;
    let pushName = 'Bench Press';
    let maxPull = 0;
    let pullName = 'Lat Pulldown';
    let maxLegs = 0;
    let legsName = 'Squat';

    for (const session of history) {
      for (const logEx of session.exercises) {
        const details = exercises.find((e) => e.id === logEx.exerciseId);
        if (!details) continue;

        for (const set of logEx.sets) {
          if (set.weight > 0 && set.reps > 0) {
            const e1RM = set.weight * (1 + set.reps / 30);
            if (details.muscleGroup === 'Chest' || details.muscleGroup === 'Triceps' || details.muscleGroup === 'Shoulders') {
              if (e1RM > maxPush) {
                maxPush = e1RM;
                pushName = details.name;
              }
            } else if (details.muscleGroup === 'Back' || details.muscleGroup === 'Biceps') {
              if (e1RM > maxPull) {
                maxPull = e1RM;
                pullName = details.name;
              }
            } else if (details.muscleGroup === 'Legs') {
              if (e1RM > maxLegs) {
                maxLegs = e1RM;
                legsName = details.name;
              }
            }
          }
        }
      }
    }

    const computeTier = (
      val: number,
      noviceMin: number,
      interMin: number,
      advMin: number,
      eliteMin: number
    ): { tier: StrengthTier['tierName']; progress: number } => {
      if (val < noviceMin) {
        return { tier: 'Beginner', progress: Math.min(100, Math.round((val / noviceMin) * 100)) };
      }
      if (val < interMin) {
        return { tier: 'Novice', progress: Math.min(100, Math.round(((val - noviceMin) / (interMin - noviceMin)) * 100)) };
      }
      if (val < advMin) {
        return { tier: 'Intermediate', progress: Math.min(100, Math.round(((val - interMin) / (advMin - interMin)) * 100)) };
      }
      if (val < eliteMin) {
        return { tier: 'Advanced', progress: Math.min(100, Math.round(((val - advMin) / (eliteMin - advMin)) * 100)) };
      }
      return { tier: 'Elite', progress: 100 };
    };

    const pushTier = computeTier(maxPush, 50, 80, 110, 140);
    const pullTier = computeTier(maxPull, 55, 85, 120, 150);
    const legsTier = computeTier(maxLegs, 60, 100, 140, 180);

    return [
      {
        category: 'Push',
        tierName: pushTier.tier,
        score: Math.round(maxPush),
        nextTierProgress: pushTier.progress,
        color: '#10B981',
        keyLiftName: pushName,
        keyLiftWeight: Math.round(maxPush),
      },
      {
        category: 'Pull',
        tierName: pullTier.tier,
        score: Math.round(maxPull),
        nextTierProgress: pullTier.progress,
        color: '#3B82F6',
        keyLiftName: pullName,
        keyLiftWeight: Math.round(maxPull),
      },
      {
        category: 'Legs',
        tierName: legsTier.tier,
        score: Math.round(maxLegs),
        nextTierProgress: legsTier.progress,
        color: '#FF8A00',
        keyLiftName: legsName,
        keyLiftWeight: Math.round(maxLegs),
      },
    ];
  }, [history, exercises]);

  // 4. Recent PR Wins Feed
  const recentWins = useMemo<RecentPRWin[]>(() => {
    // Sort all sessions by date descending
    const sorted = [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const seenExercises = new Set<string>();
    const wins: RecentPRWin[] = [];

    for (const session of sorted) {
      for (const logEx of session.exercises) {
        if (!seenExercises.has(logEx.exerciseId)) {
          seenExercises.add(logEx.exerciseId);
          let bestSet = logEx.sets[0];
          for (const s of logEx.sets) {
            if (s.weight > (bestSet?.weight || 0)) {
              bestSet = s;
            }
          }
          if (bestSet && bestSet.weight > 0) {
            const details = exercises.find((e) => e.id === logEx.exerciseId);
            if (details) {
              const e1RM = Math.round(bestSet.weight * (1 + bestSet.reps / 30));
              wins.push({
                exerciseId: logEx.exerciseId,
                exerciseName: details.name,
                muscleGroup: details.muscleGroup,
                weight: bestSet.weight,
                reps: bestSet.reps,
                date: session.date,
                estimatedOneRM: e1RM,
              });
            }
          }
        }
        if (wins.length >= 4) break;
      }
      if (wins.length >= 4) break;
    }

    return wins;
  }, [history, exercises]);

  return {
    muscleReadiness,
    readinessSummary,
    milestones,
    upcomingRoutine,
    strengthTiers,
    recentWins,
  };
};
