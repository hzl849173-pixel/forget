import React, { useState, useRef, useEffect } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Modal, Animated, StyleSheet } from 'react-native';
import { useWorkoutAnalytics } from '../../hooks/use-workout-analytics';
import { PersonalRecordsView } from './PersonalRecordsView';
import { ExerciseProgressView } from './ExerciseProgressView';
import { MuscleAnalysisView } from './MuscleAnalysisView';
import { MonthlySummaryView } from './MonthlySummaryView';
import { WorkoutInsightsView } from './WorkoutInsightsView';
import { AchievementsView } from './AchievementsView';
import { Flame, Trophy, Award, Sparkles, X } from 'lucide-react-native';

type DashboardTab = 'overview' | 'analytics' | 'milestones';

export const ProgressDashboard: React.FC = () => {
  const {
    overallStats,
    prs,
    exerciseComparison,
    selectedExerciseId,
    setSelectedExerciseId,
    muscleGroupDistribution,
    monthlySummary,
    advancedInsights,
    achievements,
    exercises,
  } = useWorkoutAnalytics();

  const [activeTab, setActiveTab] = useState<DashboardTab | null>(null);
  const [modalTab, setModalTab] = useState<DashboardTab | null>(null);
  const modalAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (modalTab) {
      modalAnim.setValue(0);
      Animated.spring(modalAnim, {
        toValue: 1,
        damping: 28,
        stiffness: 300,
        mass: 1,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(modalAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }).start();
    }
  }, [modalTab, modalAnim]);

  const totalWorkouts = overallStats?.totalWorkouts || 0;
  const currentStreak = overallStats?.currentStreak || 0;
  const unlockedAchievementsCount = achievements.filter((a) => a.isUnlocked).length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      
      {/* Premium Hero Summary Banner */}
      <View style={styles.heroBanner}>
        <View style={styles.heroHeader}>
          <View style={styles.heroTextContainer}>
            <Text style={styles.heroTitle}>Your Progress</Text>
            <Text style={styles.heroSubtitle}>Track consistency, improvements, and milestones</Text>
          </View>
          {currentStreak > 0 && (
            <View style={styles.streakBadge}>
              <Flame size={20} color="#FF8A00" fill="#FF8A0030" strokeWidth={2.5} />
              <Text style={styles.streakBadgeText}>{currentStreak}</Text>
            </View>
          )}
        </View>

        <View style={styles.divider} />

        <View style={styles.summaryStatsRow}>
          <View style={styles.summaryStatItem}>
            <Award size={18} color="#3B82F6" />
            <View>
              <Text style={styles.summaryStatVal}>{totalWorkouts}</Text>
              <Text style={styles.summaryStatLabel}>Workouts</Text>
            </View>
          </View>

          <View style={styles.summaryStatItem}>
            <Trophy size={18} color="#D97706" />
            <View>
              <Text style={styles.summaryStatVal}>{prs.length}</Text>
              <Text style={styles.summaryStatLabel}>PRs Set</Text>
            </View>
          </View>

          <View style={styles.summaryStatItem}>
            <Sparkles size={18} color="#10B981" />
            <View>
              <Text style={styles.summaryStatVal}>{unlockedAchievementsCount}</Text>
              <Text style={styles.summaryStatLabel}>Milestones</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Segmented Tab Control */}
      <View style={styles.tabRow}>
        {(['overview', 'analytics', 'milestones'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
            onPress={() => {
              setActiveTab(tab);
              setModalTab(tab);
            }}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content area is empty - tabs open in modal */}

      {/* AI Workout Insights Carousel - Always Visible */}
      <WorkoutInsightsView insights={advancedInsights} />

      {/* Tab Content Modal */}
      <Modal
        visible={modalTab !== null}
        transparent={true}
        animationType="none"
        onRequestClose={() => setModalTab(null)}
      >
        <View style={{ flex: 1 }}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setModalTab(null)}
          >
            <Animated.View style={[styles.modalOverlay, { opacity: modalAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.5] }) }]} />
          </TouchableOpacity>
          <Animated.View
            style={[styles.modalContentWrapper, { transform: [{ translateY: modalAnim.interpolate({ inputRange: [0, 1], outputRange: [400, 0] }) }] }]}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{modalTab ? modalTab.charAt(0).toUpperCase() + modalTab.slice(1) : ''}</Text>
                <TouchableOpacity onPress={() => setModalTab(null)} activeOpacity={0.7}>
                  <X size={20} color="#6B7280" strokeWidth={2.5} />
                </TouchableOpacity>
              </View>
              <View style={styles.modalDivider} />
              <ScrollView showsVerticalScrollIndicator={false}>
                {modalTab === 'overview' && (
                  <>
                    <MonthlySummaryView summary={monthlySummary} />
                  </>
                )}
                {modalTab === 'analytics' && (
                  <>
                    <MuscleAnalysisView distribution={muscleGroupDistribution} />
                    <ExerciseProgressView
                      exercises={exercises}
                      selectedExerciseId={selectedExerciseId}
                      onSelectExercise={setSelectedExerciseId}
                      comparison={exerciseComparison}
                    />
                  </>
                )}
                {modalTab === 'milestones' && (
                  <>
                    <PersonalRecordsView prs={prs} />
                    <AchievementsView achievements={achievements} />
                  </>
                )}
              </ScrollView>
            </View>
          </Animated.View>
        </View>
      </Modal>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  contentContainer: {
    paddingVertical: 14,
    gap: 0,
  },
  heroBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroTextContainer: {
    flex: 1,
    paddingRight: 10,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },
  heroSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    fontWeight: '500',
    lineHeight: 16,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF8A0012',
    borderColor: '#FF8A0025',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 4,
  },
  streakBadgeText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#B45309',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 14,
  },
  summaryStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryStatVal: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  summaryStatLabel: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginTop: 1,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#E5E7EB',
    borderRadius: 10,
    padding: 3,
    marginHorizontal: 16,
    marginBottom: 6,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
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
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#111827',
    fontWeight: '800',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000',
  },
  modalContentWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '85%',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 32,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
  },
});

export default ProgressDashboard;
