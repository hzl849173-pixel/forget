import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';

const MUSCLE_IMAGES = {
  Chest: require('@/assets/images/muscle_chest.png'),
  Triceps: require('@/assets/images/muscle_triceps.png'),
  Biceps: require('@/assets/images/muscle_biceps.png'),
  Back: require('@/assets/images/muscle_back.png'),
  Legs: require('@/assets/images/muscle_legs.png'),
  Abs: require('@/assets/images/muscle_abs.png'),
};

const categoryColors: Record<string, string> = {
  Chest: '#10B981',
  Triceps: '#06B6D4',
  Biceps: '#3B82F6',
  Back: '#A855F7',
  Legs: '#FF8A00',
  Abs: '#10B981',
};

const ALT_COLORS = [
  '#A855F7', // Purple
  '#FACC15', // Yellow
  '#3B82F6', // Blue
  '#FF8A00', // Orange
];

const ALT_IMAGES = [
  require('@/assets/images/eq_dumbbell.png'),
  require('@/assets/images/eq_cable.png'),
  require('@/assets/images/eq_barbell.png'),
];
import * as Haptics from 'expo-haptics';
import {
  Star,
  Flame,
  Dumbbell,
  Clock,
  Trash2,
  Calendar,
  Plus,
  Check,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
} from 'lucide-react-native';

import { useWorkout, WorkoutSet, WorkoutSession } from '@/hooks/use-workout-storage';
import { MUSCLE_GROUPS, MuscleGroup } from '@/constants/exercises';
import { ProgressGrid } from '@/components/ui/progress-grid';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { IncrementInput } from '@/components/ui/input';
import { MuscleBadge } from '@/components/ui/muscle-badge';

const generateId = () => Date.now().toString() + Math.random().toString(36).substring(2, 9);

