import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Trophy } from 'lucide-react-native';
import { RecentPRWin } from './useProgressCommandCenter';

interface RecentWinsCardProps {
  wins: RecentPRWin[];
}

export const RecentWinsCard: React.FC<RecentWinsCardProps> = ({ wins }) => {
  if (wins.length === 0) return null;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <Trophy size={16} color="#10B981" strokeWidth={2.5} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>RECENT TOP SETS</Text>
          <Text style={styles.headerSubtitle}>Latest workout breakthroughs</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.list}>
        {wins.map((win, idx) => {
          const dateStr = new Date(win.date).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
          });

          return (
            <View key={`${win.exerciseId}-${idx}`} style={styles.row}>
              <View style={styles.infoCol}>
                <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
                  {win.exerciseName}
                </Text>
                <Text style={styles.meta}>{win.muscleGroup} · {dateStr}</Text>
              </View>

              <View style={styles.statCol}>
                <Text style={styles.weight}>
                  {win.weight} <Text style={styles.unit}>kg</Text> × {win.reps}
                </Text>
                <Text style={styles.e1rm}>e1RM {win.estimatedOneRM} kg</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 14,
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
    marginVertical: 12,
  },
  list: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  infoCol: {
    flex: 1,
    marginRight: 10,
  },
  name: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  meta: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 1,
  },
  statCol: {
    alignItems: 'flex-end',
  },
  weight: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
  },
  unit: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
  },
  e1rm: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#10B981',
    marginTop: 1,
  },
});
