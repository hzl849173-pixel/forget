import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Target } from 'lucide-react-native';
import { MuscleReadiness, MilestoneTarget } from './useProgressCommandCenter';

interface NextMissionCardProps {
  muscleReadiness: MuscleReadiness[];
  nextTarget: MilestoneTarget | null;
}

export const NextMissionCard: React.FC<NextMissionCardProps> = ({
  muscleReadiness,
  nextTarget,
}) => {
  const readyMuscles = muscleReadiness.filter((m) => m.percentage >= 95).map((m) => m.muscle);
  const recoveringMuscles = muscleReadiness.filter((m) => m.percentage < 95).map((m) => m.muscle);

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <Target size={16} color="#3B82F6" strokeWidth={2.5} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>NEXT LIFT TARGET</Text>
          <Text style={styles.headerSubtitle}>Progressive overload objective</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Target Mission Row */}
      {nextTarget ? (
        <View style={styles.targetRow}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.exerciseName} numberOfLines={1}>
              {nextTarget.exerciseName}
            </Text>
            <Text style={styles.targetSub}>
              Current: <Text style={{ fontWeight: '800', color: '#111827' }}>{nextTarget.currentMaxWeight} kg</Text>
              {'  ·  '}Goal: <Text style={{ fontWeight: '800', color: '#10B981' }}>{nextTarget.targetWeight} kg</Text>
            </Text>
          </View>
          <View style={styles.neededPill}>
            <Text style={styles.neededPillText}>+{nextTarget.weightNeeded} kg</Text>
          </View>
        </View>
      ) : (
        <Text style={styles.noTargetText}>Keep logging workouts to reveal upcoming strength milestones.</Text>
      )}

      {/* Muscle Readiness Summary Lines */}
      <View style={styles.recoverySummaryBox}>
        {readyMuscles.length > 0 && (
          <View style={styles.recoveryLine}>
            <View style={[styles.dot, { backgroundColor: '#10B981' }]} />
            <Text style={styles.recoveryLabel}>Ready to train: </Text>
            <Text style={styles.recoveryVal} numberOfLines={1}>
              {readyMuscles.join(', ')}
            </Text>
          </View>
        )}
        {recoveringMuscles.length > 0 && (
          <View style={styles.recoveryLine}>
            <View style={[styles.dot, { backgroundColor: '#F59E0B' }]} />
            <Text style={styles.recoveryLabel}>Repairing: </Text>
            <Text style={styles.recoveryVal} numberOfLines={1}>
              {recoveringMuscles.join(', ')}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#3B82F615',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: 0.6,
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 1,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#F3F4F6',
    marginVertical: 14,
  },
  targetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  exerciseName: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#111827',
  },
  targetSub: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  neededPill: {
    backgroundColor: '#10B98115',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  neededPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#059669',
  },
  noTargetText: {
    fontSize: 11.5,
    color: '#9CA3AF',
    marginBottom: 12,
  },
  recoverySummaryBox: {
    gap: 6,
    paddingTop: 2,
  },
  recoveryLine: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  recoveryLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4B5563',
  },
  recoveryVal: {
    fontSize: 11,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
});