export default function SinglePageLandingScreen() {
  const {
    exercises,
    history,
    addCompletedWorkout,
    toggleFavoriteExercise,
    deleteWorkout,
    getPreviousWorkoutForExercise,
  } = useWorkout();

  // Active view segment: 'log' | 'history'
  const [activeSegment, setActiveSegment] = useState<'log' | 'history'>('log');

  // Workout logging states
  const [selectedModalMuscle, setSelectedModalMuscle] = useState<MuscleGroup | null>(null);
  const [search, setSearch] = useState('');
  
  // Expanded exercise state (active logger)
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null);
  const [activeSets, setActiveSets] = useState<WorkoutSet[]>([]);
  const [loggingStartTime, setLoggingStartTime] = useState<number>(0);

  const handleSelectMuscleCard = (muscle: MuscleGroup) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedModalMuscle(muscle);
    setSearch('');
    setExpandedExerciseId(null);
    setActiveSets([]);
  };

  // Auto-populate sets when expanding an exercise
  const handleToggleExpand = (exerciseId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (expandedExerciseId === exerciseId) {
      setExpandedExerciseId(null);
      setActiveSets([]);
    } else {
      setExpandedExerciseId(exerciseId);
      setLoggingStartTime(Date.now());

      const previousLog = getPreviousWorkoutForExercise(exerciseId);
      const initialSets: WorkoutSet[] = [];

      if (previousLog && previousLog.sets.length > 0) {
        previousLog.sets.forEach((set) => {
          initialSets.push({
            id: generateId(),
            weight: set.weight,
            reps: set.reps,
            isCompleted: false,
          });
        });
      } else {
        initialSets.push({
          id: generateId(),
          weight: 0,
          reps: 0,
          isCompleted: false,
        });
      }
      setActiveSets(initialSets);
    }
  };

  const handleAddSet = (exerciseId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const previousLog = getPreviousWorkoutForExercise(exerciseId);
    const currentSetCount = activeSets.length;
    let newWeight = 0;
    let newReps = 0;

    if (previousLog && previousLog.sets.length > 0) {
      const correspondingSet = previousLog.sets[currentSetCount] || previousLog.sets[previousLog.sets.length - 1];
      newWeight = correspondingSet.weight;
      newReps = correspondingSet.reps;
    } else if (currentSetCount > 0) {
      const lastSet = activeSets[currentSetCount - 1];
      newWeight = lastSet.weight;
      newReps = lastSet.reps;
    }

    setActiveSets([
      ...activeSets,
      {
        id: generateId(),
        weight: newWeight,
        reps: newReps,
        isCompleted: false,
      },
    ]);
  };

  const handleUpdateSet = (setId: string, updates: Partial<WorkoutSet>) => {
    setActiveSets(activeSets.map((s) => (s.id === setId ? { ...s, ...updates } : s)));
  };

  const handleRemoveSet = (setId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveSets(activeSets.filter((s) => s.id !== setId));
  };

  const handleToggleSetComplete = (setId: string, isCompleted: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setActiveSets(activeSets.map((s) => (s.id === setId ? { ...s, isCompleted: !isCompleted } : s)));
  };

  const handleSaveWorkout = async (exerciseId: string) => {
    const completedSets = activeSets.filter((s) => s.isCompleted);
    if (completedSets.length === 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Save Error', 'Please complete at least one set before saving.');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const elapsedMinutes = Math.max(1, Math.round((Date.now() - loggingStartTime) / 60000));
    
    await addCompletedWorkout(exerciseId, activeSets, elapsedMinutes);
    
    // Reset logger states
    setExpandedExerciseId(null);
    setActiveSets([]);
    setSelectedModalMuscle(null);
  };

  const handleDeleteHistoryLog = (id: string, name: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      'Delete Record',
      `Are you sure you want to permanently delete "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteWorkout(id);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  };

  const getSessionMuscles = (session: WorkoutSession): MuscleGroup[] => {
    const muscles = new Set<MuscleGroup>();
    session.exercises.forEach((logEx) => {
      const details = exercises.find((e) => e.id === logEx.exerciseId);
      if (details) {
        muscles.add(details.muscleGroup);
      }
    });
    return Array.from(muscles);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatHistoryDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Filter exercises by muscle selection & search query inside the modal popup
  const filteredExercises = exercises.filter((ex) => {
    const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase());
    const matchesMuscle = ex.muscleGroup === (selectedModalMuscle || 'Chest');
    return matchesSearch && matchesMuscle;
  });

  // Sort exercises so favorites appear first
  const sortedExercises = [...filteredExercises].sort((a, b) => {
    if (a.isFavorite && !b.isFavorite) return -1;
    if (!a.isFavorite && b.isFavorite) return 1;
    return 0;
  });

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inner}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Landing Header */}
          <View style={styles.header}>
            <View style={styles.headerRow}>
              <View>
                <Text style={styles.greeting}>Workout Journal</Text>
                <Text style={styles.dateSub}>Log your best. Forget the rest.</Text>
              </View>
              <View style={styles.headerButtons}>
                <TouchableOpacity
                  style={styles.headerRoundBtn}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  activeOpacity={0.7}
                >
                  <Search size={16} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.headerRoundBtn}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  activeOpacity={0.7}
                >
                  <Filter size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Banner Lift Card from screenshot */}
          <View style={styles.bannerCard}>
            <View style={styles.bannerLeft}>
              <View style={styles.bannerIconCircle}>
                <Flame size={18} color="#10B981" fill="#10B981" />
              </View>
              <View>
                <Text style={styles.bannerTitle}>Ready for a lift?</Text>
                <Text style={styles.bannerSubtitle}>Log details in under 30 seconds</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.bannerBtn}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                handleSelectMuscleCard('Chest');
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.bannerBtnText}>Start Session</Text>
            </TouchableOpacity>
          </View>

          {/* Segment Selector Toggle */}
          <View style={styles.segmentContainer}>
            <TouchableOpacity
              style={[styles.segmentBtn, activeSegment === 'log' ? styles.segmentBtnActive : null]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveSegment('log');
              }}
              activeOpacity={0.8}
            >
              <Text style={[styles.segmentText, activeSegment === 'log' ? styles.segmentTextActive : null]}>LOG WORKOUT</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.segmentBtn, activeSegment === 'history' ? styles.segmentBtnActive : null]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveSegment('history');
              }}
              activeOpacity={0.8}
            >
              <Text style={[styles.segmentText, activeSegment === 'history' ? styles.segmentTextActive : null]}>HISTORY</Text>
            </TouchableOpacity>
          </View>

          {/* Segment Switch Logic */}
          {activeSegment === 'log' ? (
            <>
              {/* Muscle Selector Cards Grid */}
              <Text style={styles.sectionHeader}>SELECT MUSCLE GROUP</Text>
              <View style={styles.muscleGrid}>
                {MUSCLE_GROUPS.map((muscle) => {
                  const muscleColor = categoryColors[muscle] || '#10B981';
                  return (
                    <TouchableOpacity
                      key={muscle}
                      style={[
                        styles.muscleCard,
                        {
                          borderColor: muscleColor,
                          backgroundColor: `${muscleColor}10`, // Permanent soft glow background
                        }
                      ]}
                      onPress={() => handleSelectMuscleCard(muscle)}
                      activeOpacity={0.85}
                    >
                      <Text style={[styles.muscleText, { color: muscleColor }]}>
                        {muscle.toUpperCase()}
                      </Text>
                      <Image
                        source={MUSCLE_IMAGES[muscle]}
                        style={[styles.muscleImage, { opacity: 0.85 }]}
                        contentFit="contain"
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Consistency Graph */}
              <Text style={styles.sectionHeader}>ACTIVITY TRACKER</Text>
              <ProgressGrid history={history} />

              {/* Recent Workouts list matching screenshot */}
              <View style={styles.recentWorkoutsHeader}>
                <Text style={styles.sectionHeader}>RECENT WORKOUTS</Text>
                <TouchableOpacity
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setActiveSegment('history');
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.viewAllText}>View All</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.recentList}>
                {history.slice(0, 3).map((item) => {
                  const sessionMuscles = getSessionMuscles(item);
                  const totalVolume = item.exercises.reduce((sum, ex) => {
                    return sum + ex.sets.reduce((setSum, s) => setSum + (s.weight * s.reps), 0);
                  }, 0);

                  // Formatting date: today, yesterday, or date
                  const getRelativeDay = (dateStr: string) => {
                    const today = new Date().toDateString();
                    const yesterday = new Date(Date.now() - 86400000).toDateString();
                    const sessionDate = new Date(dateStr).toDateString();

                    if (sessionDate === today) return 'Today';
                    if (sessionDate === yesterday) return 'Yesterday';
                    return formatDate(dateStr);
                  };

                  const primaryMuscle = sessionMuscles[0] || 'Chest';
                  const circleColor = categoryColors[primaryMuscle] || '#10B981';

                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[styles.recentCard, { borderLeftWidth: 4, borderLeftColor: circleColor }]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setActiveSegment('history');
                      }}
                      activeOpacity={0.85}
                    >
                      <View style={styles.recentLeft}>
                        {/* Circular muscle group category outline icon */}
                        <View style={[styles.recentIconCircle, { backgroundColor: `${circleColor}15`, borderColor: circleColor, borderWidth: 1.5 }]}>
                          <Dumbbell size={16} color={circleColor} />
                        </View>
                        
                        <View style={styles.recentInfo}>
                          <Text style={styles.recentName}>{item.name}</Text>
                          <Text style={styles.recentMuscles} numberOfLines={1}>
                            {sessionMuscles.join(' • ')}
                          </Text>
                          
                          {/* Exercises and Duration Row */}
                          <View style={styles.recentMetaRow}>
                            <Text style={styles.recentMetaText}>
                              💪 {item.exercises[0]?.sets.length || 0} sets
                            </Text>
                            <Text style={styles.recentMetaDot}>•</Text>
                            <Text style={styles.recentMetaText}>
                              ⏱️ {item.duration} min
                            </Text>
                          </View>
                        </View>
                      </View>

                      {/* Right Details */}
                      <View style={styles.recentRight}>
                        <Text style={styles.recentDayText}>{getRelativeDay(item.date)}</Text>
                        <Text style={styles.recentVolumeText}>{totalVolume.toLocaleString()} kg</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
                {history.length === 0 && (
                  <Card style={styles.emptyRecentCard}>
                    <Text style={styles.emptyRecentText}>No recent sessions completed.</Text>
                  </Card>
                )}
              </View>
            </>
          ) : (
            /* History View Section */
            <View style={styles.historySection}>
              {history.length === 0 ? (
                <Card style={styles.welcomeCard}>
                  <Calendar size={32} color="#10B981" strokeWidth={1.5} />
                  <Text style={styles.welcomeTitle}>No workout history yet</Text>
                  <Text style={styles.welcomeDesc}>
                    Log completed sets above. Your session summary data cards will load here.
                  </Text>
                </Card>
              ) : (
                history.map((item) => {
                  const sessionMuscles = getSessionMuscles(item);
                  return (
                    <Card key={item.id} style={[styles.historyLogCard, { borderLeftWidth: 4, borderLeftColor: categoryColors[sessionMuscles[0] || 'Chest'] || '#10B981' }]}>
                      <View style={styles.historyCardHeader}>
                        <View style={styles.historyTitleCol}>
                          <Text style={styles.historySessionName}>{item.name}</Text>
                          <Text style={styles.historyDate}>{formatHistoryDate(item.date).toUpperCase()}</Text>
                        </View>
                        <TouchableOpacity
                          style={styles.deleteLogBtn}
                          onPress={() => handleDeleteHistoryLog(item.id, item.name)}
                          activeOpacity={0.6}
                        >
                          <Trash2 size={16} color="#EF4444" strokeWidth={2} />
                        </TouchableOpacity>
                      </View>

                      {/* Displaying direct detailed receipts of the sets completed */}
                      <View style={styles.historySetsReceipt}>
                        {item.exercises.map((logEx) => (
                          <View key={logEx.exerciseId} style={styles.receiptExerciseGroup}>
                            {logEx.sets.map((set, setIndex) => (
                              <View key={set.id} style={styles.receiptSetRow}>
                                <Text style={styles.receiptSetLabel}>SET {setIndex + 1}</Text>
                                <Text style={styles.receiptSetValue}>{set.weight} kg × {set.reps}</Text>
                              </View>
                            ))}
                          </View>
                        ))}
                      </View>

                      <View style={styles.historyFooter}>
                        <View style={styles.historyDurationRow}>
                          <Clock size={11} color="#9CA3AF" strokeWidth={2} />
                          <Text style={styles.historyDurationText}>{item.duration} min active</Text>
                        </View>
                        <View style={styles.historyBadgeRow}>
                          {sessionMuscles.map((m) => (
                            <MuscleBadge key={m} muscleGroup={m} size="sm" />
                          ))}
                        </View>
                      </View>
                    </Card>
                  );
                })
              )}
            </View>
          )}
        </ScrollView>

        {/* Muscle Workout list popup modal */}
        <Modal
          visible={selectedModalMuscle !== null}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setSelectedModalMuscle(null)}
        >
          <View style={styles.modalContainer}>
            <SafeAreaView style={styles.modalInnerContainer} edges={['top', 'bottom', 'left', 'right']}>
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.modalKeyboardContainer}
              >
                {/* Modal Header */}
                <View style={styles.modalHeader}>
                  <View>
                    <Text style={styles.modalTitle}>
                      {(selectedModalMuscle || '').toUpperCase()} WORKOUTS
                    </Text>
                    <Text style={styles.modalSubtitle}>Select an exercise to log completed sets</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.modalCloseBtn}
                    onPress={() => setSelectedModalMuscle(null)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.modalCloseBtnText}>Close</Text>
                  </TouchableOpacity>
                </View>

                {/* Top Horizontal Muscle Switcher to migrate groups */}
                <View style={styles.modalSwitcherRow}>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.modalSwitcherScroll}
                  >
                    {MUSCLE_GROUPS.map((muscle) => {
                      const isActive = selectedModalMuscle === muscle;
                      const activeColor = categoryColors[muscle] || '#10B981';

                      return (
                        <TouchableOpacity
                          key={muscle}
                          style={[
                            styles.modalSwitcherPill,
                            isActive && {
                              borderColor: activeColor,
                              backgroundColor: `${activeColor}20`,
                            },
                          ]}
                          onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            setSelectedModalMuscle(muscle);
                            setSearch(''); // Clear search on switch
                            setExpandedExerciseId(null); // Collapse open details
                          }}
                          activeOpacity={0.8}
                        >
                          <Text
                            style={[
                              styles.modalSwitcherPillText,
                              isActive && { color: activeColor, fontWeight: '800' },
                            ]}
                          >
                            {muscle.toUpperCase()}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>

                {/* Search filter input inside modal */}
                <View style={styles.searchContainer}>
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search exercises..."
                    placeholderTextColor="#6B7280"
                    value={search}
                    onChangeText={setSearch}
                    autoCorrect={false}
                  />
                </View>

                {/* Exercises List */}
                <FlatList
                  data={sortedExercises}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={styles.modalListContent}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  renderItem={({ item, index }) => {
                    const isExpanded = expandedExerciseId === item.id;
                    const previousLog = getPreviousWorkoutForExercise(item.id);

                    return (
                      <Card style={styles.exerciseCard}>
                        {/* Exercise Header Clickable Row */}
                        <View style={styles.exerciseHeaderRow}>
                          <TouchableOpacity
                            style={styles.exerciseInfoClick}
                            onPress={() => handleToggleExpand(item.id)}
                            activeOpacity={0.85}
                          >
                            {/* Exercise aesthetic line-art outline icon thumbnail badge */}
                            {(() => {
                               const exerciseColor = ALT_COLORS[index % 4];
                               const exerciseImage = ALT_IMAGES[index % 3];
                               return (
                                 <View style={[
                                   styles.exerciseBadgeCircle,
                                   {
                                     backgroundColor: `${exerciseColor}12`, // Soft transparent backdrop
                                   }
                                 ]}>
                                   <Image
                                     source={exerciseImage}
                                     style={styles.exerciseBadgeImg}
                                     contentFit="contain"
                                   />
                                 </View>
                               );
                             })()}

                            <Text style={styles.exerciseName}>{item.name}</Text>
                            {isExpanded ? (
                              <ChevronUp size={16} color="#9CA3AF" />
                            ) : (
                              <ChevronDown size={16} color="#9CA3AF" />
                            )}
                          </TouchableOpacity>

                          {/* Favorite button */}
                          <TouchableOpacity
                            style={styles.favBtn}
                            onPress={() => {
                              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                              toggleFavoriteExercise(item.id);
                            }}
                            activeOpacity={0.7}
                          >
                            <Star
                              size={18}
                              color={item.isFavorite ? '#FF8A00' : '#4B5563'}
                              fill={item.isFavorite ? '#FF8A00' : 'transparent'}
                              strokeWidth={2}
                            />
                          </TouchableOpacity>
                        </View>

                        {/* Accordion sets logger content */}
                        {isExpanded && (
                          <View style={styles.loggerBody}>
                            {/* Previous Stat comparison */}
                            <View style={styles.prevLogCard}>
                              <Text style={styles.prevLogLabel}>PREVIOUS LOG DETAILS</Text>
                              {previousLog ? (
                                <View style={styles.prevSetsRow}>
                                  {previousLog.sets.map((s, sIdx) => (
                                    <View key={s.id} style={styles.prevSetBubble}>
                                      <Text style={styles.prevSetIndex}>{sIdx + 1}</Text>
                                      <Text style={styles.prevSetText}>{s.weight}kg × {s.reps}</Text>
                                    </View>
                                  ))}
                                </View>
                              ) : (
                                <Text style={styles.prevEmptyText}>No previous stats found. First session logging.</Text>
                              )}
                            </View>

                            {/* Set Row Labels */}
                            <View style={styles.setRowLabels}>
                              <Text style={[styles.labelCol, styles.widthSet]}>SET</Text>
                              <Text style={[styles.labelCol, styles.widthWeight]}>WEIGHT</Text>
                              <Text style={[styles.labelCol, styles.widthReps]}>REPS</Text>
                              <Text style={[styles.labelCol, styles.widthCheck]}></Text>
                            </View>

                            {/* Active Sets logging list */}
                            {activeSets.map((set, index) => (
                              <View
                                key={set.id}
                                style={[
                                  styles.setRow,
                                  set.isCompleted ? styles.setRowCompleted : null,
                                ]}
                              >
                                <Text style={styles.setText}>{index + 1}</Text>
                                
                                <View style={styles.widthWeight}>
                                  <IncrementInput
                                    value={set.weight}
                                    step={2.5}
                                    onChange={(val) => handleUpdateSet(set.id, { weight: val })}
                                    placeholder="kg"
                                  />
                                </View>

                                <View style={styles.widthReps}>
                                  <IncrementInput
                                    value={set.reps}
                                    step={1}
                                    onChange={(val) => handleUpdateSet(set.id, { reps: val })}
                                    placeholder="reps"
                                  />
                                </View>

                                {/* Done checkbox */}
                                <View style={styles.widthCheck}>
                                  <TouchableOpacity
                                    style={[
                                      styles.checkBtn,
                                      set.isCompleted ? styles.checkBtnActive : styles.checkBtnInactive,
                                    ]}
                                    onPress={() => handleToggleSetComplete(set.id, set.isCompleted)}
                                    activeOpacity={0.7}
                                  >
                                    {set.isCompleted && <Check size={12} color="#000000" strokeWidth={3} />}
                                  </TouchableOpacity>
                                </View>

                                {/* Delete set */}
                                <TouchableOpacity
                                  style={styles.deleteSetBtn}
                                  onPress={() => handleRemoveSet(set.id)}
                                  activeOpacity={0.7}
                                >
                                  <Text style={styles.deleteSetText}>×</Text>
                                </TouchableOpacity>
                              </View>
                            ))}

                            {/* Action panel */}
                            <View style={styles.loggerActions}>
                              <TouchableOpacity
                                style={styles.addSetBtn}
                                onPress={() => handleAddSet(item.id)}
                                activeOpacity={0.75}
                              >
                                <Plus size={14} color="#9CA3AF" strokeWidth={2.5} />
                                <Text style={styles.addSetBtnText}>ADD SET</Text>
                              </TouchableOpacity>

                              <Button
                                title="Log Workout"
                                variant="primary"
                                onPress={() => handleSaveWorkout(item.id)}
                                style={styles.saveWorkoutBtn}
                              />
                            </View>
                          </View>
                        )}
                      </Card>
                    );
                  }}
                />
              </KeyboardAvoidingView>
            </SafeAreaView>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090A0F', // Midnight Obsidian background
  },
  inner: {
    flex: 1,
  },
  textBlack: {
    color: '#000000',
  },
  textWhite: {
    color: '#FFFFFF',
  },
  textGray: {
    color: '#9CA3AF',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 60,
  },
  header: {
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.8,
  },
  dateSub: {
    fontSize: 10,
    fontWeight: '800',
    color: '#9CA3AF',
    letterSpacing: 1,
    marginTop: 4,
  },
  // Segment Selector
  segmentContainer: {
    flexDirection: 'row',
    height: 44,
    borderRadius: 99,
    backgroundColor: '#13141C', // Obsidian card fill
    borderWidth: 1,
    borderColor: '#212330', // Gunmetal border
    padding: 3,
    marginBottom: 24,
  },
  segmentBtn: {
    flex: 1,
    borderRadius: 99,
    justifyContent: 'center',
    alignItems: 'center',
  },
  segmentBtnActive: {
    backgroundColor: '#1C1D26', // Highlight active segment obsidian fill
    borderWidth: 0.5,
    borderColor: '#212330',
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#6B7280',
    letterSpacing: 0.5,
  },
  segmentTextActive: {
    color: '#FFFFFF',
  },
  sectionHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: '#9CA3AF',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 6,
  },
  // Muscle Selection Grid
  muscleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 20,
  },
  muscleCard: {
    width: '31.5%', // 3 columns
    height: 70, // Shorter height for vertical compression
    borderRadius: 16,
    backgroundColor: '#13141C', // Obsidian Card Fill
    borderWidth: 1,
    borderColor: '#212330', // Gunmetal Border
    position: 'relative',
    overflow: 'hidden',
    padding: 10,
    justifyContent: 'flex-end',
  },
  muscleCardActive: {
    borderColor: '#10B981', // Green selection border
    backgroundColor: '#121F1A', // Subtle green selection backdrop glow
  },
  muscleText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    zIndex: 2,
  },
  muscleImage: {
    position: 'absolute',
    right: 2,
    bottom: 2,
    width: 48,
    height: 48,
    opacity: 0.55,
  },
  muscleImageActive: {
    opacity: 0.95,
  },
  pillDark: {
    backgroundColor: '#13141C',
    borderColor: '#212330',
  },
  // Exercises List & Accordions
  exerciseCard: {
    padding: 0,
    marginBottom: 10,
    overflow: 'hidden',
  },
  exerciseHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingLeft: 18,
  },
  exerciseInfoClick: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
    gap: 12,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  favBtn: {
    width: 52,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderLeftWidth: 1,
    borderLeftColor: '#252525',
  },
  // Inline Logger body
  loggerBody: {
    borderTopWidth: 1,
    borderTopColor: '#212330',
    padding: 16,
    backgroundColor: '#090A0F', // Obsidian deep background
  },
  prevLogCard: {
    backgroundColor: '#13141C',
    borderWidth: 1,
    borderColor: '#212330',
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
  },
  prevLogLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#9CA3AF',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  prevSetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  prevSetBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1C28', // Dark slate bubble fill
    borderWidth: 0.5,
    borderColor: '#212330',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 5,
  },
  prevSetIndex: {
    fontSize: 10,
    fontWeight: '800',
    color: '#9CA3AF',
  },
  prevSetText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  prevEmptyText: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '500',
  },
  setRowLabels: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  labelCol: {
    fontSize: 10, // Larger label text
    fontWeight: '800',
    color: '#9CA3AF',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  widthSet: {
    width: '10%',
    textAlign: 'left',
    color: '#FFFFFF',
    fontWeight: '800',
  },
  widthWeight: {
    width: '38%',
    alignItems: 'center',
  },
  widthReps: {
    width: '38%',
    alignItems: 'center',
  },
  widthCheck: {
    width: '14%',
    alignItems: 'flex-end',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12, // Taller rows for premium breathing room
    borderBottomWidth: 1,
    borderBottomColor: '#252525', // Subtle divider
    position: 'relative',
  },
  setRowCompleted: {
    opacity: 0.4,
  },
  setText: {
    width: '10%',
    fontSize: 16, // Larger indices
    fontWeight: '800',
    color: '#FFFFFF',
  },
  checkBtn: {
    height: 26, // Larger check button
    width: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  checkBtnInactive: {
    borderColor: '#4B5563',
    backgroundColor: 'transparent',
  },
  checkBtnActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  deleteSetBtn: {
    position: 'absolute',
    right: -12,
    top: 10,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteSetText: {
    color: '#4B5563',
    fontSize: 18,
    fontWeight: '300',
  },
  loggerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    gap: 12,
  },
  addSetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 42,
    paddingHorizontal: 16,
    borderRadius: 99,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#212330',
    backgroundColor: '#13141C',
    gap: 6,
  },
  addSetBtnText: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  saveWorkoutBtn: {
    flex: 1,
    height: 42,
  },
  // History items receipts
  historySection: {
    gap: 12,
  },
  historyLogCard: {
    padding: 18,
    marginBottom: 0,
  },
  historyCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  historyTitleCol: {
    gap: 3,
  },
  historySessionName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  historyDate: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  deleteLogBtn: {
    padding: 6,
  },
  historySetsReceipt: {
    borderTopWidth: 1,
    borderTopColor: '#252525',
    paddingVertical: 10,
    marginBottom: 10,
    gap: 4,
  },
  receiptExerciseGroup: {
    gap: 4,
  },
  receiptSetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  receiptSetLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#6B7280',
    letterSpacing: 0.3,
  },
  receiptSetValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  historyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#252525',
    paddingTop: 12,
  },
  historyDurationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  historyDurationText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#9CA3AF',
  },
  historyBadgeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  // Empty states
  welcomeCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  welcomeTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 12,
    marginBottom: 6,
  },
  welcomeDesc: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: '500',
  },
  // Modal Popup Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#090A0F', // Pure obsidian black
  },
  modalInnerContainer: {
    flex: 1,
  },
  modalKeyboardContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#252525',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  modalSubtitle: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '600',
    letterSpacing: 0.2,
    marginTop: 2,
  },
  modalCloseBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 99,
    backgroundColor: '#13141C',
    borderWidth: 1,
    borderColor: '#212330',
  },
  modalCloseBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#10B981', // Emerald Green Close
  },
  searchContainer: {
    paddingHorizontal: 24,
    marginTop: 16,
    marginBottom: 12,
  },
  searchInput: {
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#212330',
    backgroundColor: '#13141C',
    color: '#FFFFFF',
    paddingHorizontal: 16,
    fontSize: 14,
    fontWeight: '600',
  },
  modalListContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 4,
  },
  // Header Row Details
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  headerRoundBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#13141C',
    borderWidth: 1,
    borderColor: '#212330',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Recent Workouts Card Details
  recentWorkoutsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 8,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#10B981', // Green View All
  },
  recentList: {
    gap: 10,
    marginBottom: 20,
  },
  recentCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#13141C',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#212330',
    padding: 16,
  },
  recentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  recentIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  recentInfo: {
    flex: 1,
    gap: 2,
  },
  recentName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  recentMuscles: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  recentMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  recentMetaText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '700',
  },
  recentMetaDot: {
    fontSize: 10,
    color: '#64748B',
  },
  recentRight: {
    alignItems: 'flex-end',
    gap: 4,
    marginLeft: 10,
  },
  recentDayText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  recentVolumeText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#10B981', // Green volume highlight
    letterSpacing: -0.2,
  },
  emptyRecentCard: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyRecentText: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '600',
  },
  // Modal Switcher Pills Styles
  modalSwitcherRow: {
    paddingHorizontal: 24,
    marginTop: 14,
    marginBottom: 4,
  },
  modalSwitcherScroll: {
    gap: 8,
    paddingRight: 24,
  },
  modalSwitcherPill: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: '#212330',
    backgroundColor: '#13141C',
  },
  modalSwitcherPillText: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  // Exercise Item Badge Thumbnails Styles
  exerciseBadgeCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  exerciseBadgeImg: {
    width: 24,
    height: 24,
    opacity: 0.85,
  },
  // Banner Lift Card Styles
  bannerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#13141C',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#10B98135', // Subtle green glow border outline
    padding: 16,
    marginBottom: 20,
  },
  bannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bannerIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#10B98115',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#10B98140',
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  bannerSubtitle: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '600',
    marginTop: 2,
  },
  bannerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#10B981', // Solid Emerald Green button
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 99,
  },
  bannerBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#000000', // High contrast dark text on green button
  },
});
