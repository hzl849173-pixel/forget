import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useWorkoutAnalytics } from '../../hooks/use-workout-analytics';
import { useWorkout } from '../../hooks/use-workout-storage';
import { usePostWorkoutValidation } from './usePostWorkoutValidation';
import { useProgressCommandCenter } from './useProgressCommandCenter';
import { PostWorkoutValidationCard } from './PostWorkoutValidationCard';
import { MuscleReadinessCard } from './MuscleReadinessCard';
import { MilestoneCountdownCard } from './MilestoneCountdownCard';
import { PersonalRecordsView } from './PersonalRecordsView';

interface ProgressDashboardProps {
  initialModalTab?: 'overview' | 'analytics' | 'milestones' | null;
  onClearInitialTab?: () => void;
  onStartWorkout?: () => void;
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({
  onStartWorkout,
}) => {
  const { prs, exercises } = useWorkoutAnalytics();
  const { history } = useWorkout();

  // 1. Post-workout validation & encouragement intelligence
  const validation = usePostWorkoutValidation(history, exercises);

  // 2. Readiness and next milestone data
  const { muscleReadiness, readinessSummary, milestones, upcomingRoutine } = useProgressCommandCenter(history, exercises);

  return (
    <View style={styles.container}>
      {/* 1. Post-Workout Validation & Dopamine Card */}
      <PostWorkoutValidationCard validation={validation} />

      {/* 2. Visual Muscle Recovery & Repair Battery Chart (Red / Amber / Green) */}
      <MuscleReadinessCard
        readinessList={muscleReadiness}
        summary={readinessSummary}
      />

      {/* 3. Next Habit-Learned Routine Targets with 12-Rep Double Progression */}
      <MilestoneCountdownCard
        routine={upcomingRoutine}
        milestones={milestones}
        onStartWorkout={onStartWorkout}
      />

      {/* 4. Unified Personal Records Board */}
      <PersonalRecordsView prs={prs} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 6,
    gap: 0,
  },
});
