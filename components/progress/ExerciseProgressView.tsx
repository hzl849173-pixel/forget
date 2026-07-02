import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, SafeAreaView } from 'react-native';
import { ExerciseComparison } from '../../hooks/use-workout-analytics';
import { Exercise } from '../../hooks/use-workout-storage';
import { ChevronDown, TrendingUp, HelpCircle } from 'lucide-react-native';

interface ExerciseProgressViewProps {
  exercises: Exercise[];
  selectedExerciseId: string;
  onSelectExercise: (id: string) => void;
  comparison: ExerciseComparison | null;
}

export const ExerciseProgressView: React.FC<ExerciseProgressViewProps> = ({
  exercises,
  selectedExerciseId,
  onSelectExercise,
  comparison,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const selectedExercise = exercises.find((e) => e.id === selectedExerciseId);

  const maxWeightInHistory = comparison && comparison.historyPoints.length > 0
    ? Math.max(...comparison.historyPoints.map((pt) => pt.maxWeight))
    : 0;

  const renderBadge = (percent: number, label: string) => {
    const isPositive = percent >= 0;
    return (
      <View style={[
        styles.badge,
        { backgroundColor: isPositive ? '#10B98112' : '#EF444412' }
      ]}>
        <Text style={[
          styles.badgeText,
          { color: isPositive ? '#059669' : '#DC2626' }
        ]}>
          {isPositive ? '▲' : '▼'} {Math.abs(percent)}%
        </Text>
        <Text style={styles.badgeLabel}> vs {label}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeader}>EXERCISE PROGRESS</Text>
      
      {/* Exercise Picker Button */}
      <TouchableOpacity
        style={styles.pickerButton}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <Text style={styles.pickerButtonText}>
          {selectedExercise ? selectedExercise.name : 'Select Exercise...'}
        </Text>
        <ChevronDown size={18} color="#6B7280" />
      </TouchableOpacity>

      {/* Picker Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Choose Exercise</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.closeBtn}>Close</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={exercises}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.exerciseItem}
                onPress={() => {
                  onSelectExercise(item.id);
                  setModalVisible(false);
                }}
              >
                <View>
                  <Text style={styles.exerciseItemText}>{item.name}</Text>
                  <Text style={styles.exerciseItemSub}>{item.muscleGroup}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </SafeAreaView>
      </Modal>

      {/* Comparison and Trends */}
      {selectedExerciseId ? (
        comparison && comparison.historyPoints.length > 0 ? (
          <View style={styles.statsContainer}>
            
            {/* Direct comparison cards */}
            <View style={styles.comparisonGrid}>
              
              {/* Max Weight Card */}
              <View style={styles.compareCard}>
                <View style={styles.compareCardHeader}>
                  <Text style={styles.compareLabel}>Max Weight</Text>
                  <Text style={styles.compareVal}>{comparison.latestMaxWeight} kg</Text>
                </View>
                {comparison.previousWorkoutDate && (
                  renderBadge(comparison.weightChangePercent, `${comparison.prevMaxWeight}kg`)
                )}
              </View>

              {/* Max Reps Card */}
              <View style={styles.compareCard}>
                <View style={styles.compareCardHeader}>
                  <Text style={styles.compareLabel}>Max Reps</Text>
                  <Text style={styles.compareVal}>{comparison.latestMaxReps} reps</Text>
                </View>
                {comparison.previousWorkoutDate && (
                  renderBadge(comparison.repsChangePercent, `${comparison.prevMaxReps} reps`)
                )}
              </View>

              {/* Total Volume Card */}
              <View style={styles.compareCard}>
                <View style={styles.compareCardHeader}>
                  <Text style={styles.compareLabel}>Total Volume</Text>
                  <Text style={styles.compareVal}>{comparison.latestVolume.toLocaleString()} kg</Text>
                </View>
                {comparison.previousWorkoutDate && (
                  renderBadge(comparison.volumeChangePercent, `${comparison.prevVolume}kg`)
                )}
              </View>
            </View>

            {/* Historical trend list graph */}
            <Text style={styles.subHeader}>HISTORICAL TRENDS</Text>
            <View style={styles.trendContainer}>
              {comparison.historyPoints.map((pt, idx) => {
                const ratio = maxWeightInHistory > 0 ? pt.maxWeight / maxWeightInHistory : 0;
                return (
                  <View key={idx} style={styles.trendRow}>
                    <Text style={styles.trendDate}>
                      {new Date(pt.date).toLocaleDateString(undefined, {month: 'numeric', day: 'numeric'})}
                    </Text>
                    <View style={styles.trendTrack}>
                      <View style={[styles.trendBar, { width: `${Math.max(10, ratio * 100)}%` }]} />
                    </View>
                    <View style={styles.trendValContainer}>
                      <Text style={styles.trendVal}>{pt.maxWeight} kg</Text>
                      <Text style={styles.trendSubVal}>1RM: {pt.estimatedOneRM} kg</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <HelpCircle size={24} color="#9CA3AF" />
            <Text style={styles.noHistory}>No logged history for this exercise.</Text>
          </View>
        )
      ) : (
        <View style={styles.emptyCard}>
          <TrendingUp size={24} color="#9CA3AF" />
          <Text style={styles.noHistory}>Select an exercise to analyze its progress.</Text>
        </View>
      )}
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
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  pickerButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
  },
  closeBtn: {
    fontSize: 15,
    color: '#3B82F6',
    fontWeight: '700',
  },
  listContent: {
    paddingVertical: 8,
  },
  exerciseItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  exerciseItemText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  exerciseItemSub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 3,
    fontWeight: '500',
  },
  statsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  comparisonGrid: {
    flexDirection: 'column',
    gap: 14,
    marginBottom: 22,
  },
  compareCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  compareCardHeader: {
    flexDirection: 'column',
  },
  compareLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  compareVal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginTop: 2,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  badgeLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  subHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 0.5,
    marginBottom: 10,
    marginTop: 6,
    textTransform: 'uppercase',
  },
  trendContainer: {
    flexDirection: 'column',
    gap: 14,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendDate: {
    fontSize: 12,
    color: '#6B7280',
    width: 40,
    fontWeight: '500',
  },
  trendTrack: {
    flex: 1,
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  trendBar: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 4,
  },
  trendValContainer: {
    alignItems: 'flex-end',
    width: 105,
  },
  trendVal: {
    fontSize: 12,
    color: '#111827',
    fontWeight: '700',
  },
  trendSubVal: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 1,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  noHistory: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '600',
    textAlign: 'center',
  },
});
