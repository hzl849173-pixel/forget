import { useMemo } from 'react';
import { WorkoutSession, Exercise } from '../../hooks/use-workout-storage';

export interface ExerciseOverloadCheck {
  exerciseId: string;
  exerciseName: string;
  muscleGroup: string;
  weight: number;
  reps: number;
  prevWeight: number;
  prevReps: number;
  isOverload: boolean;
  overloadText: string;
  isNewPr: boolean;
}

export interface PostWorkoutValidation {
  hasHistory: boolean;
  latestSessionName: string;
  latestSessionDateFormatted: string;
  isTodayOrYesterday: boolean;
  totalSetsInSession: number;
  totalVolumeInSession: number;
  headline: string;
  badgeLabel: string;
  badgeColor: string;
  motivationalMessage: string;
  overloadExercises: ExerciseOverloadCheck[];
  overloadCount: number;
  standoutLift: ExerciseOverloadCheck | null;
  primedMusclesForTomorrow: string[];
}

export const usePostWorkoutValidation = (
  history: WorkoutSession[],
  exercises: Exercise[]
): PostWorkoutValidation => {
  return useMemo(() => {
    if (!history || history.length === 0) {
      return {
        hasHistory: false,
        latestSessionName: '',
        latestSessionDateFormatted: '',
        isTodayOrYesterday: false,
        totalSetsInSession: 0,
        totalVolumeInSession: 0,
        headline: 'Ready for Your Next Breakthrough',
        badgeLabel: 'START LOGGING',
        badgeColor: '#10B981',
        motivationalMessage: 'Log your session today. Your overload confirmation, recovery breakdown, and growth metrics unlock here.',
        overloadExercises: [],
        overloadCount: 0,
        standoutLift: null,
        primedMusclesForTomorrow: ['Chest', 'Back', 'Legs'],
      };
    }

    // Sort history descending by date
    const sorted = [...history].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const latest = sorted[0];
    const latestDate = new Date(latest.date);
    const now = new Date();
    const diffHours = (now.getTime() - latestDate.getTime()) / (1000 * 60 * 60);
    const isTodayOrYesterday = diffHours < 48;

    let totalSetsInSession = 0;
    let totalVolumeInSession = 0;

    const overloadChecks: ExerciseOverloadCheck[] = [];

    // For each exercise in latest session, find its prior session in sorted[1..]
    latest.exercises.forEach((logEx) => {
      const details = exercises.find((e) => e.id === logEx.exerciseId);
      const exName = details?.name || 'Workout';
      const muscle = details?.muscleGroup || 'Full Body';

      // Find top set in this session
      let topSet = logEx.sets[0];
      for (const s of logEx.sets) {
        totalSetsInSession++;
        totalVolumeInSession += s.weight * s.reps;
        if (s.weight > (topSet?.weight || 0)) {
          topSet = s;
        }
      }

      if (!topSet) return;

      // Find previous session with this exercise
      let prevTopSet: { weight: number; reps: number } | null = null;
      for (let i = 1; i < sorted.length; i++) {
        const pastSession = sorted[i];
        const match = pastSession.exercises.find((e) => e.exerciseId === logEx.exerciseId);
        if (match && match.sets.length > 0) {
          let pastBest = match.sets[0];
          for (const ps of match.sets) {
            if (ps.weight > pastBest.weight) pastBest = ps;
          }
          prevTopSet = { weight: pastBest.weight, reps: pastBest.reps };
          break;
        }
      }

      // Check all-time prior sessions to see if this is an all-time PR
      let allTimePriorMaxWeight = 0;
      for (let i = 1; i < sorted.length; i++) {
        const pastEx = sorted[i].exercises.find((e) => e.exerciseId === logEx.exerciseId);
        if (pastEx) {
          for (const s of pastEx.sets) {
            if (s.weight > allTimePriorMaxWeight) allTimePriorMaxWeight = s.weight;
          }
        }
      }

      const isNewPr = allTimePriorMaxWeight > 0 && topSet.weight > allTimePriorMaxWeight;

      let isOverload = false;
      let overloadText = 'Solid Work';

      if (prevTopSet) {
        if (topSet.weight > prevTopSet.weight) {
          isOverload = true;
          const diff = (topSet.weight - prevTopSet.weight).toFixed(1).replace(/\.0$/, '');
          overloadText = `+${diff} kg heavier`;
        } else if (topSet.weight === prevTopSet.weight && topSet.reps > prevTopSet.reps) {
          isOverload = true;
          const diffReps = topSet.reps - prevTopSet.reps;
          overloadText = `+${diffReps} rep${diffReps > 1 ? 's' : ''}`;
        } else if (topSet.weight === prevTopSet.weight && topSet.reps === prevTopSet.reps) {
          overloadText = 'Matched previous';
        } else {
          overloadText = `${topSet.weight} kg × ${topSet.reps}`;
        }
      } else {
        // First time logging this exercise
        isOverload = true;
        overloadText = 'Baseline Established';
      }

      overloadChecks.push({
        exerciseId: logEx.exerciseId,
        exerciseName: exName,
        muscleGroup: muscle,
        weight: topSet.weight,
        reps: topSet.reps,
        prevWeight: prevTopSet ? prevTopSet.weight : topSet.weight,
        prevReps: prevTopSet ? prevTopSet.reps : topSet.reps,
        isOverload,
        overloadText,
        isNewPr,
      });
    });

    const overloadCount = overloadChecks.filter((c) => c.isOverload).length;
    const hasAnyPr = overloadChecks.some((c) => c.isNewPr);

    // Pick standout lift
    const prLift = overloadChecks.find((c) => c.isNewPr);
    const overloadLift = overloadChecks.find((c) => c.isOverload && c.weight > 0);
    const standoutLift = prLift || overloadLift || (overloadChecks.length > 0 ? overloadChecks[0] : null);

    let headline = 'Progressive Overload Achieved';
    let badgeLabel = 'OVERLOAD CONFIRMED';
    let badgeColor = '#10B981';
    let motivationalMessage = `You beat your previous performance on ${overloadCount} exercise${overloadCount > 1 ? 's' : ''}. Strength is compounding.`;

    if (hasAnyPr) {
      headline = 'New Personal Record Broken';
      badgeLabel = 'PR BREAKTHROUGH';
      badgeColor = '#F59E0B';
      motivationalMessage = `You set an all-time record on ${prLift?.exerciseName || 'your lift'}. Your progressive overload is paying off.`;
    } else if (overloadCount === 0) {
      headline = 'Quality Training Volume Locked';
      badgeLabel = 'STIMULUS COMPLETED';
      badgeColor = '#3B82F6';
      motivationalMessage = `Completed ${totalSetsInSession} hard sets. Every rep builds neuromuscular adaptation for your next breakthrough.`;
    }

    const dateStr = latestDate.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });

    // Check which muscles have rested 48h+ and are primed for tomorrow
    const muscleLastSessionTime: Record<string, number> = {};
    for (const session of sorted) {
      const sTime = new Date(session.date).getTime();
      for (const le of session.exercises) {
        const ex = exercises.find((e) => e.id === le.exerciseId);
        if (ex && ex.muscleGroup) {
          if (!muscleLastSessionTime[ex.muscleGroup]) {
            muscleLastSessionTime[ex.muscleGroup] = sTime;
          }
        }
      }
    }

    const allMuscles = ['Chest', 'Back', 'Legs', 'Shoulders', 'Biceps', 'Triceps'];
    const primedMusclesForTomorrow = allMuscles.filter((m) => {
      const lastTrained = muscleLastSessionTime[m];
      if (!lastTrained) return true; // never trained or very old
      const hoursAgo = (now.getTime() - lastTrained) / (1000 * 60 * 60);
      return hoursAgo >= 40;
    }).slice(0, 3);

    return {
      hasHistory: true,
      latestSessionName: latest.name,
      latestSessionDateFormatted: dateStr,
      isTodayOrYesterday,
      totalSetsInSession,
      totalVolumeInSession: Math.round(totalVolumeInSession),
      headline,
      badgeLabel,
      badgeColor,
      motivationalMessage,
      overloadExercises: overloadChecks,
      overloadCount,
      standoutLift,
      primedMusclesForTomorrow,
    };
  }, [history, exercises]);
};
