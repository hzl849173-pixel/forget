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
    const visiblePrs = showAll ? prs : prs.slice(0, 3);
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
      <View style={styles.container}>
        <Text style={styles.sectionHeader}>PERSONAL RECORDS</Text>
        <View style={styles.emptyCard}>
          <Trophy size={20} color="#9CA3AF" />
          <Text style={styles.noData}>No Personal Records logged yet.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      
      {/* Personal Records Section */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>PERSONAL RECORDS</Text>
        
        {prs.length === 0 ? (
          <View style={styles.emptyCard}>
            <Trophy size={20} color="#9CA3AF" />
            <Text style={styles.noData}>No Personal Records logged yet.</Text>
          </View>
        ) : (
          <View style={styles.card}>
            {Object.entries(groupedPrs).map(([muscleGroup, musclePrs], gIdx) => (
              <View key={muscleGroup} style={[styles.muscleGroupBlock, gIdx > 0 && { marginTop: 16 }]}>
                <Text style={styles.muscleGroupHeader}>{muscleGroup.toUpperCase()}</Text>
                
                {musclePrs.map((pr, idx) => (
                  <View
                    key={pr.exerciseId}
                    style={[
                      styles.prRow,
                      idx === musclePrs.length - 1 && { borderBottomWidth: 0 }
                    ]}
                  >
                    <View style={styles.iconWrapper}>
                      <Trophy size={14} color="#D97706" fill="#FBBF2440" />
                    </View>
                    
                    <View style={styles.leftCol}>
                      <View style={styles.titleRow}>
                        <Text style={styles.exerciseName} numberOfLines={1}>{pr.exerciseName}</Text>
                        {pr.isNew && (
                          <View style={styles.newBadge}>
                            <Text style={styles.newBadgeText}>NEW</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.metaText}>{new Date(pr.date).toLocaleDateString()}</Text>
                    </View>

                    <View style={styles.rightCol}>
                      <Text style={styles.weightText}>{pr.weight} kg × {pr.reps}</Text>
                      <Text style={styles.e1rmText}>e1RM: {pr.estimatedOneRM} kg</Text>
                    </View>
                  </View>
                ))}
              </View>
            ))}

            {prs.length > 3 && (
              <TouchableOpacity
                style={styles.toggleBtn}
                onPress={() => setShowAll(!showAll)}
                activeOpacity={0.7}
              >
                <Text style={styles.toggleBtnText}>
                  {showAll ? 'Show Less' : `Show All PRs (${prs.length})`}
                </Text>
                {showAll ? (
                  <ChevronUp size={14} color="#3B82F6" strokeWidth={2.5} />
                ) : (
                  <ChevronDown size={14} color="#3B82F6" strokeWidth={2.5} />
                )}
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 4,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 10,
    color: '#9CA3AF',
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  noData: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '600',
    fontStyle: 'italic',
  },
  freqRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  freqLeft: {
    flex: 1,
    paddingRight: 10,
  },
  freqRight: {
    alignItems: 'flex-end',
  },
  countText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#10B981',
  },
  muscleGroupBlock: {
    flexDirection: 'column',
  },
  muscleGroupHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: '#3B82F6',
    letterSpacing: 0.8,
    marginBottom: 6,
    marginTop: 4,
  },
  prRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 14,
  },
  iconWrapper: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FBBF2415',
    justifyContent: 'center',
    alignItems: 'center',
  },
  leftCol: {
    flex: 1,
  },
  rightCol: {
    alignItems: 'flex-end',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    flexShrink: 1,
  },
  newBadge: {
    backgroundColor: '#3B82F6',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
    marginLeft: 6,
  },
  newBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  metaText: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
    fontWeight: '500',
  },
  weightText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#10B981',
  },
  e1rmText: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 1,
    fontWeight: '500',
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    marginTop: 8,
  },
  toggleBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3B82F6',
  },
});
