import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
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
  'Abs & Shoulders': require('@/assets/images/muscle_shoulders_v2.png'),
};

const categoryColors: Record<string, string> = {
  Chest: '#10B981',
  Triceps: '#06B6D4',
  Biceps: '#3B82F6',
  Back: '#A855F7',
  Legs: '#FF8A00',
  'Abs & Shoulders': '#107C41',
};

const ALT_COLORS = [
  '#A855F7', // Purple
  '#FACC15', // Yellow
  '#3B82F6', // Blue
  '#FF8A00', // Orange
];

const KettlebellIcon = ({ color }: { color: string }) => (
  <View style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}>
    {/* Kettlebell Handle */}
    <View style={{
      width: 12,
      height: 9,
      borderRadius: 5,
      borderWidth: 1.5,
      borderColor: color,
      backgroundColor: 'transparent',
      position: 'absolute',
      top: 1,
    }} />
    {/* Kettlebell Body */}
    <View style={{
      width: 15,
      height: 15,
      borderRadius: 7.5,
      borderWidth: 1.5,
      borderColor: color,
      backgroundColor: 'transparent',
      position: 'absolute',
      bottom: 1,
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      {/* Inner weight marker */}
      <View style={{
        width: 3,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: color,
      }} />
    </View>
  </View>
);

const WeightPlateIcon = ({ color }: { color: string }) => (
  <View style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}>
    {/* Outer Plate rim */}
    <View style={{
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 1.5,
      borderColor: color,
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      {/* Inner dash details */}
      <View style={{
        width: 13,
        height: 13,
        borderRadius: 6.5,
        borderWidth: 0.75,
        borderColor: color,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        {/* Center hole */}
        <View style={{
          width: 4,
          height: 4,
          borderRadius: 2,
          borderWidth: 1,
          borderColor: color,
          backgroundColor: '#13141C',
        }} />
      </View>
    </View>
  </View>
);

const ALT_IMAGES = [
  (color: string) => (
    <Image
      source={require('@/assets/images/eq_dumbbell.png')}
      style={{ width: 24, height: 24, opacity: 0.85 }}
      contentFit="contain"
    />
  ),
  (color: string) => (
    <Image
      source={require('@/assets/images/eq_cable.png')}
      style={{ width: 24, height: 24, opacity: 0.85 }}
      contentFit="contain"
    />
  ),
  (color: string) => (
    <Image
      source={require('@/assets/images/eq_barbell.png')}
      style={{ width: 24, height: 24, opacity: 0.85 }}
      contentFit="contain"
    />
  ),
  (color: string) => <KettlebellIcon color={color} />,
  (color: string) => <WeightPlateIcon color={color} />,
];
import * as Haptics from 'expo-haptics';
import {
  Star,
  Flame,
  Dumbbell,
  Trash2,
  Calendar,
  Plus,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  Sun,
  Moon,
  Edit2,
  Trophy,
  X,
} from 'lucide-react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';

import { useWorkout, WorkoutSet, WorkoutSession, LoggedExercise, Exercise } from '@/hooks/use-workout-storage';
import { MUSCLE_GROUPS, MuscleGroup, DEFAULT_EXERCISES } from '@/constants/exercises';
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
    favoriteOrder,
    addCompletedWorkout,
    toggleFavoriteExercise,
    deleteWorkout,
    getPreviousWorkoutForExercise,
  } = useWorkout();

  const totalWorkoutDays = new Set(history.map(session => session.date.split('T')[0])).size;

  // Active view segment: 'log' | 'history'
  const [activeSegment, setActiveSegment] = useState<'log' | 'history'>('log');

  // Workout logging states
  const [selectedModalMuscle, setSelectedModalMuscle] = useState<MuscleGroup | null>(null);
  const [search, setSearch] = useState('');
  const [sortedExerciseList, setSortedExerciseList] = useState<Exercise[]>([]);
  
  // Expanded exercise state (active logger)
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null);
  const [activeSets, setActiveSets] = useState<WorkoutSet[]>([]);

  const [sameForAll, setSameForAll] = useState(true);

  const [isDarkMode, setIsDarkMode] = useState(true);

  const [activeSessionExercises, setActiveSessionExercises] = useState<LoggedExercise[]>([]);
  const [sessionStartTime, setSessionStartTime] = useState<number>(0);

  // Selected workout for detail modal
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<WorkoutSession | null>(null);

  // Custom Modern Alert Modal State
  const [customAlertVisible, setCustomAlertVisible] = useState(false);
  const [customAlertTitle, setCustomAlertTitle] = useState('');
  const [customAlertMessage, setCustomAlertMessage] = useState('');
  const [customAlertButtons, setCustomAlertButtons] = useState<{ text: string; style?: 'cancel' | 'destructive' | 'default'; onPress?: () => void }[]>([]);
  const [customAlertIcon, setCustomAlertIcon] = useState<React.ReactNode | null>(null);

  const showCustomAlert = (
    title: string,
    message: string,
    buttons: { text: string; style?: 'cancel' | 'destructive' | 'default'; onPress?: () => void }[] = [{ text: 'OK' }],
    icon?: React.ReactNode
  ) => {
    setCustomAlertTitle(title);
    setCustomAlertMessage(message);
    setCustomAlertButtons(buttons);
    setCustomAlertIcon(icon || null);
    setCustomAlertVisible(true);
  };

  React.useEffect(() => {
    AsyncStorage.getItem('@workout_journal_dark_mode').then((val) => {
      if (val !== null) {
        setIsDarkMode(val === 'true');
      }
    });

    AsyncStorage.getItem('@active_session_exercises').then((val) => {
      if (val !== null) {
        setActiveSessionExercises(JSON.parse(val));
      }
    });

    AsyncStorage.getItem('@session_start_time').then((val) => {
      if (val !== null) {
        setSessionStartTime(Number(val));
      }
    });
  }, []);

  const toggleDarkMode = async () => {
    const nextVal = !isDarkMode;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsDarkMode(nextVal);
    await AsyncStorage.setItem('@workout_journal_dark_mode', String(nextVal));
  };

  const handleShowWorkoutDaysInfo = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    showCustomAlert(
      "Workout Days",
      `This is the total number of unique days you have logged a workout.\n\nYou have worked out for ${totalWorkoutDays} day${totalWorkoutDays === 1 ? '' : 's'} total!`,
      [{ text: "OK" }],
      <Trophy size={28} color="#FACC15" fill="#FACC15" />
    );
  };

  const theme = {
    background: isDarkMode ? '#090A0F' : '#F3F4F6',
    cardBg: isDarkMode ? '#13141C' : '#FFFFFF',
    borderColor: isDarkMode ? '#212330' : '#E5E7EB',
    textPrimary: isDarkMode ? '#FFFFFF' : '#111827',
    textSecondary: isDarkMode ? '#9CA3AF' : '#4B5563',
    inputBg: isDarkMode ? '#13141C' : '#FFFFFF',
    inputBorder: isDarkMode ? '#212330' : '#E5E7EB',
    inputPlaceholder: isDarkMode ? '#6B7280' : '#9CA3AF',
    segmentBg: isDarkMode ? '#13141C' : '#E5E7EB',
    segmentBtnActiveBg: isDarkMode ? '#1C1D26' : '#FFFFFF',
    segmentBtnActiveBorder: isDarkMode ? '#212330' : '#D1D5DB',
  };

  const sortExercisesForMuscle = (muscle: MuscleGroup) => {
    const list = exercises.filter((ex) => ex.muscleGroup === muscle);
    const getFavoriteIndex = (exercise: Exercise) => {
      const idx = favoriteOrder.indexOf(exercise.id);
      if (idx !== -1) return idx;

      const defaultIdx = DEFAULT_EXERCISES.findIndex((e) => e.id === exercise.id);
      if (defaultIdx !== -1) {
        return -1000 + defaultIdx;
      }
      return 999999;
    };

    return [...list].sort((a, b) => {
      if (a.isFavorite && b.isFavorite) {
        return getFavoriteIndex(a) - getFavoriteIndex(b);
      }
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      return 0;
    });
  };

  const handleSelectMuscleCard = (muscle: MuscleGroup) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedModalMuscle(muscle);
    setSearch('');
    setExpandedExerciseId(null);
    setActiveSets([]);
    setSameForAll(true);
    setSortedExerciseList(sortExercisesForMuscle(muscle));
  };

  // Auto-populate sets when expanding an exercise
  const handleToggleExpand = (exerciseId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (expandedExerciseId === exerciseId) {
      setExpandedExerciseId(null);
      setActiveSets([]);
      setSameForAll(true);
    } else {
      setExpandedExerciseId(exerciseId);

      setSameForAll(true);

      const existingInActive = activeSessionExercises.find((le) => le.exerciseId === exerciseId);
      const initialSets: WorkoutSet[] = [];

      if (existingInActive && existingInActive.sets.length > 0) {
        existingInActive.sets.forEach((set) => {
          initialSets.push({
            id: set.id,
            weight: set.weight,
            reps: set.reps,
            isCompleted: true,
          });
        });
      } else {
        const previousLog = getPreviousWorkoutForExercise(exerciseId);
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
      }
      setActiveSets(initialSets);
    }
  };

  const handleAddSet = (exerciseId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    let newWeight = 0;
    let newReps = 0;
    
    if (sameForAll && activeSets.length > 0) {
      newWeight = activeSets[0].weight;
      newReps = activeSets[0].reps;
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

  const toggleSameForAll = () => {
    const nextVal = !sameForAll;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSameForAll(nextVal);
    if (nextVal && activeSets.length > 0) {
      const firstSet = activeSets[0];
      setActiveSets(activeSets.map((s) => ({
        ...s,
        weight: firstSet.weight,
        reps: firstSet.reps,
      })));
    }
  };

  const handleUpdateSet = (setId: string, updates: Partial<WorkoutSet>) => {
    if (sameForAll && (updates.weight !== undefined || updates.reps !== undefined)) {
      setActiveSets(activeSets.map((s) => ({
        ...s,
        ...(updates.weight !== undefined ? { weight: updates.weight } : {}),
        ...(updates.reps !== undefined ? { reps: updates.reps } : {}),
      })));
    } else {
      setActiveSets(activeSets.map((s) => (s.id === setId ? { ...s, ...updates } : s)));
    }
  };

  const handleRemoveSet = (setId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveSets(activeSets.filter((s) => s.id !== setId));
  };



  const handleSaveWorkout = async (exerciseId: string) => {
    if (activeSets.length === 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showCustomAlert(
        'Add Sets',
        'Please add at least one set with weight and repetitions before saving.',
        [{ text: 'OK' }],
        <Flame size={28} color="#EF4444" />
      );
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Set start time if it's the first exercise in the session
    let currentStartTime = sessionStartTime;
    if (activeSessionExercises.length === 0) {
      currentStartTime = Date.now();
      setSessionStartTime(currentStartTime);
      await AsyncStorage.setItem('@session_start_time', String(currentStartTime));
    }

    // Add or replace the logged exercise in activeSessionExercises
    const updatedExercises = [...activeSessionExercises];
    const existingIndex = updatedExercises.findIndex((le) => le.exerciseId === exerciseId);
    
    const newLog = {
      exerciseId,
      sets: activeSets.map((s) => ({ ...s, isCompleted: true })),
    };

    if (existingIndex > -1) {
      updatedExercises[existingIndex] = newLog;
    } else {
      updatedExercises.push(newLog);
    }

    setActiveSessionExercises(updatedExercises);
    await AsyncStorage.setItem('@active_session_exercises', JSON.stringify(updatedExercises));

    // Reset logger states
    setExpandedExerciseId(null);
    setActiveSets([]);
    setSameForAll(true);
  };

  const handleEditActiveExercise = (exerciseId: string, muscleGroup: MuscleGroup) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedModalMuscle(muscleGroup);
    setSearch('');
    setExpandedExerciseId(exerciseId);
    setSortedExerciseList(sortExercisesForMuscle(muscleGroup));
    
    const existing = activeSessionExercises.find((le) => le.exerciseId === exerciseId);
    if (existing) {
      setActiveSets(existing.sets.map((s) => ({
        id: s.id,
        weight: s.weight,
        reps: s.reps,
        isCompleted: true,
      })));
    }
  };

  const handleEditLastExercise = () => {
    if (activeSessionExercises.length === 0) return;
    const lastLogged = activeSessionExercises[activeSessionExercises.length - 1];
    const details = exercises.find((e) => e.id === lastLogged.exerciseId);
    if (details) {
      handleEditActiveExercise(lastLogged.exerciseId, details.muscleGroup);
    }
  };

  const suggestWorkoutTitle = (loggedExs: LoggedExercise[]) => {
    const muscles = new Set<string>();
    loggedExs.forEach((le) => {
      const details = exercises.find((e) => e.id === le.exerciseId);
      if (details) {
        muscles.add(details.muscleGroup);
      }
    });
    const muscleArray = Array.from(muscles);
    if (muscleArray.length === 0) return "Workout Day";
    if (muscleArray.length === 1) return `${muscleArray[0]} Day`;
    if (muscleArray.length === 2) return `${muscleArray[0]} & ${muscleArray[1]} Day`;
    if (muscleArray.length === 3) return `${muscleArray[0]}, ${muscleArray[1]} & ${muscleArray[2]} Day`;
    return "Full Body Day";
  };

  const handleFinishWorkoutDay = async () => {
    if (activeSessionExercises.length === 0) {
      showCustomAlert(
        'Active Session',
        'You have not logged any exercises in the active session yet.',
        [{ text: 'OK' }],
        <Dumbbell size={28} color="#3B82F6" />
      );
      return;
    }

    const suggestedTitle = suggestWorkoutTitle(activeSessionExercises);

    showCustomAlert(
      'Finish Workout Day',
      `Save today's session as "${suggestedTitle}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Save',
          style: 'default',
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            
            const elapsedMinutes = sessionStartTime > 0
              ? Math.max(1, Math.round((Date.now() - sessionStartTime) / 60000))
              : 15;

            await addCompletedWorkout(suggestedTitle, activeSessionExercises, elapsedMinutes);

            // Clear active session
            setActiveSessionExercises([]);
            setSessionStartTime(0);
            await Promise.all([
              AsyncStorage.removeItem('@active_session_exercises'),
              AsyncStorage.removeItem('@session_start_time'),
            ]);

            // Reset modal and views
            setSelectedModalMuscle(null);
          },
        },
      ],
      <Trophy size={28} color="#10B981" />
    );
  };

  const handleCancelSession = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    showCustomAlert(
      'Cancel Workout',
      'Are you sure you want to discard your current workout day progress?',
      [
        { text: 'Keep Workout', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: async () => {
            setActiveSessionExercises([]);
            setSessionStartTime(0);
            await Promise.all([
              AsyncStorage.removeItem('@active_session_exercises'),
              AsyncStorage.removeItem('@session_start_time'),
            ]);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ],
      <Trash2 size={28} color="#EF4444" />
    );
  };

  const handleDeleteHistoryLog = (id: string, name: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    showCustomAlert(
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
      ],
      <Trash2 size={28} color="#EF4444" />
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

  // Filter the snapshotted sorted exercise list by search query inside the modal popup
  const displayedExercises = sortedExerciseList.filter((ex) =>
    ex.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top', 'left', 'right']}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inner}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Landing Header */}
          <View style={styles.header}>
            <View style={styles.headerRow}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={[styles.headerSlogan, { color: theme.textSecondary }]}>WE REMEMBER SO YOU CAN</Text>
                <Text style={[styles.headerBrand, { color: theme.textPrimary }]}>FORGET</Text>
              </View>
              {/* Header Action Controls */}
              <View style={styles.headerActionContainer}>
                {/* Workout Days Counter Badge */}
                <TouchableOpacity
                  style={[
                    styles.workoutDaysBadge,
                    { backgroundColor: theme.cardBg, borderColor: theme.borderColor }
                  ]}
                  onPress={handleShowWorkoutDaysInfo}
                  activeOpacity={0.7}
                >
                  <Trophy size={14} color="#FACC15" fill="#FACC15" style={{ marginRight: 5 }} />
                  <Text style={[styles.workoutDaysText, { color: theme.textPrimary }]}>{totalWorkoutDays}</Text>
                </TouchableOpacity>

                {/* Dark/Light Mode Toggle */}
                <TouchableOpacity
                  style={[
                    styles.themeToggleBtn,
                    { backgroundColor: theme.cardBg, borderColor: theme.borderColor }
                  ]}
                  onPress={toggleDarkMode}
                  activeOpacity={0.8}
                >
                  {isDarkMode ? (
                    <Sun size={20} color="#FACC15" strokeWidth={2.2} />
                  ) : (
                    <Moon size={20} color="#3B82F6" strokeWidth={2.2} />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Segment Selector Toggle */}
          <View style={[styles.segmentContainer, { backgroundColor: theme.segmentBg, borderColor: theme.borderColor }]}>
            <TouchableOpacity
              style={[
                styles.segmentBtn,
                activeSegment === 'log' ? [styles.segmentBtnActive, { backgroundColor: theme.segmentBtnActiveBg, borderColor: theme.segmentBtnActiveBorder }] : null
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveSegment('log');
              }}
              activeOpacity={0.8}
            >
              <Text style={[styles.segmentText, activeSegment === 'log' ? { color: theme.textPrimary } : { color: theme.textSecondary }]}>LOG WORKOUT</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.segmentBtn,
                activeSegment === 'history' ? [styles.segmentBtnActive, { backgroundColor: theme.segmentBtnActiveBg, borderColor: theme.segmentBtnActiveBorder }] : null
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveSegment('history');
              }}
              activeOpacity={0.8}
            >
              <Text style={[styles.segmentText, activeSegment === 'history' ? { color: theme.textPrimary } : { color: theme.textSecondary }]}>HISTORY</Text>
            </TouchableOpacity>
          </View>

          {/* Segment Switch Logic */}
          {activeSegment === 'log' ? (
            <>
              {/* Active Session Status Card */}
              {activeSessionExercises.length > 0 && (
                <Card style={[styles.activeSessionCard, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
                  <View style={styles.activeSessionHeader}>
                    <View>
                      <Text style={[styles.activeSessionTitle, { color: theme.textPrimary }]}>Active Session</Text>
                      <Text style={[styles.activeSessionSubtitle, { color: theme.textSecondary }]}>
                        {activeSessionExercises.length} exercise{activeSessionExercises.length > 1 ? 's' : ''} logged today
                      </Text>
                    </View>
                    <View style={styles.headerActionRow}>
                      <TouchableOpacity
                        style={styles.editSessionBtn}
                        onPress={handleEditLastExercise}
                        activeOpacity={0.7}
                      >
                        <Edit2 size={16} color="#3B82F6" strokeWidth={2.5} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.cancelSessionBtn}
                        onPress={handleCancelSession}
                        activeOpacity={0.6}
                      >
                        <Trash2 size={18} color="#EF4444" strokeWidth={2} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.activeSessionList}>
                    {activeSessionExercises.map((le) => {
                      const details = exercises.find((e) => e.id === le.exerciseId);
                      if (!details) return null;
                      return (
                        <View key={le.exerciseId} style={styles.activeSessionItem}>
                          <Text style={[styles.activeSessionItemText, { color: theme.textPrimary }]}>
                            • {details.name} ({le.sets.length} set{le.sets.length > 1 ? 's' : ''})
                          </Text>
                        </View>
                      );
                    })}
                  </View>

                  <TouchableOpacity
                    style={[styles.finishSessionBtn, { backgroundColor: '#10B981' }]}
                    onPress={handleFinishWorkoutDay}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.finishSessionBtnText}>SAVE WORKOUT DAY</Text>
                  </TouchableOpacity>
                </Card>
              )}

              {/* Muscle Selector Cards Grid */}
              <Text style={[styles.sectionHeader, { color: theme.textSecondary }]}>SELECT MUSCLE GROUP</Text>
              <View style={styles.muscleGrid}>
                {MUSCLE_GROUPS.map((muscle) => {
                  const muscleColor = categoryColors[muscle] || '#10B981';
                  return (
                    <TouchableOpacity
                      key={muscle}
                      style={[
                        styles.muscleCard,
                        {
                          borderColor: isDarkMode ? theme.borderColor : `${muscleColor}30`,
                          backgroundColor: isDarkMode ? '#000000' : '#FFFFFF',
                          shadowColor: '#000000',
                          shadowOffset: { width: 0, height: 1 },
                          shadowOpacity: isDarkMode ? 0 : 0.05,
                          shadowRadius: 2,
                          elevation: 1,
                        }
                      ]}
                      onPress={() => handleSelectMuscleCard(muscle)}
                      activeOpacity={0.85}
                    >
                      <Text
                        style={[styles.muscleText, { color: isDarkMode ? muscleColor : '#111827' }]}
                        numberOfLines={2}
                      >
                        {muscle.toUpperCase()}
                      </Text>
                      <Image
                        source={MUSCLE_IMAGES[muscle]}
                        style={[styles.muscleImage, { opacity: isDarkMode ? 0.85 : 1.0 }]}
                        contentFit="contain"
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Consistency Graph */}
              <Text style={[styles.sectionHeader, { color: theme.textSecondary }]}>ACTIVITY TRACKER</Text>
              <ProgressGrid history={history} isDarkMode={isDarkMode} />

              {/* Recent Workouts list matching screenshot */}
              <View style={styles.recentWorkoutsHeader}>
                <Text style={[styles.sectionHeader, { color: theme.textSecondary }]}>RECENT WORKOUTS</Text>
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
                  
                  // Compute sets per muscle group
                  const muscleSets: Record<string, number> = {};
                  item.exercises.forEach((logEx) => {
                    const details = exercises.find((e) => e.id === logEx.exerciseId);
                    if (details) {
                      const mGroup = details.muscleGroup;
                      muscleSets[mGroup] = (muscleSets[mGroup] || 0) + logEx.sets.length;
                    }
                  });

                  const setsPerMuscleString = Object.entries(muscleSets)
                    .map(([muscle, count]) => `${muscle}: ${count} set${count > 1 ? 's' : ''}`)
                    .join(' • ');

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
                      style={[
                        styles.recentCard,
                        {
                          borderLeftWidth: 4,
                          borderLeftColor: circleColor,
                          backgroundColor: theme.cardBg,
                          borderColor: theme.borderColor,
                          shadowColor: '#000000',
                          shadowOffset: { width: 0, height: 1 },
                          shadowOpacity: isDarkMode ? 0 : 0.05,
                          shadowRadius: 2,
                          elevation: 1,
                        }
                      ]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setActiveSegment('history');
                      }}
                      activeOpacity={0.85}
                    >
                      <View style={styles.recentLeft}>
                        {/* Circular muscle group category outline icon */}
                        <View style={[styles.recentIconCircle, { backgroundColor: isDarkMode ? `${circleColor}15` : `${circleColor}10`, borderColor: circleColor, borderWidth: 1.5 }]}>
                          <Dumbbell size={16} color={circleColor} />
                        </View>
                        
                        <View style={styles.recentInfo}>
                          <Text style={[styles.recentName, { color: theme.textPrimary }]}>{item.name}</Text>
                          <Text style={[styles.recentMuscles, { color: theme.textSecondary }]} numberOfLines={1}>
                            {sessionMuscles.join(' • ')}
                          </Text>
                          
                          {/* Exercises Row */}
                          <View style={styles.recentMetaRow}>
                            <Text style={[styles.recentMetaText, { color: theme.textSecondary }]} numberOfLines={1}>
                              💪 {setsPerMuscleString}
                            </Text>
                          </View>
                        </View>
                      </View>

                      {/* Right Details */}
                      <View style={styles.recentRight}>
                        <Text style={[styles.recentDayText, { color: theme.textSecondary }]}>{getRelativeDay(item.date)}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
                {history.length === 0 && (
                  <Card style={[styles.emptyRecentCard, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
                    <Text style={[styles.emptyRecentText, { color: theme.textSecondary }]}>No recent sessions completed.</Text>
                  </Card>
                )}
              </View>
            </>
          ) : (
            /* History View Section */
            <View style={styles.historySection}>
              {history.length === 0 ? (
                <Card style={[styles.welcomeCard, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
                  <Calendar size={32} color="#10B981" strokeWidth={1.5} />
                  <Text style={[styles.welcomeTitle, { color: theme.textPrimary }]}>No workout history yet</Text>
                  <Text style={[styles.welcomeDesc, { color: theme.textSecondary }]}>
                    Log completed sets above. Your session summary data cards will load here.
                  </Text>
                </Card>
              ) : (
                history.map((item) => {
                  const sessionMuscles = getSessionMuscles(item);
                  const muscleSets: Record<string, number> = {};
                  item.exercises.forEach((logEx) => {
                    const details = exercises.find((e) => e.id === logEx.exerciseId);
                    if (details) {
                      muscleSets[details.muscleGroup] = (muscleSets[details.muscleGroup] || 0) + logEx.sets.length;
                    }
                  });
                  const muscleSetsString = Object.entries(muscleSets)
                    .sort(([a], [b]) => sessionMuscles.indexOf(a as any) - sessionMuscles.indexOf(b as any))
                    .map(([muscle, sets]) => `${muscle} ${sets}`)
                    .join(' · ');
                  return (
                    <TouchableOpacity
                      key={item.id}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setSelectedHistoryItem(item);
                      }}
                      activeOpacity={0.85}
                    >
                      <Card
                        style={[
                          styles.historyLogCard,
                          {
                            borderLeftWidth: 4,
                            borderLeftColor: categoryColors[sessionMuscles[0] || 'Chest'] || '#10B981',
                            backgroundColor: theme.cardBg,
                            borderColor: theme.borderColor,
                            shadowColor: '#000000',
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: isDarkMode ? 0 : 0.05,
                            shadowRadius: 2,
                            elevation: 1,
                          }
                        ]}
                      >
                        <View style={styles.historyCardHeader}>
                          <View style={styles.historyTitleCol}>
                            <Text style={[styles.historySessionName, { color: theme.textPrimary }]}>{item.name}</Text>
                            <Text style={[styles.historyDate, { color: theme.textSecondary }]}>{formatHistoryDate(item.date).toUpperCase()}</Text>
                          </View>
                          <TouchableOpacity
                            style={styles.deleteLogBtn}
                            onPress={() => handleDeleteHistoryLog(item.id, item.name)}
                            activeOpacity={0.6}
                          >
                            <Trash2 size={16} color="#EF4444" strokeWidth={2} />
                          </TouchableOpacity>
                        </View>

                        {/* Simplified summary */}
                        <View style={[styles.historySetsReceipt, { borderTopColor: theme.borderColor }]}>
                          <Text style={[styles.historySummaryText, { color: theme.textSecondary }]} numberOfLines={1}>
                            {muscleSetsString}
                          </Text>
                        </View>

                        <View style={[styles.historyFooter, { borderTopColor: theme.borderColor }]}>
                          <View style={styles.historyBadgeRow}>
                            {sessionMuscles.map((m) => (
                              <MuscleBadge key={m} muscleGroup={m} size="sm" />
                            ))}
                          </View>
                        </View>
                      </Card>
                    </TouchableOpacity>
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
          <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
            <SafeAreaView style={styles.modalInnerContainer} edges={['top', 'bottom', 'left', 'right']}>
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.modalKeyboardContainer}
              >
                {/* Modal Header */}
                <View style={[styles.modalHeader, { borderBottomColor: theme.borderColor }]}>
                  <View>
                    <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
                      {(selectedModalMuscle || '').toUpperCase()} WORKOUTS
                    </Text>
                    <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>Select an exercise to log completed sets</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.modalCloseBtn, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}
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
                            { backgroundColor: theme.cardBg, borderColor: theme.borderColor },
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
                            setSortedExerciseList(sortExercisesForMuscle(muscle));
                          }}
                          activeOpacity={0.8}
                        >
                          <Text
                            style={[
                              styles.modalSwitcherPillText,
                              { color: theme.textSecondary },
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
                    style={[styles.searchInput, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                    placeholder="Search exercises..."
                    placeholderTextColor={theme.inputPlaceholder}
                    value={search}
                    onChangeText={setSearch}
                    autoCorrect={false}
                  />
                </View>

                {/* Exercises List */}
                <FlatList
                  data={displayedExercises}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={styles.modalListContent}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  renderItem={({ item, index }) => {
                    const isExpanded = expandedExerciseId === item.id;
                    const liveEx = exercises.find((e) => e.id === item.id);
                    const isFav = liveEx?.isFavorite ?? false;

                    return (
                      <Card style={[styles.exerciseCard, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
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
                               const renderExerciseIcon = ALT_IMAGES[index % 5];
                               return (
                                 <View style={[
                                   styles.exerciseBadgeCircle,
                                   {
                                     backgroundColor: `${exerciseColor}12`, // Soft transparent backdrop
                                   }
                                 ]}>
                                   {renderExerciseIcon(exerciseColor)}
                                 </View>
                               );
                             })()}

                            <Text
                              style={[styles.exerciseName, { color: theme.textPrimary }]}
                              numberOfLines={2}
                            >
                              {item.name}
                            </Text>
                            {isExpanded ? (
                              <ChevronUp size={16} color={theme.textSecondary} />
                            ) : (
                              <ChevronDown size={16} color={theme.textSecondary} />
                            )}
                          </TouchableOpacity>

                          {/* Favorite button */}
                          <TouchableOpacity
                            style={[styles.favBtn, { borderLeftColor: theme.borderColor }]}
                            onPress={() => {
                              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                              toggleFavoriteExercise(item.id);
                            }}
                            activeOpacity={0.7}
                          >
                            <Star
                              size={18}
                              color={isFav ? '#FF8A00' : theme.textSecondary}
                              fill={isFav ? '#FF8A00' : 'transparent'}
                              strokeWidth={2}
                            />
                          </TouchableOpacity>
                        </View>

                        {/* Accordion sets logger content */}
                        {isExpanded && (() => {
                          const categoryColor = categoryColors[item.muscleGroup] || '#10B981';
                          return (
                            <View style={[styles.loggerBody, { backgroundColor: theme.background, borderTopColor: theme.borderColor }]}>
                              {/* Sync Option Switch Row */}
                              <TouchableOpacity
                                style={[styles.optionsRow, { justifyContent: 'space-between', alignItems: 'center' }]}
                                onPress={toggleSameForAll}
                                activeOpacity={0.8}
                              >
                                <View style={{ flex: 1, paddingRight: 8 }}>
                                  <Text style={[styles.optionsTitle, { color: theme.textPrimary }]}>Same for all sets</Text>
                                  <Text style={[styles.optionsSubtitle, { color: theme.textSecondary }]}>
                                    Sync weight and reps automatically
                                  </Text>
                                </View>
                                <View
                                  style={[
                                    styles.switchTrack,
                                    sameForAll
                                      ? { backgroundColor: categoryColor, alignItems: 'flex-end' }
                                      : { backgroundColor: isDarkMode ? '#2D2D30' : '#D1D5DB', alignItems: 'flex-start' }
                                  ]}
                                >
                                  <View style={styles.switchThumb} />
                                </View>
                              </TouchableOpacity>

                              {/* Set Row Labels */}
                              <View style={styles.setRowLabels}>
                                <Text style={[styles.labelCol, styles.widthSet, { color: theme.textPrimary }]}>SET</Text>
                                <Text style={[styles.labelCol, styles.widthWeight, { color: theme.textSecondary }]}>WEIGHT</Text>
                                <Text style={[styles.labelCol, styles.widthReps, { color: theme.textSecondary }]}>REPS</Text>
                              </View>

                              {/* Active Sets logging list */}
                              {activeSets.map((set, index) => (
                                <View
                                  key={set.id}
                                  style={[
                                    styles.setRow,
                                    { borderBottomColor: theme.borderColor },
                                  ]}
                                >
                                  <Text style={[styles.setText, { color: theme.textPrimary }]}>{index + 1}</Text>
                                  
                                  <View style={styles.widthWeight}>
                                    <IncrementInput
                                      value={set.weight}
                                      step={2.5}
                                      onChange={(val) => handleUpdateSet(set.id, { weight: val })}
                                      placeholder="kg"
                                      accentColor={categoryColor}
                                      style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder }}
                                      textColor={theme.textPrimary}
                                    />
                                  </View>

                                  <View style={styles.widthReps}>
                                    <IncrementInput
                                      value={set.reps}
                                      step={1}
                                      onChange={(val) => handleUpdateSet(set.id, { reps: val })}
                                      placeholder="reps"
                                      accentColor={categoryColor}
                                      style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder }}
                                      textColor={theme.textPrimary}
                                    />
                                  </View>

                                  {/* Delete set */}
                                  <TouchableOpacity
                                    style={styles.deleteSetBtn}
                                    onPress={() => handleRemoveSet(set.id)}
                                    activeOpacity={0.7}
                                  >
                                    <Text style={[styles.deleteSetText, { color: theme.textSecondary }]}>×</Text>
                                  </TouchableOpacity>
                                </View>
                              ))}

                              {/* Action panel */}
                              <View style={styles.loggerActions}>
                                <TouchableOpacity
                                  style={[styles.addSetBtn, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}
                                  onPress={() => handleAddSet(item.id)}
                                  activeOpacity={0.75}
                                >
                                  <Plus size={14} color={theme.textSecondary} strokeWidth={2.5} />
                                  <Text style={[styles.addSetBtnText, { color: theme.textSecondary }]}>ADD SET</Text>
                                </TouchableOpacity>

                                <Button
                                  title="Log Workout"
                                  variant="primary"
                                  onPress={() => handleSaveWorkout(item.id)}
                                  style={styles.saveWorkoutBtn}
                                />
                              </View>
                            </View>
                          );
                        })()}
                      </Card>
                    );
                  }}
                />

                {/* Modal Sticky Footer if active session is not empty */}
                {activeSessionExercises.length > 0 && (
                  <View style={[styles.modalStickyFooter, { backgroundColor: theme.cardBg, borderTopColor: theme.borderColor }]}>
                    <Text style={[styles.modalFooterText, { color: theme.textPrimary }]}>
                      {activeSessionExercises.length} Exercise{activeSessionExercises.length > 1 ? 's' : ''} Logged
                    </Text>
                    <TouchableOpacity
                      style={[styles.modalFinishBtn, { backgroundColor: '#10B981' }]}
                      onPress={() => {
                        setSelectedModalMuscle(null);
                        setTimeout(() => {
                          handleFinishWorkoutDay();
                        }, 400);
                      }}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.modalFinishBtnText}>FINISH DAY</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </KeyboardAvoidingView>
            </SafeAreaView>
          </View>
        </Modal>
      {/* Custom Modern Alert Modal */}
      <Modal
        visible={customAlertVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setCustomAlertVisible(false)}
      >
        <View style={styles.alertOverlay}>
          <View style={[styles.alertCard, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
            {customAlertIcon && (
              <View style={[styles.alertIconWrapper, { backgroundColor: isDarkMode ? '#3B82F615' : '#3B82F610' }]}>
                {customAlertIcon}
              </View>
            )}
            <Text style={[styles.alertTitle, { color: theme.textPrimary }]}>
              {customAlertTitle}
            </Text>
            <Text style={[styles.alertMessage, { color: theme.textSecondary }]}>
              {customAlertMessage}
            </Text>
            <View style={styles.alertButtonsRow}>
              {customAlertButtons.map((btn, index) => {
                const isDestructive = btn.style === 'destructive';
                const isCancel = btn.style === 'cancel';
                
                let btnBg = isDarkMode ? '#1E1E28' : '#F3F4F6';
                let textColor = theme.textPrimary;
                
                if (isDestructive) {
                  btnBg = '#EF444420';
                  textColor = '#EF4444';
                } else if (!isCancel) {
                  btnBg = '#3B82F620';
                  textColor = '#3B82F6';
                } else {
                  btnBg = isDarkMode ? '#212330' : '#E5E7EB';
                  textColor = theme.textSecondary;
                }

                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.alertBtn,
                      { backgroundColor: btnBg, flex: customAlertButtons.length > 1 ? 1 : 0 }
                    ]}
                    onPress={() => {
                      setCustomAlertVisible(false);
                      if (btn.onPress) {
                        setTimeout(btn.onPress, 100);
                      }
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.alertBtnText,
                        { color: textColor, fontWeight: isCancel ? '600' : '800' }
                      ]}
                    >
                      {btn.text}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>

      {/* Workout Detail Modal */}
      <Modal
        visible={selectedHistoryItem !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedHistoryItem(null)}
      >
        <View style={styles.detailOverlay}>
          <View style={[styles.detailCard, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
            {/* Floating close button */}
            <TouchableOpacity
              style={[styles.detailCloseFloatingBtn, { backgroundColor: isDarkMode ? '#1E1E28' : '#F3F4F6', borderColor: theme.borderColor }]}
              onPress={() => setSelectedHistoryItem(null)}
              activeOpacity={0.7}
            >
              <X size={14} color={theme.textSecondary} strokeWidth={2.5} />
            </TouchableOpacity>

            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedHistoryItem && (
                <>
                  <View style={styles.detailHeader}>
                    <View style={styles.detailTitleCol}>
                      <Text style={[styles.detailSessionName, { color: theme.textPrimary }]}>{selectedHistoryItem.name}</Text>
                      <Text style={[styles.detailDate, { color: theme.textSecondary }]}>{formatHistoryDate(selectedHistoryItem.date).toUpperCase()}</Text>
                    </View>
                  </View>

                  {selectedHistoryItem.duration > 0 && (
                    <View style={styles.detailDurationRow}>
                      <Text style={[styles.detailDurationLabel, { color: theme.textSecondary }]}>
                        Duration
                      </Text>
                      <Text style={[styles.detailDurationValue, { color: theme.textPrimary }]}>
                        {selectedHistoryItem.duration} min
                      </Text>
                    </View>
                  )}

                  <View style={[styles.detailDivider, { backgroundColor: theme.borderColor }]} />

                  {selectedHistoryItem.exercises.map((logEx) => {
                    const exDetails = exercises.find((e) => e.id === logEx.exerciseId);
                    return (
                      <View key={logEx.exerciseId} style={styles.detailExerciseGroup}>
                        <View style={styles.detailExerciseHeader}>
                          <View style={[styles.detailExerciseDot, { backgroundColor: categoryColors[exDetails?.muscleGroup || ''] || '#10B981' }]} />
                          <Text style={[styles.detailExerciseName, { color: theme.textPrimary }]}>
                            {exDetails?.name || 'Unknown'}
                          </Text>
                        </View>
                        {logEx.sets.map((set, setIndex) => (
                          <View key={set.id} style={styles.detailSetRow}>
                            <Text style={[styles.detailSetLabel, { color: theme.textSecondary }]}>SET {setIndex + 1}</Text>
                            <Text style={[styles.detailSetValue, { color: theme.textPrimary }]}>{set.weight} kg × {set.reps}</Text>
                          </View>
                        ))}
                      </View>
                    );
                  })}
                </>
              )}
            </ScrollView>
          </View>
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
  headerSlogan: {
    fontSize: 9,
    fontWeight: '800',
    color: '#9CA3AF',
    letterSpacing: 1.8,
  },
  headerBrand: {
    fontSize: 26,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Arial Rounded MT Bold' : 'sans-serif-medium',
    letterSpacing: 2,
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
    height: 76, // Shorter height for vertical compression
    borderRadius: 16,
    backgroundColor: '#13141C', // Obsidian Card Fill
    borderWidth: 1,
    borderColor: '#212330', // Gunmetal Border
    position: 'relative',
    overflow: 'hidden',
    padding: 10,
    paddingLeft: 6,
    justifyContent: 'flex-start',
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
    maxWidth: '75%',
  },
  muscleImage: {
    position: 'absolute',
    right: -6,
    bottom: -6,
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
    flex: 1,
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
    width: '12%',
    textAlign: 'left',
    color: '#FFFFFF',
    fontWeight: '800',
  },
  widthWeight: {
    width: '44%',
    alignItems: 'center',
  },
  widthReps: {
    width: '44%',
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
    width: '12%',
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
  historySummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  historySummaryText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  historySummaryDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    opacity: 0.5,
  },
  // Detail Modal Styles
  detailOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  detailCard: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  detailTitleCol: {
    flex: 1,
    marginRight: 12,
    gap: 3,
  },
  detailSessionName: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  detailDate: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  detailCloseFloatingBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    zIndex: 10,
  },
  detailExerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  detailExerciseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  detailDurationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  detailDurationLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  detailDurationValue: {
    fontSize: 12,
    fontWeight: '800',
  },
  detailDivider: {
    height: 1,
    marginVertical: 16,
  },
  detailExerciseGroup: {
    marginBottom: 16,
    gap: 4,
  },
  detailExerciseName: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  detailSetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
    paddingLeft: 4,
  },
  detailSetLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  detailSetValue: {
    fontSize: 13,
    fontWeight: '700',
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
    paddingBottom: 95,
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
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  optionsTitle: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.1,
  },
  optionsSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  switchTrack: {
    width: 44,
    height: 24,
    borderRadius: 12,
    paddingHorizontal: 2,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  switchThumb: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 1.5,
    elevation: 2,
  },
  headerActionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  workoutDaysBadge: {
    height: 38,
    paddingHorizontal: 12,
    borderRadius: 19,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  workoutDaysText: {
    fontSize: 13,
    fontWeight: '800',
  },
  themeToggleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeSessionCard: {
    padding: 16,
    marginBottom: 20,
    borderRadius: 22,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  activeSessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  activeSessionTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  activeSessionSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  cancelSessionBtn: {
    padding: 6,
  },
  activeSessionList: {
    marginBottom: 16,
    gap: 6,
  },
  activeSessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeSessionItemText: {
    fontSize: 13,
    fontWeight: '700',
  },
  editSessionBtn: {
    padding: 6,
    marginRight: 8,
  },
  headerActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  finishSessionBtn: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  finishSessionBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: 0.5,
  },
  modalStickyFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalFooterText: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.1,
  },
  modalFinishBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalFinishBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#000000',
  },
  // Custom Alert Styles
  alertOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  alertCard: {
    width: '100%',
    maxWidth: 300,
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 8,
  },
  alertIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  alertMessage: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
  },
  alertButtonsRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
    justifyContent: 'center',
  },
  alertBtn: {
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    minWidth: 90,
  },
  alertBtnText: {
    fontSize: 13,
    letterSpacing: 0.3,
  },
});
