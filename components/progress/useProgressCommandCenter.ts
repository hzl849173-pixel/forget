import { useMemo } from 'react';
import { WorkoutSession, Exercise } from '../../hooks/use-workout-storage';
import { MuscleGroup } from '../../constants/exercises';

export interface MuscleReadiness {
  muscle: MuscleGroup;
  percentage: number; // 0 - 100
  status: 'Reloaded' | 'Recovering' | 'Fatigued';
  color: string;
  hoursAgo: number;
  daysAgo: number;
  lastTrainedLabel: string;
  lastSets: number;
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
          color: '#10B981',
          hoursAgo: 999,
          daysAgo: 999,
          lastTrainedLabel: 'Ready to train',
          lastSets: 0,
        };
      }

      const diffMs = now - new Date(latestSession.date).getTime();
      const hoursAgo = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));
      const daysAgo = Math.floor(hoursAgo / 24);

      let percentage = 100;
      let status: 'Reloaded' | 'Recovering' | 'Fatigued' = 'Reloaded';
      let color = '#10B981';

      if (hoursAgo < 24) {
        percentage = Math.min(55, Math.max(25, Math.round(25 + (hoursAgo / 24) * 30)));
        status = 'Fatigued';
        color = '#EF4444'; // Red
      } else if (hoursAgo < 48) {
        percentage = Math.min(90, Math.max(60, Math.round(60 + ((hoursAgo - 24) / 24) * 30)));
        status = 'Recovering';
        color = '#F59E0B'; // Amber
      } else {
        percentage = 100;
        status = 'Reloaded';
        color = '#10B981'; // Emerald
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
        color,
        hoursAgo,
        daysAgo,
        lastTrainedLabel,
        lastSets: lastSetsCount,
      };
    });
  }, [history, exercises]);

  // Overall readiness recommendation
  const readinessSummary = useMemo(() => {
    const readyMuscles = muscleReadiness.filter((m) => m.percentage >= 95);
    if (readyMuscles.length === 0) {
      return {
        title: 'Rest & Recover',
        subtitle: 'Muscles are repairing. A rest day or light cardio is optimal.',
        isRestRecommended: true,
      };
    }
    const names = readyMuscles.map((m) => m.muscle).join(', ');
    return {
      title: `${readyMuscles[0].muscle} Primed`,
      subtitle: `${names} ${readyMuscles.length === 1 ? 'is' : 'are'} 100% reloaded and ready to train.`,
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
    strengthTiers,
    recentWins,
  };
};
