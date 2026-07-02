import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MonthlySummary } from '../../hooks/use-workout-analytics';
import { Calendar, Dumbbell, CalendarDays } from 'lucide-react-native';

interface MonthlySummaryViewProps {
  summary: MonthlySummary;
}

export const MonthlySummaryView: React.FC<MonthlySummaryViewProps> = ({ summary }) => {
  const currentMonthName = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeader}>MONTHLY SUMMARY</Text>

      <View style={styles.card}>
        {/* Top Accent bar */}
        <View style={styles.accentBar} />
        
        <View style={styles.header}>
          <CalendarDays size={18} color="#10B981" />
          <Text style={styles.title}>{currentMonthName.toUpperCase()}</Text>
        </View>

        <View style={styles.grid}>
          <View style={styles.gridItem}>
            <Text style={styles.value}>{summary.workoutsCompleted}</Text>
            <Text style={styles.label}>Workouts</Text>
          </View>

          <View style={styles.gridItem}>
            <Text style={styles.value}>{summary.totalVolume.toLocaleString()} kg</Text>
            <Text style={styles.label}>Volume</Text>
          </View>

          <View style={styles.gridItem}>
            <Text style={styles.value}>{summary.totalSets}</Text>
            <Text style={styles.label}>Total Sets</Text>
          </View>

          <View style={styles.gridItem}>
            <Text style={styles.value}>{summary.totalReps}</Text>
            <Text style={styles.label}>Total Reps</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.insightRow}>
          <View style={styles.insightHeader}>
            <Calendar size={14} color="#6B7280" />
            <Text style={styles.insightLabel}>Most Active Day</Text>
          </View>
          <Text style={styles.insightVal}>{summary.mostActiveDay}</Text>
        </View>

        {summary.mostFrequentExercise && (
          <View style={styles.insightRow}>
            <View style={styles.insightHeader}>
              <Dumbbell size={14} color="#6B7280" />
              <Text style={styles.insightLabel}>Top Workout</Text>
            </View>
            <Text style={styles.insightVal} numberOfLines={1}>
              {summary.mostFrequentExercise.name} ({summary.mostFrequentExercise.count} sets)
            </Text>
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
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    position: 'relative',
  },
  accentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: '#10B981',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    marginTop: 4,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    letterSpacing: 0.5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
    rowGap: 18,
  },
  gridItem: {
    width: '50%',
    paddingHorizontal: 8,
  },
  value: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  label: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 18,
  },
  insightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  insightLabel: {
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '500',
  },
  insightVal: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
    flexShrink: 1,
    textAlign: 'right',
  },
});
