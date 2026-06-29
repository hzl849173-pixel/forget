import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Calendar, Flame } from 'lucide-react-native';
import { WorkoutSession } from '../../hooks/use-workout-storage';

interface ProgressGridProps {
  history: WorkoutSession[];
  isDarkMode?: boolean;
}

export const ProgressGrid: React.FC<ProgressGridProps> = ({ history, isDarkMode = true }) => {
  // Generate the last 30 days (including today)
  const getPast30Days = () => {
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      days.push(dateStr);
    }
    return days;
  };

  const past30Days = getPast30Days();

  // Find unique days with workouts in the last 30 days
  const workoutDays = new Set(
    history.map((session) => session.date.split('T')[0])
  );

  // Compute stats
  const activeDaysCount = past30Days.filter((day) => workoutDays.has(day)).length;

  // Compute current streak (consecutive days worked out up to today)
  const computeStreak = () => {
    let streak = 0;
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    // If worked out today or yesterday, check streak backwards
    const startChecking = workoutDays.has(todayStr) || workoutDays.has(yesterdayStr);
    if (!startChecking) return 0;

    let checkingDate = new Date();
    if (!workoutDays.has(todayStr)) {
      checkingDate.setDate(checkingDate.getDate() - 1);
    }

    while (true) {
      const dateStr = checkingDate.toISOString().split('T')[0];
      if (workoutDays.has(dateStr)) {
        streak++;
        checkingDate.setDate(checkingDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  };

  const streak = computeStreak();

  const getWeekdayLetter = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = date.getDay(); // 0 is Sunday, 1 is Monday, etc.
    const letters = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    return letters[day];
  };

  const theme = {
    cardBg: isDarkMode ? '#13141C' : '#FFFFFF',
    borderColor: isDarkMode ? '#212330' : '#E5E7EB',
    textPrimary: isDarkMode ? '#FFFFFF' : '#111827',
    textSecondary: isDarkMode ? '#94A3B8' : '#6B7280',
    bubbleBg: isDarkMode ? '#1A1C28' : '#F3F4F6',
    innerBg: isDarkMode ? '#090A0F' : '#F9FAFB',
    cellInactive: isDarkMode ? '#1A1C28' : '#E5E7EB',
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
      {/* Overview Title Block */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: theme.textPrimary }]}>Activity Overview</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Last 30 Days</Text>
        </View>
        <View style={[styles.topStreakRow, { backgroundColor: theme.bubbleBg, borderColor: theme.borderColor }]}>
          <Flame size={16} color="#FF8A00" fill="#FF8A00" />
          <Text style={[styles.topStreakNum, { color: theme.textPrimary }]}>{streak}</Text>
          <Text style={[styles.topStreakLabel, { color: theme.textSecondary }]}>Day Streak</Text>
        </View>
      </View>

      {/* Simplified Stat Column Blocks (Only Active Days and Day Streak) */}
      <View style={[styles.statsRow, { backgroundColor: theme.innerBg, borderColor: theme.borderColor }]}>
        <View style={styles.statColumn}>
          <View style={[styles.iconCircle, { backgroundColor: '#10B98120' }]}>
            <Calendar size={16} color="#10B981" />
          </View>
          <Text style={[styles.statValue, { color: theme.textPrimary }]}>{activeDaysCount}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Active Days</Text>
        </View>

        <View style={[styles.statDivider, { backgroundColor: theme.borderColor }]} />

        <View style={styles.statColumn}>
          <View style={[styles.iconCircle, { backgroundColor: '#FF8A0020' }]}>
            <Flame size={16} color="#FF8A00" />
          </View>
          <Text style={[styles.statValue, { color: theme.textPrimary }]}>{streak}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Day Streak</Text>
        </View>
      </View>

      {/* Heatmap Grid Row with week labels on top */}
      <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.gridContainer}>
        {past30Days.map((day) => {
          const isActive = workoutDays.has(day);
          return (
            <View key={day} style={styles.gridColumn}>
              <Text style={styles.weekdayLabel}>{getWeekdayLetter(day)}</Text>
              <View
                style={[
                  styles.gridCell,
                  isActive ? styles.cellActive : { backgroundColor: theme.cellInactive },
                ]}
              />
            </View>
          );
        })}
      </ScrollView>

      {/* Legend Block */}
      <View style={[styles.legendRow, { borderTopColor: theme.borderColor }]}>
        <View style={styles.legendItem}>
          <View style={[styles.legendCell, { backgroundColor: theme.cellInactive }]} />
          <Text style={[styles.legendText, { color: theme.textSecondary }]}>No Activity</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendCell, styles.cellActive]} />
          <Text style={[styles.legendText, { color: theme.textSecondary }]}>Active</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    backgroundColor: '#13141C', // Obsidian Card Background
    borderColor: '#212330', // Gunmetal Borders
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 2,
  },
  topStreakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1C28', // Dark slate bubble
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 99,
    gap: 4,
    borderWidth: 0.5,
    borderColor: '#212330',
  },
  topStreakNum: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  topStreakLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  // Stat Blocks
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#090A0F', // Obsidian background
    borderRadius: 16,
    paddingVertical: 14,
    marginBottom: 20,
    borderWidth: 0.5,
    borderColor: '#212330',
  },
  statColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: '#212330',
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
  },
  // Grid Container
  gridContainer: {
    flexDirection: 'row',
    gap: 5,
    paddingVertical: 4,
    justifyContent: 'space-between',
  },
  gridColumn: {
    alignItems: 'center',
    gap: 6,
  },
  weekdayLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#475569',
    textAlign: 'center',
    width: 10,
  },
  gridCell: {
    width: 10,
    height: 10,
    borderRadius: 3,
  },
  cellActive: {
    backgroundColor: '#10B981', // Emerald Green Active
  },
  cellInactive: {
    backgroundColor: '#1A1C28', // Inactive Cell Dark Obsidian
  },
  // Legend
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: '#212330',
    paddingTop: 14,
    marginTop: 18,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendCell: {
    width: 8,
    height: 8,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
  },
});
