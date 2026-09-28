import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { PRDisplay } from '../../hooks/use-workout-analytics';
import { Trophy, ChevronDown, ChevronUp } from 'lucide-react-native';

interface PersonalRecordsViewProps {
  prs: PRDisplay[];
}

export const PersonalRecordsView: React.FC<PersonalRecordsViewProps> = ({ prs }) => {
  const [showAll, setShowAll] = useState(false);

  // Group the visible PRs by muscle group
  const groupedPrs = useMemo(() => {
    const visiblePrs = showAll ? prs : prs.slice(0, 4);
    const groups: Record<string, PRDisplay[]> = {};
    visiblePrs.forEach((pr) => {
      const muscle = pr.muscleGroup;
      if (!groups[muscle]) {
        groups[muscle] = [];
      }
      groups[muscle].push(pr);
    });
    return groups;
  }, [prs, showAll]);

  if (prs.length === 0) {
    return (
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Trophy size={16} color="#10B981" strokeWidth={2.5} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>PERSONAL RECORDS</Text>
            <Text style={styles.headerSubtitle}>All-time heaviest lifts & milestones</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <Text style={styles.emptyText}>No personal records logged yet. Complete a workout to record PRs.</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      {/* Header matching app-wide card design */}
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <Trophy size={16} color="#10B981" strokeWidth={2.5} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>PERSONAL RECORDS</Text>
          <Text style={styles.headerSubtitle}>All-time heaviest lifts & milestones</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Grouped PR List */}
      <View style={styles.list}>
        {Object.entries(groupedPrs).map(([muscleGroup, musclePrs], gIdx) => (
          <View key={muscleGroup} style={[styles.groupBlock, gIdx > 0 && { marginTop: 12 }]}>
            <Text style={styles.groupHeader}>{muscleGroup.toUpperCase()}</Text>

            {musclePrs.map((pr, idx) => (
              <View
                key={pr.exerciseId}
                style={[
                  styles.prRow,
                  idx === musclePrs.length - 1 && { borderBottomWidth: 0 },
                ]}
              >
                <View style={styles.leftCol}>
                  <View style={styles.titleRow}>
                    <Text style={styles.exerciseName} numberOfLines={1}>
                      {pr.exerciseName}
                    </Text>
                    {pr.isNew && (
                      <View style={styles.newBadge}>
                        <Text style={styles.newBadgeText}>NEW</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.dateText}>
                    {new Date(pr.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </Text>
                </View>

                <View style={styles.rightCol}>
                  <Text style={styles.weightText}>
                    {pr.weight} <Text style={{ fontSize: 10, fontWeight: '600', color: '#6B7280' }}>kg</Text> × {pr.reps}
                  </Text>
                  <Text style={styles.e1rmText}>e1RM {pr.estimatedOneRM} kg</Text>
                </View>
              </View>
            ))}
          </View>
        ))}

        {prs.length > 4 && (
          <TouchableOpacity
            style={styles.toggleBtn}
            onPress={() => setShowAll(!showAll)}
            activeOpacity={0.7}
          >
            <Text style={styles.toggleBtnText}>
              {showAll ? 'Show Less' : `Show All PRs (${prs.length})`}
            </Text>
            {showAll ? (
              <ChevronUp size={14} color="#6B7280" strokeWidth={2.5} />
            ) : (
              <ChevronDown size={14} color="#6B7280" strokeWidth={2.5} />
            )}
          </TouchableOpacity>
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
    backgroundColor: '#10B98115',
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
  emptyText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
    paddingVertical: 8,
  },
  list: {
    gap: 4,
  },
  groupBlock: {
    gap: 0,
  },
  groupHeader: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#9CA3AF',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  prRow: {
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  exerciseName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
    flexShrink: 1,
  },
  newBadge: {
    backgroundColor: '#10B98115',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    flexShrink: 0,
  },
  newBadgeText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#10B981',
    letterSpacing: 0.4,
  },
  dateText: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '500',
    marginTop: 2,
  },
  rightCol: {
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  weightText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
  },
  e1rmText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#10B981',
    marginTop: 1,
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    marginTop: 6,
  },
  toggleBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
  },
});
