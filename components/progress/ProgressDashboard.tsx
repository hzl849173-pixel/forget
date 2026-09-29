import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useWorkoutAnalytics } from '../../hooks/use-workout-analytics';
import { useWorkout } from '../../hooks/use-workout-storage';
import { useProgressCommandCenter } from './useProgressCommandCenter';
import { MilestoneCountdownCard } from './MilestoneCountdownCard';
import { PersonalRecordsView } from './PersonalRecordsView';
import { MuscleReadinessCard } from './MuscleReadinessCard';

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

  // Readiness, routines, and next targets
  const { muscleReadiness, readinessSummary, milestones, upcomingRoutine } = useProgressCommandCenter(history, exercises);

  return (
    <View style={styles.container}>
      {/* 1. Personal Records Board */}
      <PersonalRecordsView prs={prs} />

      {/* 2. Next Session Progressive Overload Targets */}
      <MilestoneCountdownCard
        routine={upcomingRoutine}
        milestones={milestones}
        onStartWorkout={onStartWorkout}
      />

      {/* 3. Visual Muscle Recovery & Repair Battery */}
      <MuscleReadinessCard
        readinessList={muscleReadiness}
        summary={readinessSummary}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 6,
    gap: 0,
  },
});
