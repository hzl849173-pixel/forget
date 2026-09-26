import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Target } from 'lucide-react-native';
import { MilestoneTarget } from './useProgressCommandCenter';

interface MilestoneCountdownCardProps {
  milestones: MilestoneTarget[];
}

export const MilestoneCountdownCard: React.FC<MilestoneCountdownCardProps> = ({ milestones }) => {
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
                <Text style={styles.targetLabel}>TARGET</Text>
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
    marginVertical: 12,
  },
  list: {
    gap: 10,
  },
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
  name: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
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
  targetLabel: {
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
});
