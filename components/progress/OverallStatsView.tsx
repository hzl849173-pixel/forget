import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { OverallStats } from '../../hooks/use-workout-analytics';
import { Dumbbell, Trophy, Flame, Hash, List } from 'lucide-react-native';

interface OverallStatsViewProps {
  stats: OverallStats;
}

export const OverallStatsView: React.FC<OverallStatsViewProps> = ({ stats }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeader}>OVERALL STATISTICS</Text>
      
      <View style={styles.grid}>
        {/* Workouts Card */}
        <View style={[styles.card, { backgroundColor: '#3B82F606', borderColor: '#3B82F618' }]}>
          <View style={styles.cardHeader}>
            <Dumbbell size={16} color="#3B82F6" strokeWidth={2.5} />
            <Text style={[styles.label, { color: '#2563EB' }]}>Workouts</Text>
          </View>
          <Text style={[styles.value, { color: '#1D4ED8' }]}>{stats.totalWorkouts}</Text>
        </View>

        {/* Volume Card */}
        <View style={[styles.card, { backgroundColor: '#10B98106', borderColor: '#10B98118' }]}>
          <View style={styles.cardHeader}>
            <Trophy size={16} color="#10B981" strokeWidth={2.5} />
            <Text style={[styles.label, { color: '#059669' }]}>Total Volume</Text>
          </View>
          <Text style={[styles.value, { color: '#047857' }]}>{stats.totalVolume.toLocaleString()} kg</Text>
        </View>

        {/* Sets Card */}
        <View style={[styles.card, { backgroundColor: '#F3F4F6', borderColor: '#E5E7EB' }]}>
          <View style={styles.cardHeader}>
            <List size={16} color="#6B7280" strokeWidth={2.5} />
            <Text style={[styles.label, { color: '#4B5563' }]}>Total Sets</Text>
          </View>
          <Text style={[styles.value, { color: '#1F2937' }]}>{stats.totalSets}</Text>
        </View>

        {/* Reps Card */}
        <View style={[styles.card, { backgroundColor: '#F3F4F6', borderColor: '#E5E7EB' }]}>
          <View style={styles.cardHeader}>
            <Hash size={16} color="#6B7280" strokeWidth={2.5} />
            <Text style={[styles.label, { color: '#4B5563' }]}>Total Reps</Text>
          </View>
          <Text style={[styles.value, { color: '#1F2937' }]}>{stats.totalReps}</Text>
        </View>

        {/* Current Streak */}
        <View style={[styles.card, { backgroundColor: '#FF8A0006', borderColor: '#FF8A0018', width: '48%', flexGrow: 1 }]}>
          <View style={styles.cardHeader}>
            <Flame size={16} color="#FF8A00" strokeWidth={2.5} fill="#FF8A0020" />
            <Text style={[styles.label, { color: '#D97706' }]}>Current Streak</Text>
          </View>
          <Text style={[styles.value, { color: '#B45309' }]}>{stats.currentStreak} day{stats.currentStreak === 1 ? '' : 's'}</Text>
        </View>

        {/* Longest Streak */}
        <View style={[styles.card, { backgroundColor: '#FACC1506', borderColor: '#FACC1518', width: '48%', flexGrow: 1 }]}>
          <View style={styles.cardHeader}>
            <Flame size={16} color="#EAB308" strokeWidth={2.5} fill="#EAB30820" />
            <Text style={[styles.label, { color: '#CA8A04' }]}>Longest Streak</Text>
          </View>
          <Text style={[styles.value, { color: '#A16207' }]}>{stats.longestStreak} day{stats.longestStreak === 1 ? '' : 's'}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  card: {
    width: '48%',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    justifyContent: 'space-between',
    minHeight: 80,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  value: {
    fontSize: 22,
    fontWeight: '800',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
});
