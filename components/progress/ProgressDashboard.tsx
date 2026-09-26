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
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = () => {
  const { prs, exercises } = useWorkoutAnalytics();
  const { history } = useWorkout();

  // 1. Post-workout validation & encouragement intelligence
  const validation = usePostWorkoutValidation(history, exercises);

  // 2. Readiness and next milestone data
  const { muscleReadiness, readinessSummary, milestones } = useProgressCommandCenter(history, exercises);

  return (
    <View style={styles.container}>
      {/* 1. Post-Workout Validation & Dopamine Card */}
      <PostWorkoutValidationCard validation={validation} />

      {/* 2. Visual Muscle Recovery & Repair Battery Chart (Red / Amber / Green) */}
      <MuscleReadinessCard
        readinessList={muscleReadiness}
        summary={readinessSummary}
      />

      {/* 3. Next Strength Milestone Targets with Progress Bars */}
      <MilestoneCountdownCard milestones={milestones} />

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
