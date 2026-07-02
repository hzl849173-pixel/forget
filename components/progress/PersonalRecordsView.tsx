import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PRDisplay } from '../../hooks/use-workout-analytics';
import { Trophy } from 'lucide-react-native';

interface PersonalRecordsViewProps {
  prs: PRDisplay[];
}

export const PersonalRecordsView: React.FC<PersonalRecordsViewProps> = ({ prs }) => {
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
      <Text style={styles.sectionHeader}>PERSONAL RECORDS</Text>
      
      <View style={styles.card}>
        {prs.map((pr, idx) => (
          <View
            key={pr.exerciseId}
            style={[
              styles.prRow,
              idx === prs.length - 1 && { borderBottomWidth: 0 }
            ]}
          >
            <View style={styles.iconWrapper}>
              <Trophy size={16} color="#D97706" fill="#FBBF2440" />
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
              <Text style={styles.metaText}>{pr.muscleGroup} · {new Date(pr.date).toLocaleDateString()}</Text>
            </View>

            <View style={styles.rightCol}>
              <Text style={styles.weightText}>{pr.weight} kg × {pr.reps}</Text>
              <Text style={styles.e1rmText}>e1RM: {pr.estimatedOneRM} kg</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    paddingHorizontal: 16,
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
  prRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 14,
  },
  iconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
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
});
