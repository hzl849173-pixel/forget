import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { AdvancedInsights } from '../../hooks/use-workout-analytics';
import { TrendingUp, ShieldAlert, Dumbbell, Calendar, Moon, AlertCircle, X, Info } from 'lucide-react-native';

interface WorkoutInsightsViewProps {
  insights: AdvancedInsights;
}

export const WorkoutInsightsView: React.FC<WorkoutInsightsViewProps> = ({ insights }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState<{ title: string; message: string; icon: React.ReactNode } | null>(null);

  const showInfo = (title: string, message: string, icon: React.ReactNode) => {
    setModalData({ title, message, icon });
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setTimeout(() => setModalData(null), 300); // clear after animation
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeader}>WORKOUT INSIGHTS</Text>

      <View style={styles.gridContainer}>
        {/* Row 1 */}
        <View style={styles.gridRow}>
          {/* Strongest improving */}
          <TouchableOpacity 
            style={styles.card} 
            activeOpacity={0.7}
            onPress={() => showInfo(
              'Strongest Improving', 
              'This shows the exercise where your estimated 1-Rep Max (1RM) has increased the most compared to your past workouts. Keep pushing on this lift!',
              <TrendingUp size={32} color="#10B981" strokeWidth={2} />
            )}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.iconWrapper, { backgroundColor: '#10B98112' }]}>
                <TrendingUp size={16} color="#10B981" strokeWidth={2.5} />
              </View>
              <Text style={styles.label} numberOfLines={1}>Strongest Improving</Text>
            </View>
            <Text style={styles.value} numberOfLines={2}>
              {insights.strongestImprovingExercise
                ? `${insights.strongestImprovingExercise.name}\n(+${insights.strongestImprovingExercise.pctIncrease}% 1RM)`
                : 'N/A (needs 2+ logs)'}
            </Text>
          </TouchableOpacity>

          {/* Longest stagnant */}
          <TouchableOpacity 
            style={styles.card} 
            activeOpacity={0.7}
            onPress={() => showInfo(
              'Longest Stagnant', 
              'This highlights the exercise that has gone the longest number of days without you hitting a new Personal Record (PR). Consider changing the rep range or volume.',
              <AlertCircle size={32} color="#EF4444" strokeWidth={2} />
            )}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.iconWrapper, { backgroundColor: '#EF444412' }]}>
                <AlertCircle size={16} color="#EF4444" strokeWidth={2.5} />
              </View>
              <Text style={styles.label} numberOfLines={1}>Longest Stagnant</Text>
            </View>
            <Text style={styles.value} numberOfLines={2}>
              {insights.longestStagnantExercise
                ? `${insights.longestStagnantExercise.name}\n(${insights.longestStagnantExercise.daysStagnant} days no PR)`
                : 'N/A'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Row 2 */}
        <View style={styles.gridRow}>
          {/* Most frequent muscle */}
          <TouchableOpacity 
            style={styles.card} 
            activeOpacity={0.7}
            onPress={() => showInfo(
              'Most Frequent Muscle', 
              'This is the muscle group you have trained with the highest number of total sets across all your logged workouts.',
              <Dumbbell size={32} color="#3B82F6" strokeWidth={2} />
            )}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.iconWrapper, { backgroundColor: '#3B82F612' }]}>
                <Dumbbell size={16} color="#3B82F6" strokeWidth={2.5} />
              </View>
              <Text style={styles.label} numberOfLines={1}>Most Frequent Muscle</Text>
            </View>
            <Text style={styles.value} numberOfLines={2}>
              {insights.mostFrequentMuscle
                ? `${insights.mostFrequentMuscle.muscle}\n(${insights.mostFrequentMuscle.count} sets)`
                : 'N/A'}
            </Text>
          </TouchableOpacity>

          {/* Least frequent muscle */}
          <TouchableOpacity 
            style={styles.card} 
            activeOpacity={0.7}
            onPress={() => showInfo(
              'Least Frequent Muscle', 
              'This is the muscle group you have trained the least. Consider adding exercises for this muscle to maintain a balanced and injury-free physique.',
              <ShieldAlert size={32} color="#F59E0B" strokeWidth={2} />
            )}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.iconWrapper, { backgroundColor: '#F59E0B12' }]}>
                <ShieldAlert size={16} color="#F59E0B" strokeWidth={2.5} />
              </View>
              <Text style={styles.label} numberOfLines={1}>Least Frequent Muscle</Text>
            </View>
            <Text style={styles.value} numberOfLines={2}>
              {insights.leastFrequentMuscle
                ? `${insights.leastFrequentMuscle.muscle}\n(${insights.leastFrequentMuscle.count} sets)`
                : 'N/A'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Row 3 */}
        <View style={styles.gridRow}>
          {/* Average workouts per week */}
          <TouchableOpacity 
            style={styles.card} 
            activeOpacity={0.7}
            onPress={() => showInfo(
              'Average Workouts', 
              'This is the average number of workouts you complete per week, based on your entire workout history. Consistency is the key to progress!',
              <Calendar size={32} color="#8B5CF6" strokeWidth={2} />
            )}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.iconWrapper, { backgroundColor: '#8B5CF612' }]}>
                <Calendar size={16} color="#8B5CF6" strokeWidth={2.5} />
              </View>
              <Text style={styles.label} numberOfLines={1}>Average Workouts</Text>
            </View>
            <Text style={styles.value} numberOfLines={2}>
              {insights.avgWorkoutsPerWeek} / week
            </Text>
          </TouchableOpacity>

          {/* Average rest days between workouts */}
          <TouchableOpacity 
            style={styles.card} 
            activeOpacity={0.7}
            onPress={() => showInfo(
              'Average Rest Days', 
              'This is the average number of rest days you take off between your workout sessions. Muscle growth happens during recovery.',
              <Moon size={32} color="#6B7280" strokeWidth={2} />
            )}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.iconWrapper, { backgroundColor: '#6B728012' }]}>
                <Moon size={16} color="#6B7280" strokeWidth={2.5} />
              </View>
              <Text style={styles.label} numberOfLines={1}>Average Rest Days</Text>
            </View>
            <Text style={styles.value} numberOfLines={2}>
              {insights.avgRestDays} days
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Premium Info Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            
            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <X size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <View style={styles.modalIconContainer}>
              {modalData?.icon || <Info size={32} color="#3B82F6" strokeWidth={2} />}
            </View>

            <Text style={styles.modalTitle}>{modalData?.title}</Text>
            <Text style={styles.modalMessage}>{modalData?.message}</Text>

            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={closeModal}
              activeOpacity={0.8}
            >
              <Text style={styles.actionButtonText}>Got it</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>
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
  gridContainer: {
    flexDirection: 'column',
    gap: 12,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  card: {
    width: '48.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minHeight: 116,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  iconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    flex: 1,
    fontSize: 10,
    color: '#6B7280',
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  value: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1F2937',
    lineHeight: 20,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
  },
  modalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginTop: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 15,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  actionButton: {
    backgroundColor: '#111827',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
