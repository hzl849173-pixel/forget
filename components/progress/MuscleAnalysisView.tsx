import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MuscleGroup } from '../../constants/exercises';
import { MuscleVolumeDistribution } from '../../hooks/use-workout-analytics';
import { ShieldAlert, Award } from 'lucide-react-native';

interface MuscleAnalysisViewProps {
  distribution: {
    weekly: MuscleVolumeDistribution[];
    monthly: MuscleVolumeDistribution[];
    allTime: MuscleVolumeDistribution[];
    mostTrained?: MuscleGroup;
    leastTrained?: MuscleGroup;
  };
}

export const MuscleAnalysisView: React.FC<MuscleAnalysisViewProps> = ({ distribution }) => {
  const [activeTab, setActiveTab] = useState<'weekly' | 'monthly' | 'allTime'>('monthly');

  const currentData = distribution[activeTab];

  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeader}>MUSCLE GROUP ANALYSIS</Text>

      {/* Highlights */}
      <View style={styles.highlightRow}>
        {/* Most Trained Card */}
        <View style={[styles.highlightCard, { backgroundColor: '#10B98106', borderColor: '#10B98115' }]}>
          <View style={styles.highlightCardHeader}>
            <Award size={14} color="#10B981" strokeWidth={2.5} />
            <Text style={[styles.highlightLabel, { color: '#059669' }]}>Most Trained</Text>
          </View>
          <Text style={[styles.highlightVal, { color: '#047857' }]}>{distribution.mostTrained || 'N/A'}</Text>
        </View>

        {/* Least Trained Card */}
        <View style={[styles.highlightCard, { backgroundColor: '#EF444406', borderColor: '#EF444415' }]}>
          <View style={styles.highlightCardHeader}>
            <ShieldAlert size={14} color="#EF4444" strokeWidth={2.5} />
            <Text style={[styles.highlightLabel, { color: '#B91C1C' }]}>Least Trained</Text>
          </View>
          <Text style={[styles.highlightVal, { color: '#991B1B' }]}>{distribution.leastTrained || 'N/A'}</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {(['weekly', 'monthly', 'allTime'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
            onPress={() => setActiveTab(tab)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab === 'weekly' ? 'Weekly' : tab === 'monthly' ? 'Monthly' : 'All-time'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List with Progress Bars */}
      <View style={styles.listCard}>
        {currentData.map((item) => (
          <View key={item.muscleGroup} style={styles.muscleRow}>
            <View style={styles.rowHeader}>
              <Text style={styles.muscleName}>{item.muscleGroup}</Text>
              <Text style={styles.muscleStats}>
                {item.volume.toLocaleString()} kg · <Text style={styles.setHighlight}>{item.sets} sets</Text>
              </Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressBar, { width: `${item.percentage}%` }]} />
            </View>
            <Text style={styles.percentageText}>{item.percentage}% of total volume</Text>
          </View>
        ))}
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
  highlightRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  highlightCard: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    justifyContent: 'space-between',
  },
  highlightCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  highlightLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  highlightVal: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 6,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#E5E7EB',
    borderRadius: 10,
    padding: 2,
    marginBottom: 10,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  activeTabButton: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  tabText: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#111827',
    fontWeight: '800',
  },
  listCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  muscleRow: {
    marginBottom: 14,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  muscleName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  muscleStats: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  setHighlight: {
    color: '#10B981',
    fontWeight: '700',
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  percentageText: {
    fontSize: 10,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 4,
    fontWeight: '500',
  },
});
