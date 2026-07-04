import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useWorkout, WorkoutSession } from '../../hooks/use-workout-storage';
import { SHOULDER_EXERCISE_IDS } from '../../constants/exercises';

interface ProgressGridProps {
  history: WorkoutSession[];
  isDarkMode?: boolean;
}

export const ProgressGrid: React.FC<ProgressGridProps> = ({ history, isDarkMode = true }) => {
  const { exercises } = useWorkout();

  const getWeeklyMuscleSets = () => {
    // Start of current week (Sunday)
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day;
    const startOfWeek = new Date(now.setDate(diff));
    startOfWeek.setHours(0, 0, 0, 0);

    const muscleSets: Record<string, number> = {};
    
    history.forEach((session) => {
      const sessionDate = new Date(session.date);
      if (sessionDate >= startOfWeek) {
        session.exercises.forEach((logEx) => {
          const details = exercises.find((e) => e.id === logEx.exerciseId);
          if (details) {
            const muscle = details.muscleGroup === 'Abs & Shoulders'
              ? (SHOULDER_EXERCISE_IDS.has(logEx.exerciseId) ? 'Shoulders' : 'Abs')
              : details.muscleGroup;
            muscleSets[muscle] = (muscleSets[muscle] || 0) + logEx.sets.length;
          }
        });
      }
    });
    
    return muscleSets;
  };

  const weeklyMuscleSets = getWeeklyMuscleSets();
  const muscleList = Object.entries(weeklyMuscleSets).sort((a, b) => b[1] - a[1]);
  const maxSets = Math.max(...Object.values(weeklyMuscleSets), 1);

  const theme = {
    cardBg: isDarkMode ? '#13141C' : '#FFFFFF',
    borderColor: isDarkMode ? '#212330' : '#E5E7EB',
    textPrimary: isDarkMode ? '#FFFFFF' : '#111827',
    textSecondary: isDarkMode ? '#94A3B8' : '#6B7280',
    progressBarBg: isDarkMode ? '#212330' : '#E5E7EB',
    barColor: isDarkMode ? '#34D399' : '#059669', // Calm uniform Mint Green (Low eye strain)
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: theme.textPrimary }]}>Weekly Activity</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Sets completed this week</Text>
        </View>
      </View>

      {muscleList.length === 0 ? (
        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
          No sets completed yet this week.
        </Text>
      ) : (
        <View style={styles.listContainer}>
          {muscleList.map(([muscle, count]) => {
            const percentage = (count / maxSets) * 100;
            return (
              <View key={muscle} style={styles.row}>
                <View style={styles.rowInfo}>
                  <Text style={[styles.muscleLabel, { color: theme.textPrimary }]}>
                    {muscle.toUpperCase()}
                  </Text>
                  <Text style={[styles.setsCount, { color: theme.barColor }]}>
                    {count} set{count > 1 ? 's' : ''}
                  </Text>
                </View>
                <View style={[styles.progressTrack, { backgroundColor: theme.progressBarBg }]}>
                  <View
                    style={[
                      styles.progressBar,
                      {
                        width: `${percentage}%`,
                        backgroundColor: theme.barColor,
                        opacity: isDarkMode ? 0.75 : 0.95
                      }
                    ]}
                  />
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    marginBottom: 20,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  emptyText: {
    fontSize: 12,
    fontWeight: '600',
    paddingVertical: 12,
    textAlign: 'center',
  },
  listContainer: {
    gap: 12,
  },
  row: {
    gap: 6,
  },
  rowInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  muscleLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  setsCount: {
    fontSize: 11,
    fontWeight: '800',
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
});
