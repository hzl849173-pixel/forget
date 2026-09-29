import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Target, ChevronRight } from 'lucide-react-native';
import { MilestoneTarget, UpcomingSessionRoutine } from './useProgressCommandCenter';

interface MilestoneCountdownCardProps {
  routine?: UpcomingSessionRoutine | null;
  milestones?: MilestoneTarget[];
  onStartWorkout?: () => void;
}

export const MilestoneCountdownCard: React.FC<MilestoneCountdownCardProps> = ({
  routine,
  milestones = [],
  onStartWorkout,
}) => {
  // Day 0: Brand new user with 0 workouts logged
  if (routine?.isDayZero) {
    return (
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Target size={16} color="#3B82F6" strokeWidth={2.5} />
          </View>
          <View style={styles.headerTextWrap}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              TARGETS TO BEAT
            </Text>
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              What to aim for next session
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.dayZeroContainer}>
          <Text style={styles.dayZeroText}>
            Log your workout today. Your future targets and progressive overload recommendations will automatically appear here.
          </Text>

          {onStartWorkout && (
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={onStartWorkout}
              activeOpacity={0.8}
            >
              <Text style={styles.actionBtnText}>+ LOG TODAY'S WORKOUT</Text>
              <ChevronRight size={14} color="#FFFFFF" strokeWidth={2.5} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  // Active routine with intelligent habit-learned targets
  if (routine && routine.hasRoutines && routine.targets.length > 0) {
    return (
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Target size={16} color="#3B82F6" strokeWidth={2.5} />
          </View>
          <View style={styles.headerTextWrap}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {routine.dayName}
            </Text>
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {routine.daySubtitle}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Column Headers for instant clarity */}
        <View style={styles.columnHeaderRow}>
          <Text style={styles.columnHeaderLeft}>LAST SESSION</Text>
          <Text style={styles.columnHeaderRight}>NEXT GOAL</Text>
        </View>

        {/* Minimal flat rows identical to Personal Records */}
        <View style={styles.list}>
          {routine.targets.map((item, idx) => (
            <View
              key={item.exerciseId}
              style={[
                styles.row,
                idx === routine.targets.length - 1 && { borderBottomWidth: 0 },
              ]}
            >
              <View style={styles.leftCol}>
                <Text style={styles.exerciseName} numberOfLines={1}>
                  {item.exerciseName}
                </Text>
                <Text style={styles.lastText} numberOfLines={1}>
                  {item.lastWeight > 0 ? `${item.lastWeight} kg × ` : ''}{item.lastReps > 0 ? `${item.lastReps} reps` : 'None logged'}
                </Text>
              </View>

              <View style={styles.rightCol}>
                <Text style={styles.targetText} numberOfLines={1}>
                  {item.targetWeight > 0 ? (
                    <>
                      {item.targetWeight}{' '}
                      <Text style={styles.unitText}>kg</Text>
                      {' × '}{item.targetReps}
                    </>
                  ) : (
                    `Reps × ${item.targetReps}`
                  )}
                </Text>
                <Text
                  style={[styles.badgeText, { color: item.badgeColor }]}
                  numberOfLines={1}
                >
                  {item.badgeLabel}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  }

  // Fallback: Milestone targets if routine is not yet established
  if (milestones.length === 0) return null;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <Target size={16} color="#3B82F6" strokeWidth={2.5} />
        </View>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            TARGETS TO BEAT
          </Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            Progressive overload milestones
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Column Headers for fallback */}
      <View style={styles.columnHeaderRow}>
        <Text style={styles.columnHeaderLeft}>CURRENT BEST</Text>
        <Text style={styles.columnHeaderRight}>NEXT GOAL</Text>
      </View>

      <View style={styles.list}>
        {milestones.map((item, idx) => (
          <View
            key={item.exerciseId}
            style={[
              styles.row,
              idx === milestones.length - 1 && { borderBottomWidth: 0 },
            ]}
          >
            <View style={styles.leftCol}>
              <Text style={styles.exerciseName} numberOfLines={1}>
                {item.exerciseName}
              </Text>
              <Text style={styles.lastText} numberOfLines={1}>
                Best: {item.currentMaxWeight} kg
              </Text>
            </View>

            <View style={styles.rightCol}>
              <Text style={styles.targetText} numberOfLines={1}>
                {item.targetWeight} <Text style={styles.unitText}>kg</Text>
              </Text>
              <Text style={[styles.badgeText, { color: '#10B981' }]} numberOfLines={1}>
                +{item.weightNeeded} kg needed
              </Text>
            </View>
          </View>
        ))}
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
    marginBottom: 24,
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
    flexShrink: 0,
  },
  headerTextWrap: {
    flex: 1,
    flexShrink: 1,
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
  columnHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F3F4F6',
  },
  columnHeaderLeft: {
    fontSize: 9,
    fontWeight: '800',
    color: '#9CA3AF',
    letterSpacing: 0.8,
  },
  columnHeaderRight: {
    fontSize: 9,
    fontWeight: '800',
    color: '#9CA3AF',
    letterSpacing: 0.8,
    textAlign: 'right',
  },
  list: {
    gap: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F3F4F6',
  },
  leftCol: {
    flex: 1,
    flexShrink: 1,
    marginRight: 10,
  },
  exerciseName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  lastText: {
    fontSize: 10.5,
    color: '#9CA3AF',
    fontWeight: '500',
    marginTop: 2,
  },
  rightCol: {
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  targetText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
  },
  unitText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
  },
  badgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    marginTop: 1,
  },

  // Day 0 Action Card styles
  dayZeroContainer: {
    paddingVertical: 4,
    gap: 14,
  },
  dayZeroText: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#111827',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 2,
  },
  actionBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});
