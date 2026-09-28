import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Target, Sparkles, TrendingUp, Zap } from 'lucide-react-native';
import { MilestoneTarget, UpcomingSessionRoutine } from './useProgressCommandCenter';

interface MilestoneCountdownCardProps {
  routine?: UpcomingSessionRoutine | null;
  milestones?: MilestoneTarget[];
}

export const MilestoneCountdownCard: React.FC<MilestoneCountdownCardProps> = ({
  routine,
  milestones = [],
}) => {
  // If we have an intelligent habit-learned routine with targets, render it!
  if (routine && routine.hasRoutines && routine.targets.length > 0) {
    return (
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Target size={16} color="#3B82F6" strokeWidth={2.5} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.titleRow}>
              <Text style={styles.headerTitle}>{routine.dayName}</Text>
              {routine.isDayZero ? (
                <View style={[styles.habitBadge, { backgroundColor: '#3B82F612' }]}>
                  <Zap size={10} color="#2563EB" strokeWidth={2.5} />
                  <Text style={[styles.habitBadgeText, { color: '#2563EB' }]}>STARTER MISSION</Text>
                </View>
              ) : routine.isWeekOne ? (
                <View style={[styles.habitBadge, { backgroundColor: '#8B5CF615' }]}>
                  <Sparkles size={10} color="#7C3AED" strokeWidth={2.5} />
                  <Text style={[styles.habitBadgeText, { color: '#7C3AED' }]}>WEEK 1 TARGETS</Text>
                </View>
              ) : (
                <View style={styles.habitBadge}>
                  <Sparkles size={10} color="#3B82F6" strokeWidth={2.5} />
                  <Text style={styles.habitBadgeText}>2-WEEK HABIT</Text>
                </View>
              )}
            </View>
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {routine.daySubtitle}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Routine Exercises List */}
        <View style={styles.list}>
          {routine.targets.map((item, index) => (
            <View key={item.exerciseId} style={styles.routineItem}>
              {/* Top row: Exercise Name + Progression Badge */}
              <View style={styles.itemHeader}>
                <View style={styles.exerciseNameRow}>
                  <View style={styles.indexCircle}>
                    <Text style={styles.indexText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.name} numberOfLines={1}>
                    {item.exerciseName}
                  </Text>
                </View>

                <View
                  style={[
                    styles.overloadBadge,
                    {
                      backgroundColor: `${item.badgeColor}15`,
                      borderColor: `${item.badgeColor}35`,
                    },
                  ]}
                >
                  <Text style={[styles.overloadBadgeText, { color: item.badgeColor }]}>
                    {item.badgeLabel}
                  </Text>
                </View>
              </View>

              {/* Data comparison row */}
              <View style={styles.metricRow}>
                <Text style={styles.prevPerf}>
                  Last:{' '}
                  <Text style={styles.prevPerfVal}>
                    {item.lastWeight > 0 ? `${item.lastWeight} kg × ` : ''}
                    {item.lastReps > 0 ? `${item.lastReps} reps` : 'None yet'}
                  </Text>
                </Text>

                <View style={styles.targetCol}>
                  <Text style={styles.targetLabel}>TARGET</Text>
                  <Text style={styles.targetGoalVal}>
                    {item.targetWeight > 0 ? `${item.targetWeight} kg` : 'Reps'}
                    <Text style={styles.targetGoalSub}> × {item.targetReps}</Text>
                  </Text>
                </View>
              </View>

              {/* Guidance Micro Note */}
              <View style={styles.guidanceRow}>
                <TrendingUp size={11} color="#6B7280" strokeWidth={2} />
                <Text style={styles.guidanceText} numberOfLines={1}>
                  {item.guidanceText}
                </Text>
              </View>
            </View>
          ))}

          {/* Day 0 Incentive notice */}
          {routine.isDayZero && (
            <View style={styles.starterNoticeBox}>
              <Zap size={13} color="#2563EB" strokeWidth={2.5} />
              <Text style={styles.starterNoticeText}>
                Log your first session in under 30 seconds to unlock automatic progressive overload targets & live recovery battery.
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  }

  // Fallback: Legacy milestone targets if routine is not yet established
  if (milestones.length === 0) return null;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <Target size={16} color="#3B82F6" strokeWidth={2.5} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>NEXT LIFT TARGETS</Text>
          <Text style={styles.headerSubtitle}>Progressive overload milestones</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.list}>
        {milestones.map((item) => (
          <View key={item.exerciseId} style={styles.item}>
            <View style={styles.itemTop}>
              <View style={styles.infoCol}>
                <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
                  {item.exerciseName}
                </Text>
                <Text style={styles.meta}>
                  Best: <Text style={styles.bold}>{item.currentMaxWeight} kg</Text>
                </Text>
              </View>

              <View style={styles.targetBadge}>
                <Text style={styles.targetBadgeLabel}>TARGET</Text>
                <Text style={styles.targetVal}>{item.targetWeight} kg</Text>
              </View>
            </View>

            <View style={styles.progressRow}>
              <View style={styles.track}>
                <View
                  style={[
                    styles.fill,
                    {
                      width: `${item.progressPercent}%`,
                      backgroundColor: item.progressPercent >= 80 ? '#10B981' : '#3B82F6',
                    },
                  ]}
                />
              </View>
              <Text style={styles.neededText}>+{item.weightNeeded} kg</Text>
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: 0.6,
  },
  habitBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#3B82F612',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 99,
  },
  habitBadgeText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#2563EB',
    letterSpacing: 0.4,
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 1,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#F3F4F6',
    marginVertical: 12,
  },
  list: {
    gap: 9,
  },
  routineItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 11,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 7,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  exerciseNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  indexCircle: {
    width: 17,
    height: 17,
    borderRadius: 8.5,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  indexText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#4B5563',
  },
  name: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  overloadBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    borderWidth: 1,
  },
  overloadBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 1,
  },
  prevPerf: {
    fontSize: 11,
    color: '#6B7280',
  },
  prevPerfVal: {
    fontWeight: '700',
    color: '#111827',
  },
  targetCol: {
    alignItems: 'flex-end',
  },
  targetLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#9CA3AF',
    letterSpacing: 0.5,
  },
  targetGoalVal: {
    fontSize: 12.5,
    fontWeight: '900',
    color: '#111827',
  },
  targetGoalSub: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4B5563',
  },
  guidanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingTop: 2,
  },
  guidanceText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
    flex: 1,
  },

  // Fallback styles
  item: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 11,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  itemTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  infoCol: {
    flex: 1,
    marginRight: 6,
  },
  meta: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 1,
  },
  bold: {
    fontWeight: '800',
    color: '#111827',
  },
  targetBadge: {
    backgroundColor: '#111827',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignItems: 'center',
    minWidth: 54,
  },
  targetBadgeLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#9CA3AF',
    letterSpacing: 0.5,
  },
  targetVal: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  track: {
    flex: 1,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 2,
  },
  neededText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6B7280',
  },
  starterNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#3B82F60C',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#3B82F625',
    marginTop: 4,
  },
  starterNoticeText: {
    fontSize: 11,
    color: '#1E40AF',
    fontWeight: '600',
    flex: 1,
    lineHeight: 15,
  },
});
