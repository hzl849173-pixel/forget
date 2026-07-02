import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SectionList,
  KeyboardAvoidingView,
  Platform,
  Modal,
  TextInput,
  PanResponder,
  Dimensions,
  FlatList,
  Pressable,
  BackHandler,
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
  'Abs & Shoulders': '#22C55E',
  Abs: '#22C55E',
  Shoulders: '#22C55E',
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
const Haptics = {
  impactAsync: async (...args: any[]) => {},
  notificationAsync: async (...args: any[]) => {},
  selectionAsync: async (...args: any[]) => {},
  ImpactFeedbackStyle: {
    Light: 'light' as const,
    Medium: 'medium' as const,
    Heavy: 'heavy' as const,
  },
  NotificationFeedbackType: {
    Success: 'success' as const,
    Warning: 'warning' as const,
    Error: 'error' as const,
  },
};
import {
  Star,
  Flame,
  Dumbbell,
  Trash2,
  Calendar,
  Plus,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  Trophy,
  X,
  Timer,
  Check,
  GripVertical,
} from 'lucide-react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';

import { useWorkout, WorkoutSet, WorkoutSession, LoggedExercise, Exercise, PersonalRecord, WorkoutTemplate } from '@/hooks/use-workout-storage';
import { MUSCLE_GROUPS, MuscleGroup, DEFAULT_EXERCISES, INSTRUMENT_ORDER, SHOULDER_EXERCISE_IDS } from '@/constants/exercises';
import DragList from 'react-native-draglist';
import { ProgressGrid } from '@/components/ui/progress-grid';
import { ProgressDashboard } from '@/components/progress/ProgressDashboard';
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
    templates,
    addCompletedWorkout,
    createCustomExercise,
    toggleFavoriteExercise,
    deleteCustomExercise,
    deleteWorkout,
    updateWorkout,
    getPreviousWorkoutForExercise,
    getPreviousSessionForExercise,
    getExercisePR,
    saveTemplate,
    updateTemplate,
    deleteTemplate,
  } = useWorkout();

  const totalWorkoutDays = new Set(history.map(session => session.date.split('T')[0])).size;

  // Active view segment: 'log' | 'progress' | 'templates' | 'history'
  const [activeSegment, setActiveSegment] = useState<'log' | 'progress' | 'templates' | 'history'>('log');
  const [progressInitialTab, setProgressInitialTab] = useState<'overview' | 'analytics' | 'milestones' | null>(null);

  const switcherScrollRef = React.useRef<ScrollView>(null);

  // Workout logging states
  const [selectedModalMuscle, setSelectedModalMuscle] = useState<MuscleGroup | null>(null);
  const [selectedSubGroup, setSelectedSubGroup] = useState<'Abs' | 'Shoulders' | null>(null);
  const [search, setSearch] = useState('');
  const [historySearch, setHistorySearch] = useState('');
  const [editingHistoryWorkoutId, setEditingHistoryWorkoutId] = useState<string | null>(null);
  const [historyEditSets, setHistoryEditSets] = useState<Record<string, WorkoutSet[]>>({});
  const [exerciseNote, setExerciseNote] = useState('');
  const [historyEditNotes, setHistoryEditNotes] = useState<Record<string, string>>({});
  const [newPrsDetected, setNewPrsDetected] = useState<PersonalRecord[]>([]);
  const [showNewPrsAlert, setShowNewPrsAlert] = useState(false);
  const [templateModalVisible, setTemplateModalVisible] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateExercises, setTemplateExercises] = useState<LoggedExercise[]>([]);
  const [isSavingActiveSessionAsTemplate, setIsSavingActiveSessionAsTemplate] = useState(false);
  const [templateListVisible, setTemplateListVisible] = useState(false);
  const [templateListExercises, setTemplateListExercises] = useState<LoggedExercise[]>([]);
  const [fromTemplateList, setFromTemplateList] = useState(false);
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);
  const [templateLogSelectVisible, setTemplateLogSelectVisible] = useState(false);
  const [templateLogSelectedIds, setTemplateLogSelectedIds] = useState<Set<string>>(new Set());
  const [selectedPickerExerciseIds, setSelectedPickerExerciseIds] = useState<Set<string>>(new Set());
  
  const [sortedExerciseList, setSortedExerciseList] = useState<Exercise[]>([]);
  const [customShoulderIds, setCustomShoulderIds] = useState<Set<string>>(new Set());
  
  // Expanded exercise state (active logger)
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null);
  const [activeSets, setActiveSets] = useState<WorkoutSet[]>([]);

  const [sameForAll, setSameForAll] = useState(true);

  const [activeSessionExercises, setActiveSessionExercises] = useState<LoggedExercise[]>([]);
  const [sessionStartTime, setSessionStartTime] = useState<number>(0);
  const [editSessionExerciseModalVisible, setEditSessionExerciseModalVisible] = useState(false);
  const [cameFromEditModal, setCameFromEditModal] = useState(false);

  // Add exercise state
  const [addExerciseVisible, setAddExerciseVisible] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState('');

  // Rest timer state
  const [restTimerVisible, setRestTimerVisible] = useState(false);
  const [restTimerSeconds, setRestTimerSeconds] = useState(0);
  const [restTimerRunning, setRestTimerRunning] = useState(false);
  const [restTimerDuration, setRestTimerDuration] = useState(60);
  const [restTimerSound, setRestTimerSound] = useState<'alarm' | 'none'>('alarm');
  const restTimerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const soundObjectRef = React.useRef<any>(null);
  const exerciseSwipeGestureX = React.useRef(0);
  const navigateToExerciseRef = React.useRef<(direction: 'prev' | 'next') => void>(() => {});
  const exercisePanResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dx) > 15 && Math.abs(gs.dx) > Math.abs(gs.dy) * 1.5,
      onPanResponderGrant: (_, gs) => { exerciseSwipeGestureX.current = gs.x0; },
      onPanResponderRelease: (_, gs) => {
        if (gs.dx < -40) navigateToExerciseRef.current('next');
        else if (gs.dx > 40) navigateToExerciseRef.current('prev');
      },
    })
  ).current;

  const playTimerSound = async () => {
    try {
      const { Audio } = require('expo-av');
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
      const soundFile = require('@/assets/sounds/alarm.wav');
      const { sound } = await Audio.Sound.createAsync(soundFile, {
        shouldPlay: true,
        isLooping: true,
        volume: 1.0,
      });
      soundObjectRef.current = sound;
    } catch (e) {
      console.warn('Sound playback failed:', e);
    }
  };

  const stopTimerSound = async () => {
    if (soundObjectRef.current) {
      try { await soundObjectRef.current.stopAsync(); } catch {}
      try { await soundObjectRef.current.unloadAsync(); } catch {}
      soundObjectRef.current = null;
    }
  };

  const formatRestTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const startRestTimer = (seconds: number) => {
    stopTimerSound();
    if (restTimerRef.current) clearInterval(restTimerRef.current);
    setRestTimerDuration(seconds);
    setRestTimerSeconds(seconds);
    setRestTimerRunning(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    restTimerRef.current = setInterval(() => {
      setRestTimerSeconds((prev) => {
        if (prev <= 1) {
          if (restTimerRef.current) clearInterval(restTimerRef.current);
          setRestTimerRunning(false);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          if (restTimerSound !== 'none') {
            playTimerSound();
          }
          showCustomAlert(
            'Rest Timer Done',
            'Time to start your next set!',
            [{ text: 'OK', onPress: () => stopTimerSound() }],
            <Timer size={28} color="#10B981" />
          );
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopRestTimer = () => {
    stopTimerSound();
    if (restTimerRef.current) clearInterval(restTimerRef.current);
    setRestTimerRunning(false);
  };

  const resetRestTimer = () => {
    stopTimerSound();
    if (restTimerRef.current) clearInterval(restTimerRef.current);
    setRestTimerRunning(false);
    setRestTimerSeconds(restTimerDuration);
  };

  // Weekly calendar state
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const getWeekDates = (offset: number) => {
    const now = new Date();
    now.setDate(now.getDate() + offset * 7);
    const dayOfWeek = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      week.push(d);
    }
    return week;
  };

  const getWeekNumber = (dates: Date[]) => {
    const firstDay = dates[0];
    const monthStart = new Date(firstDay.getFullYear(), firstDay.getMonth(), 1);
    const diff = Math.floor((firstDay.getTime() - monthStart.getTime()) / (1000 * 60 * 60 * 24));
    return Math.ceil((diff + monthStart.getDay()) / 7) + 1;
  };

  const getWorkoutsForDay = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return history.filter((s) => s.date.startsWith(dateStr));
  };

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
    const handleBackButton = () => {
      if (templateListVisible) {
        setTemplateListVisible(false);
        setFromTemplateList(false);
        setTemplateListExercises([]);
        setActiveTemplateId(null);
        return true;
      }
      return false;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', handleBackButton);
    return () => subscription.remove();
  }, [templateListVisible]);

  React.useEffect(() => {
    return () => {
      if (restTimerRef.current) clearInterval(restTimerRef.current);
      stopTimerSound();
    };
  }, []);

  React.useEffect(() => {
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

    AsyncStorage.getItem('@custom_shoulder_ids').then((val) => {
      if (val !== null) {
        setCustomShoulderIds(new Set(JSON.parse(val)));
      }
    });
  }, []);

  React.useEffect(() => {
    if (selectedModalMuscle && switcherScrollRef.current) {
      const index = MUSCLE_GROUPS.indexOf(selectedModalMuscle);
      if (index !== -1) {
        setTimeout(() => {
          if (index >= 4) {
            switcherScrollRef.current?.scrollToEnd({ animated: false });
          } else if (index <= 1) {
            switcherScrollRef.current?.scrollTo({ x: 0, animated: false });
          } else {
            switcherScrollRef.current?.scrollTo({ x: index * 72, animated: false });
          }
        }, 150);
      }
    }
  }, [selectedModalMuscle]);

  const handleShowWorkoutDaysInfo = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    showCustomAlert(
      "Workout Days",
      `This is the total number of unique days you have logged a workout.\n\nYou have worked out for ${totalWorkoutDays} day${totalWorkoutDays === 1 ? '' : 's'} total!`,
      [{ text: "OK" }],
      <Trophy size={28} color="#FACC15" fill="#FACC15" />
    );
  };

  const isDarkMode = false;

  const theme = {
    background: '#F3F4F6',
    cardBg: '#FFFFFF',
    borderColor: '#E5E7EB',
    textPrimary: '#111827',
    textSecondary: '#4B5563',
    inputBg: '#FFFFFF',
    inputBorder: '#E5E7EB',
    inputPlaceholder: '#9CA3AF',
    segmentBg: '#E5E7EB',
    segmentBtnActiveBg: '#FFFFFF',
    segmentBtnActiveBorder: '#D1D5DB',
  };

  const sortExercisesForMuscle = (muscle: MuscleGroup, extras?: Exercise[], excludeIds?: Set<string>) => {
    const filtered = excludeIds ? exercises.filter((ex) => ex.muscleGroup === muscle && !excludeIds.has(ex.id)) : exercises.filter((ex) => ex.muscleGroup === muscle);
    const list = extras ? [...filtered, ...extras] : filtered;
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
      if (muscle === 'Abs & Shoulders') {
        const aIsShoulder = SHOULDER_EXERCISE_IDS.has(a.id);
        const bIsShoulder = SHOULDER_EXERCISE_IDS.has(b.id);
        if (aIsShoulder && !bIsShoulder) return -1;
        if (!aIsShoulder && bIsShoulder) return 1;
      }
      return 0;
    });
  };

  const handleSelectMuscleCard = (muscle: MuscleGroup) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedModalMuscle(muscle);
    setSelectedSubGroup(muscle === 'Abs & Shoulders' ? 'Shoulders' : null);
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
        setExerciseNote(existingInActive.notes || '');
      } else {
        setExerciseNote('');
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
    
    const newLog = {
      exerciseId,
      sets: activeSets.map((s) => ({ ...s, isCompleted: true })),
      notes: exerciseNote.trim() || undefined,
    };

    if (fromTemplateList) {
      setTemplateListExercises((prev) => {
        const updated = [...prev];
        const existingIndex = updated.findIndex((le) => le.exerciseId === exerciseId);
        if (existingIndex > -1) {
          updated[existingIndex] = newLog;
        } else {
          updated.push(newLog);
        }
        return updated;
      });
      handleTemplateListBackFromLogger(true);
      return;
    }

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
    
    if (existingIndex > -1) {
      updatedExercises[existingIndex] = newLog;
    } else {
      updatedExercises.push(newLog);
    }

    setActiveSessionExercises(updatedExercises);
    await AsyncStorage.setItem('@active_session_exercises', JSON.stringify(updatedExercises));

    // Reset logger states
    handleCloseActiveExerciseLogger(true);
  };

  const handleCloseActiveExerciseLogger = async (skipSave = false) => {
    if (!skipSave && expandedExerciseId && activeSets.length > 0) {
      const updated = activeSessionExercises.map((le) =>
        le.exerciseId === expandedExerciseId
          ? { ...le, sets: activeSets.map((s) => ({ ...s, isCompleted: true })), notes: exerciseNote.trim() || undefined }
          : le
      );
      setActiveSessionExercises(updated);
      await AsyncStorage.setItem('@active_session_exercises', JSON.stringify(updated));
    }
    if (cameFromEditModal) {
      setCameFromEditModal(false);
      setEditSessionExerciseModalVisible(true);
    }
    setExpandedExerciseId(null);
    setActiveSets([]);
    setSameForAll(true);
    setExerciseNote('');
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

            const detectedPrs = await addCompletedWorkout(suggestedTitle, activeSessionExercises, elapsedMinutes);

            // Clear active session
            setActiveSessionExercises([]);
            setSessionStartTime(0);
            await Promise.all([
              AsyncStorage.removeItem('@active_session_exercises'),
              AsyncStorage.removeItem('@session_start_time'),
            ]);

            // Reset modal, logger, and views
            setExpandedExerciseId(null);
            setActiveSets([]);
            setSameForAll(true);
            setSelectedModalMuscle(null);
            setSelectedSubGroup(null);
            setTemplateListVisible(false);
            setFromTemplateList(false);

            if (detectedPrs.length > 0) {
              setNewPrsDetected(detectedPrs);
              setShowNewPrsAlert(true);
            }
          },
        },
        {
          text: 'Create Template',
          style: 'default',
          onPress: async () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setIsSavingActiveSessionAsTemplate(true);
            const exercisesToSave = activeSessionExercises.map((le) => ({
              exerciseId: le.exerciseId,
              sets: le.sets.map((s) => ({ ...s })),
            }));
            setTemplateExercises(exercisesToSave);
            setTemplateName(suggestedTitle);
            setTemplateModalVisible(true);
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

  const handleEditHistoryWorkout = (session: WorkoutSession) => {
    setEditingHistoryWorkoutId(session.id);
    const setsMap: Record<string, WorkoutSet[]> = {};
    const notesMap: Record<string, string> = {};
    session.exercises.forEach((logEx) => {
      setsMap[logEx.exerciseId] = logEx.sets.map((s) => ({ ...s }));
      notesMap[logEx.exerciseId] = logEx.notes || '';
    });
    setHistoryEditSets(setsMap);
    setHistoryEditNotes(notesMap);
  };

  const handleSaveHistoryEdit = async (session: WorkoutSession) => {
    const updatedExercises = session.exercises.map((logEx) => ({
      exerciseId: logEx.exerciseId,
      sets: historyEditSets[logEx.exerciseId] || logEx.sets,
      notes: historyEditNotes[logEx.exerciseId] !== undefined
        ? (historyEditNotes[logEx.exerciseId].trim() || undefined)
        : logEx.notes,
    }));
    await updateWorkout(session.id, { exercises: updatedExercises });
    setEditingHistoryWorkoutId(null);
    setHistoryEditSets({});
    setHistoryEditNotes({});
    setSelectedHistoryItem({
      ...session,
      exercises: updatedExercises,
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };



  const handleOpenSaveTemplate = (exercisesToSave: LoggedExercise[], suggestedName: string) => {
    setTemplateExercises(exercisesToSave);
    setTemplateName(suggestedName);
    setTemplateModalVisible(true);
  };

  const handleCancelSaveTemplate = () => {
    setTemplateModalVisible(false);
    setTemplateName('');
    setTemplateExercises([]);
    setIsSavingActiveSessionAsTemplate(false);
  };

  const handleConfirmSaveTemplate = async () => {
    if (!templateName.trim()) return;

    if (isSavingActiveSessionAsTemplate) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      const elapsedMinutes = sessionStartTime > 0
        ? Math.max(1, Math.round((Date.now() - sessionStartTime) / 60000))
        : 15;

      const workoutTitle = templateName.trim();
      const detectedPrs = await addCompletedWorkout(workoutTitle, activeSessionExercises, elapsedMinutes);

      const exercisesToSave = activeSessionExercises.map((le) => ({
        exerciseId: le.exerciseId,
        sets: le.sets.map((s) => ({ ...s })),
      }));
      await saveTemplate(workoutTitle, exercisesToSave);

      // Clear active session
      setActiveSessionExercises([]);
      setSessionStartTime(0);
      await Promise.all([
        AsyncStorage.removeItem('@active_session_exercises'),
        AsyncStorage.removeItem('@session_start_time'),
      ]);

      // Reset modal, logger, and views
      setExpandedExerciseId(null);
      setActiveSets([]);
      setSameForAll(true);
      setSelectedModalMuscle(null);
      setSelectedSubGroup(null);
      setTemplateListVisible(false);
      setFromTemplateList(false);

      setIsSavingActiveSessionAsTemplate(false);

      if (detectedPrs.length > 0) {
        setNewPrsDetected(detectedPrs);
        setShowNewPrsAlert(true);
      }
    } else {
      const newTmpl = await saveTemplate(templateName, templateExercises);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Open the new template immediately in the Template Details modal
      setTemplateListExercises([]);
      setActiveTemplateId(newTmpl.id);
      setTemplateListVisible(true);
      setFromTemplateList(true);
    }

    setTemplateModalVisible(false);
    setTemplateName('');
    setTemplateExercises([]);
  };

  const handleUseTemplate = (tmpl: WorkoutTemplate) => {
    const exercisesToLoad = tmpl.exercises.map((logEx) => ({
      exerciseId: logEx.exerciseId,
      sets: logEx.sets.map((s) => ({ ...s })),
      notes: logEx.notes,
    }));
    setTemplateListExercises(exercisesToLoad);
    setActiveTemplateId(tmpl.id);
    setTemplateListVisible(true);
    setFromTemplateList(true);
  };

  const handleTemplateExercisePress = (logEx: LoggedExercise) => {
    if (expandedExerciseId && activeSets.length > 0) {
      setTemplateListExercises((prev) =>
        prev.map((ex) =>
          ex.exerciseId === expandedExerciseId
            ? { ...ex, sets: activeSets, notes: exerciseNote.trim() || undefined }
            : ex
        )
      );
    }
    setExpandedExerciseId(logEx.exerciseId);
    setActiveSets(logEx.sets.map((s) => ({
      id: s.id,
      weight: s.weight,
      reps: s.reps,
      isCompleted: s.isCompleted ?? true,
    })));
    setExerciseNote(logEx.notes || '');
    setSameForAll(false);
  };  

  const handleTemplateListBackFromLogger = (skipSave = false) => {
    if (!skipSave && expandedExerciseId && activeSets.length > 0) {
      setTemplateListExercises((prev) => {
        const exists = prev.find((ex) => ex.exerciseId === expandedExerciseId);
        if (exists) {
          return prev.map((ex) =>
            ex.exerciseId === expandedExerciseId
              ? { ...ex, sets: activeSets, notes: exerciseNote.trim() || undefined }
              : ex
          );
        }
        return [...prev, { exerciseId: expandedExerciseId, sets: activeSets, notes: exerciseNote.trim() || undefined }];
      });
    }
    setExpandedExerciseId(null);
    setActiveSets([]);
    setSameForAll(true);
    setExerciseNote('');
  };

  const handleDeleteTemplate = (id: string, name: string) => {
    showCustomAlert(
      'Delete Template',
      `Delete "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteTemplate(id);
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
        if (details.muscleGroup === 'Abs & Shoulders') {
          muscles.add(SHOULDER_EXERCISE_IDS.has(logEx.exerciseId) ? 'Shoulders' : 'Abs');
        } else {
          muscles.add(details.muscleGroup);
        }
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

  const getDateGroupLabel = (dateStr: string): string => {
    const d = new Date(dateStr);
    const today = new Date();
    const dateOnly = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const diffDays = Math.round((todayOnly.getTime() - dateOnly.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';

    const dayOfWeek = todayOnly.getDay();
    const monday = new Date(todayOnly);
    monday.setDate(todayOnly.getDate() - ((dayOfWeek + 6) % 7));

    if (dateOnly >= monday) return 'This Week';

    const lastMonday = new Date(monday);
    lastMonday.setDate(monday.getDate() - 7);
    if (dateOnly >= lastMonday) return 'Last Week';

    return 'Earlier';
  };

  // Filter the snapshotted sorted exercise list by sub-group and search query
  const subGroupFiltered = selectedSubGroup
    ? sortedExerciseList.filter((ex) =>
        selectedSubGroup === 'Shoulders'
          ? SHOULDER_EXERCISE_IDS.has(ex.id) || customShoulderIds.has(ex.id)
          : !SHOULDER_EXERCISE_IDS.has(ex.id) && !customShoulderIds.has(ex.id)
      )
    : sortedExerciseList;
  const displayedExercises = subGroupFiltered.filter((ex) =>
    ex.name.toLowerCase().includes(search.toLowerCase())
  );

  const favoriteExercises = displayedExercises.filter((ex) => ex.isFavorite);
  const customExercises = displayedExercises.filter((ex) => ex.isCustom && !ex.isFavorite);
  const defaultExercises = displayedExercises.filter((ex) => !ex.isCustom && !ex.isFavorite);
  const exerciseSections: { title: string; data: typeof displayedExercises }[] = [];
  if (favoriteExercises.length > 0) {
    exerciseSections.push({ title: 'Favorites', data: favoriteExercises });
  }
  if (customExercises.length > 0) {
    exerciseSections.push({ title: 'Added Exercises', data: customExercises });
  }
  INSTRUMENT_ORDER.forEach((inst) => {
    const data = defaultExercises.filter((ex) => (ex.instrument || 'Other') === inst);
    if (data.length > 0) {
      exerciseSections.push({ title: inst, data });
    }
  });

  const filteredHistory = historySearch.trim()
    ? history.filter((item) => {
        const q = historySearch.toLowerCase();
        if (item.name.toLowerCase().includes(q)) return true;
        if (formatHistoryDate(item.date).toLowerCase().includes(q)) return true;
        const hasMatchingExercise = item.exercises.some((logEx) => {
          const details = exercises.find((e) => e.id === logEx.exerciseId);
          return details?.name.toLowerCase().includes(q);
        });
        if (hasMatchingExercise) return true;
        return false;
      })
    : history;

  const GROUP_ORDER = ['Today', 'Yesterday', 'This Week', 'Last Week', 'Earlier'];
  const source = historySearch ? filteredHistory : history;
  const groupedHistory = source.reduce<{ title: string; data: WorkoutSession[] }[]>((groups, item) => {
    const label = getDateGroupLabel(item.date);
    const existing = groups.find((g) => g.title === label);
    if (existing) {
      existing.data.push(item);
    } else {
      groups.push({ title: label, data: [item] });
    }
    return groups;
  }, []);
  groupedHistory.sort((a, b) => GROUP_ORDER.indexOf(a.title) - GROUP_ORDER.indexOf(b.title));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />
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

                {/* Rest Timer */}
                <TouchableOpacity
                  style={[
                    styles.restTimerBadge,
                    {
                      backgroundColor: restTimerRunning ? '#10B981' : theme.cardBg,
                      borderColor: restTimerRunning ? '#10B981' : theme.borderColor,
                    }
                  ]}
                  onPress={() => {
                    stopTimerSound();
                    setRestTimerVisible(true);
                  }}
                  activeOpacity={0.7}
                >
                  <Timer size={14} color={restTimerRunning ? '#FFFFFF' : theme.textSecondary} strokeWidth={2.5} />
                  {restTimerRunning || restTimerSeconds > 0 ? (
                    <Text style={[styles.restTimerText, { color: restTimerRunning ? '#FFFFFF' : '#10B981' }]}>
                      {formatRestTime(restTimerSeconds)}
                    </Text>
                  ) : null}
                </TouchableOpacity>

              </View>
            </View>
          </View>

          {/* Segment Selector Toggle */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.segmentScrollContent}>
            {([
              { key: 'log', label: 'Log' },
              { key: 'templates', label: 'Templates' },
              { key: 'history', label: 'History' },
              { key: 'progress', label: 'Progress' },
            ] as const).map((seg) => {
              const isActive = activeSegment === seg.key;
              return (
                <TouchableOpacity
                  key={seg.key}
                  style={[
                    styles.segmentPill,
                    {
                      backgroundColor: isActive ? theme.segmentBtnActiveBg : 'transparent',
                      borderColor: isActive ? theme.segmentBtnActiveBorder : 'transparent',
                    }
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setActiveSegment(seg.key as any);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.segmentPillText, { color: isActive ? theme.textPrimary : theme.textSecondary }]}>
                    {seg.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

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
                    <TouchableOpacity
                      style={styles.cancelSessionBtn}
                      onPress={handleCancelSession}
                      activeOpacity={0.6}
                    >
                      <Trash2 size={18} color="#EF4444" strokeWidth={2} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.activeSessionList}>
                    {activeSessionExercises.map((le) => {
                      const details = exercises.find((e) => e.id === le.exerciseId);
                      if (!details) return null;
                      const muscleColor = categoryColors[details.muscleGroup] || '#10B981';
                      return (
                        <TouchableOpacity
                          key={le.exerciseId}
                          style={[styles.activeSessionItem, { borderBottomColor: theme.borderColor }]}
                          activeOpacity={0.6}
                          onPress={() => handleToggleExpand(le.exerciseId)}
                        >
                          <View style={[styles.activeSessionItemAccent, { backgroundColor: muscleColor }]} />
                          <View style={styles.activeSessionItemContent}>
                            <Text style={[styles.activeSessionItemName, { color: theme.textPrimary }]} numberOfLines={1}>
                              {details.name}
                            </Text>
                            <View style={styles.activeSessionItemMeta}>
                              <View style={[styles.activeSessionMuscleBadge, { backgroundColor: `${muscleColor}15` }]}>
                                <Text style={[styles.activeSessionMuscleBadgeText, { color: muscleColor }]}>
                                  {details.muscleGroup.toUpperCase()}
                                </Text>
                              </View>
                              <Text style={[styles.activeSessionItemSets, { color: theme.textSecondary }]}>
                                {le.sets.length} set{le.sets.length > 1 ? 's' : ''}
                              </Text>
                            </View>
                          </View>
                          <ChevronRight size={16} color={theme.textSecondary} opacity={0.4} strokeWidth={2} />
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <Text style={[styles.activeSessionHint, { color: theme.textSecondary }]}>Tap an exercise to edit</Text>

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
                        source={MUSCLE_IMAGES[muscle as keyof typeof MUSCLE_IMAGES]}
                        style={[styles.muscleImage, { opacity: isDarkMode ? 0.85 : 1.0 }]}
                        contentFit="contain"
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Weekly Calendar */}
              <Text style={[styles.sectionHeader, { color: theme.textSecondary }]}>WEEKLY OVERVIEW</Text>
              <Card style={[styles.weeklyCard, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
                <View style={styles.weeklyHeader}>
                  <TouchableOpacity
                    onPress={() => {
                      setCurrentWeekOffset(currentWeekOffset - 1);
                      setSelectedDay(null);
                    }}
                    activeOpacity={0.7}
                  >
                    <ChevronLeft size={18} color={theme.textSecondary} strokeWidth={2.5} />
                  </TouchableOpacity>
                  <Text style={[styles.weeklyTitle, { color: theme.textPrimary }]}>
                    {(() => {
                      const dates = getWeekDates(currentWeekOffset);
                      const m = dates[0].toLocaleDateString(undefined, { month: 'long' }).toUpperCase();
                      const y = dates[0].getFullYear();
                      return `${m} ${y}`;
                    })()}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      setCurrentWeekOffset(currentWeekOffset + 1);
                      setSelectedDay(null);
                    }}
                    activeOpacity={0.7}
                  >
                    <ChevronRight size={18} color={theme.textSecondary} strokeWidth={2.5} />
                  </TouchableOpacity>
                </View>

                <View style={styles.weekDaysRow}>
                  {(() => {
                    const dates = getWeekDates(currentWeekOffset);
                    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                    const todayLocal = new Date();
                    const todayLocalStr = `${todayLocal.getFullYear()}-${String(todayLocal.getMonth() + 1).padStart(2, '0')}-${String(todayLocal.getDate()).padStart(2, '0')}`;
                    return dates.map((date, i) => {
                      const dateStr = date.toISOString().split('T')[0];
                      const localDateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                      const isToday = todayLocalStr === localDateStr;
                      const isFuture = localDateStr > todayLocalStr;
                      const hasWorkout = history.some((s) => s.date.startsWith(dateStr));
                      const isSelected = selectedDay === dateStr;
                      return (
                        <TouchableOpacity
                          key={i}
                          disabled={isFuture}
                          style={[
                            styles.weekDaySquare,
                            {
                              backgroundColor: isSelected
                                ? '#3B82F6'
                                : hasWorkout
                                ? '#10B98120'
                                : theme.background,
                              borderColor: isSelected
                                ? '#3B82F6'
                                : isToday
                                ? '#3B82F660'
                                : theme.borderColor,
                              opacity: isFuture ? 0.3 : 1,
                            },
                          ]}
                          onPress={isFuture ? undefined : () => setSelectedDay(isSelected ? null : dateStr)}
                          activeOpacity={isFuture ? 1 : 0.7}
                        >
                          <Text
                            style={[
                              styles.weekDayLabel,
                              { color: isSelected ? '#FFFFFF' : theme.textSecondary },
                            ]}
                          >
                            {dayLabels[i]}
                          </Text>
                          <Text
                            style={[
                              styles.weekDayNum,
                              { color: isSelected ? '#FFFFFF' : theme.textPrimary },
                            ]}
                          >
                            {date.getDate()}
                          </Text>
                          {hasWorkout && !isSelected && (
                            <View style={styles.weekDayDot} />
                          )}
                        </TouchableOpacity>
                      );
                    });
                  })()}
                </View>

                {selectedDay && (
                  <View style={[styles.weeklyWorkouts, { borderTopColor: theme.borderColor }]}>
                    {(() => {
                      const dayWorkouts = history.filter((s) =>
                        s.date.startsWith(selectedDay)
                      );
                      if (dayWorkouts.length === 0) {
                        return (
                          <Text style={[styles.weeklyEmpty, { color: theme.textSecondary }]}>
                            No workouts on this day
                          </Text>
                        );
                      }
                      return dayWorkouts.map((w, wi) => {
                        return (
                          <View key={w.id}>
                            {wi > 0 && <View style={[styles.weeklyDaySeparator, { backgroundColor: theme.borderColor }]} />}
                            <View style={styles.weeklyDetailBlock}>
                              <View style={styles.weeklyDetailHeader}>
                                <Text style={[styles.weeklyDetailName, { color: theme.textPrimary }]}>{w.name}</Text>
                                <Text style={[styles.weeklyDetailDate, { color: theme.textSecondary }]}>
                                  {new Date(w.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                              </View>
                              {w.exercises.map((logEx) => {
                                const exDetails = exercises.find((e) => e.id === logEx.exerciseId);
                                return (
                                  <View key={logEx.exerciseId} style={styles.weeklyDetailExercise}>
                                    <Text style={[styles.weeklyDetailExerciseName, { color: theme.textPrimary }]}>
                                      {exDetails?.name || 'Unknown'}
                                    </Text>
                                    {logEx.sets.map((set, setIndex) => (
                                      <View key={set.id} style={styles.weeklyDetailSetRow}>
                                        <Text style={[styles.weeklyDetailSetLabel, { color: theme.textSecondary }]}>SET {setIndex + 1}</Text>
                                        <Text style={[styles.weeklyDetailSetValue, { color: theme.textPrimary }]}>{set.weight} kg × {set.reps}</Text>
                                      </View>
                                    ))}
                                  </View>
                                );
                              })}
                            </View>
                          </View>
                        );
                      });
                    })()}
                  </View>
                )}
              </Card>

              {/* Consistency Graph */}
              <TouchableOpacity 
                activeOpacity={0.7} 
                onPress={() => {
                  setProgressInitialTab('analytics');
                  setActiveSegment('progress');
                }}
              >
                <Text style={[styles.sectionHeader, { color: theme.textSecondary }]}>ACTIVITY TRACKER</Text>
                <ProgressGrid history={history} isDarkMode={isDarkMode} />
              </TouchableOpacity>

            </>
          ) : activeSegment === 'templates' ? (
            /* Templates View Section */
            <View style={styles.historySection}>
              <TouchableOpacity
                style={[styles.createTemplateButton, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}
                onPress={() => {
                  setTemplateName('');
                  setTemplateExercises([]);
                  setIsSavingActiveSessionAsTemplate(false);
                  setTemplateModalVisible(true);
                }}
                activeOpacity={0.7}
              >
                <Plus size={16} color="#10B981" strokeWidth={2.5} />
                <Text style={[styles.createTemplateButtonText, { color: theme.textPrimary }]}>
                  CREATE CUSTOM TEMPLATE
                </Text>
              </TouchableOpacity>
              
              {templates.length === 0 ? (
                <Card style={[styles.welcomeCard, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
                  <Calendar size={32} color="#10B981" strokeWidth={1.5} />
                  <Text style={[styles.welcomeTitle, { color: theme.textPrimary }]}>No templates yet</Text>
                  <Text style={[styles.welcomeDesc, { color: theme.textSecondary }]}>
                    Save a workout as a template from history or after finishing a session.
                  </Text>
                </Card>
              ) : (
                [...templates].reverse().map((tmpl) => {
                  const sessionMuscles: MuscleGroup[] = [];
                  const muscleSetCounts: Record<string, number> = {};
                  tmpl.exercises.forEach((logEx) => {
                    const details = exercises.find((e) => e.id === logEx.exerciseId);
                    if (details) {
                      sessionMuscles.push(details.muscleGroup);
                      muscleSetCounts[details.muscleGroup] = (muscleSetCounts[details.muscleGroup] || 0) + logEx.sets.length;
                    }
                  });
                  const uniqueMuscles = [...new Set(sessionMuscles)];
                  const muscleSetsString = Object.entries(muscleSetCounts)
                    .map(([muscle, sets]) => `${muscle} ${sets}`)
                    .join(' · ');
                  return (
                    <Card key={tmpl.id} style={[styles.historyLogCard, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
                      <View style={styles.historyCardHeader}>
                        <View style={styles.historyTitleCol}>
                          <Text style={[styles.historySessionName, { color: theme.textPrimary }]}>{tmpl.name}</Text>
                          <Text style={[styles.historyDate, { color: theme.textSecondary }]}>SAVED {new Date(tmpl.createdAt).toLocaleDateString().toUpperCase()}</Text>
                        </View>
                        <TouchableOpacity
                          style={styles.deleteLogBtn}
                          onPress={() => handleDeleteTemplate(tmpl.id, tmpl.name)}
                          activeOpacity={0.6}
                        >
                          <Trash2 size={16} color="#EF4444" strokeWidth={2} />
                        </TouchableOpacity>
                      </View>
                      <View style={[styles.historySetsReceipt, { borderTopColor: theme.borderColor }]}>
                        <Text style={[styles.historySummaryText, { color: theme.textSecondary }]} numberOfLines={1}>
                          {muscleSetsString}
                        </Text>
                      </View>
                      <View style={[styles.historyFooter, { borderTopColor: theme.borderColor }]}>
                        <View style={styles.historyBadgeRow}>
                          {uniqueMuscles.map((m) => (
                            <MuscleBadge key={m} muscleGroup={m} size="sm" />
                          ))}
                        </View>
                        <TouchableOpacity
                          style={styles.templateStartBtn}
                          onPress={() => handleUseTemplate(tmpl)}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.templateStartBtnText}>START</Text>
                        </TouchableOpacity>
                      </View>
                    </Card>
                  );
                })
              )}
            </View>
          ) : activeSegment === 'history' ? (
            /* History View Section */
            <View style={styles.historySection}>
              {history.length > 0 && (
                <View style={styles.historySearchContainer}>
                  <TextInput
                    style={[styles.historySearchInput, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                    placeholder="Search history..."
                    placeholderTextColor={theme.inputPlaceholder}
                    value={historySearch}
                    onChangeText={setHistorySearch}
                    autoCorrect={false}
                  />
                </View>
              )}
              {source.length === 0 ? (
                <Card style={[styles.welcomeCard, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
                  <Calendar size={32} color="#10B981" strokeWidth={1.5} />
                  <Text style={[styles.welcomeTitle, { color: theme.textPrimary }]}>
                    {historySearch ? 'No matching workouts' : 'No workout history yet'}
                  </Text>
                  <Text style={[styles.welcomeDesc, { color: theme.textSecondary }]}>
                    {historySearch ? 'Try a different search term.' : 'Log completed sets above. Your session summary data cards will load here.'}
                  </Text>
                </Card>
              ) : (
                groupedHistory.map((group) => (
                  <View key={group.title}>
                    <Text style={[styles.historySectionHeader, { color: theme.textSecondary }]}>
                      {group.title.toUpperCase()}
                    </Text>
                    {group.data.map((item) => {
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
                              <TouchableOpacity
                                style={styles.duplicateBtn}
                                onPress={() => handleOpenSaveTemplate(item.exercises, item.name)}
                                activeOpacity={0.6}
                              >
                                <Text style={[styles.duplicateBtnText, { color: theme.textSecondary }]}>SAVE AS TEMPLATE</Text>
                              </TouchableOpacity>
                            </View>
                          </Card>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ))
              )}
            </View>
          ) : (
            /* Progress View Section */
            <ProgressDashboard 
              initialModalTab={progressInitialTab}
              onClearInitialTab={() => setProgressInitialTab(null)}
            />
          )}
        </ScrollView>

        {/* Muscle Workout list popup modal */}
        <Modal
          visible={selectedModalMuscle !== null}
          animationType="none"
          presentationStyle="fullScreen"
          onRequestClose={() => { 
            setSelectedModalMuscle(null); 
            setSelectedSubGroup(null);
            setSelectedPickerExerciseIds(new Set());
            if (fromTemplateList) {
              setTemplateListVisible(true);
            }
          }}
        >
          <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
            <SafeAreaView style={styles.modalInnerContainer} edges={['top', 'bottom', 'left', 'right']}>
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.modalKeyboardContainer}
              >
                {/* Modal Header */}
                <View style={[styles.modalHeader, { borderBottomColor: theme.borderColor }]}>
                  <View style={{ flex: 1, marginRight: 12 }}>
                    <Text 
                      style={[styles.modalTitle, { color: theme.textPrimary }]} 
                      numberOfLines={1} 
                      adjustsFontSizeToFit
                    >
                      {(selectedSubGroup || selectedModalMuscle || '').toUpperCase()} WORKOUTS
                    </Text>
                    <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]} numberOfLines={1}>Select an exercise to log completed sets</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => { 
                      setSelectedModalMuscle(null); 
                      setSelectedSubGroup(null); 
                      setSelectedPickerExerciseIds(new Set());
                      if (fromTemplateList) {
                        setTemplateListVisible(true);
                      }
                    }}
                    activeOpacity={0.7}
                    style={{ padding: 6 }}
                  >
                    <X size={22} color={theme.textSecondary} strokeWidth={2.5} />
                  </TouchableOpacity>
                </View>

                {/* Top Horizontal Muscle Switcher to migrate groups */}
                <View style={styles.modalSwitcherRow}>
                  <ScrollView
                    ref={switcherScrollRef}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.modalSwitcherScroll}
                  >
                    {(() => {
                      const pills: { display: string; actual: MuscleGroup }[] = [];
                      MUSCLE_GROUPS.forEach((m) => {
                        if (m === 'Abs & Shoulders') {
                          pills.push({ display: 'Abs', actual: m });
                          pills.push({ display: 'Shoulders', actual: m });
                        } else {
                          pills.push({ display: m, actual: m });
                        }
                      });
                      return pills;
                    })().map((pill) => {
                      const isActive = selectedModalMuscle === pill.actual && (pill.actual !== 'Abs & Shoulders' || selectedSubGroup === pill.display);
                      const activeColor = categoryColors[pill.actual] || '#10B981';

                      return (
                        <TouchableOpacity
                          key={pill.display}
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
                            setSelectedModalMuscle(pill.actual);
                            setSelectedSubGroup(pill.actual === 'Abs & Shoulders' ? (pill.display as 'Abs' | 'Shoulders') : null);
                            setSearch('');
                            setExpandedExerciseId(null);
                            setSortedExerciseList(sortExercisesForMuscle(pill.actual));
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
                            {pill.display.toUpperCase()}
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
                <SectionList
                  sections={exerciseSections}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={styles.modalListContent}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  stickySectionHeadersEnabled={false}
                  renderSectionHeader={({ section }) => (
                    <View style={[styles.instrumentHeader, { borderBottomColor: theme.borderColor }]}>
                      <Text style={[styles.instrumentHeaderText, { color: theme.textSecondary }]}>
                        {section.title.toUpperCase()}
                      </Text>
                    </View>
                  )}
                  renderItem={({ item, section }) => {
                    const liveEx = exercises.find((e) => e.id === item.id);
                    const isFav = liveEx?.isFavorite ?? false;
                    const sectionStartIndex = exerciseSections
                      .slice(0, exerciseSections.indexOf(section))
                      .reduce((acc, s) => acc + s.data.length, 0);
                    const index = sectionStartIndex + section.data.indexOf(item);
                    return (
                      <Card style={[styles.exerciseCard, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
                        <View style={styles.exerciseHeaderRow}>
                          <TouchableOpacity
                            style={styles.exerciseInfoClick}
                            onPress={() => {
                              if (fromTemplateList) {
                                setSelectedPickerExerciseIds((prev) => {
                                  const next = new Set(prev);
                                  if (next.has(item.id)) {
                                    next.delete(item.id);
                                  } else {
                                    next.add(item.id);
                                  }
                                  return next;
                                });
                                return;
                              }
                              
                              const targetList = fromTemplateList ? templateListExercises : activeSessionExercises;
                              const existingInActive = targetList.find((le) => le.exerciseId === item.id);
                              const initialSets: WorkoutSet[] = [];
                              if (existingInActive && existingInActive.sets.length > 0) {
                                existingInActive.sets.forEach((set) => {
                                  initialSets.push({ id: set.id, weight: set.weight, reps: set.reps, isCompleted: true });
                                });
                              } else {
                                const previousLog = getPreviousWorkoutForExercise(item.id);
                                if (previousLog && previousLog.sets.length > 0) {
                                  previousLog.sets.forEach((set) => {
                                    initialSets.push({ id: generateId(), weight: set.weight, reps: set.reps, isCompleted: false });
                                  });
                                } else {
                                  initialSets.push({ id: generateId(), weight: 0, reps: 0, isCompleted: false });
                                }
                              }
                              setActiveSets(initialSets);
                              setSameForAll(true);
                              setExerciseNote(existingInActive?.notes || '');
                              setExpandedExerciseId(item.id);
                              if (fromTemplateList) {
                                setSelectedModalMuscle(null);
                                setSelectedSubGroup(null);
                              }
                            }}
                            activeOpacity={0.85}
                          >
                            {fromTemplateList && (
                              <View style={{
                                width: 20,
                                height: 20,
                                borderRadius: 6,
                                borderWidth: 2,
                                borderColor: selectedPickerExerciseIds.has(item.id) ? '#10B981' : theme.borderColor,
                                backgroundColor: selectedPickerExerciseIds.has(item.id) ? '#10B981' : 'transparent',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: 12,
                              }}>
                                {selectedPickerExerciseIds.has(item.id) && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
                              </View>
                            )}
                            {(() => {
                               const exerciseColor = ALT_COLORS[index % 4];
                               const renderExerciseIcon = ALT_IMAGES[index % 5];
                               return (
                                 <View style={[
                                   styles.exerciseBadgeCircle,
                                   { backgroundColor: `${exerciseColor}12` }
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
                          </TouchableOpacity>

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
                              color={isFav ? '#FF8A00' : theme.textSecondary}
                              fill={isFav ? '#FF8A00' : 'transparent'}
                              strokeWidth={2}
                            />
                          </TouchableOpacity>
                          {item.isCustom && (
                            <TouchableOpacity
                              style={styles.deleteCustomBtn}
                              onPress={async () => {
                                await deleteCustomExercise(item.id);
                                if (selectedModalMuscle) {
                                  setSortedExerciseList(sortExercisesForMuscle(selectedModalMuscle, undefined, new Set([item.id])));
                                }
                              }}
                              activeOpacity={0.7}
                            >
                              <Trash2 size={14} color="#EF4444" strokeWidth={2} />
                            </TouchableOpacity>
                          )}
                        </View>
                      </Card>
                    );
                  }}
                  ListHeaderComponent={() => (
                    <TouchableOpacity
                      style={styles.addExerciseBtn}
                      onPress={() => {
                        setNewExerciseName('');
                        setAddExerciseVisible(true);
                      }}
                      activeOpacity={0.5}
                    >
                      <Plus size={14} color="#6B7280" strokeWidth={2} />
                      <Text style={styles.addExerciseBtnText}>Add Exercise</Text>
                    </TouchableOpacity>
                  )}
                />

                {/* Modal Sticky Footer if active session is not empty */}
                {activeSessionExercises.length > 0 && !fromTemplateList && (
                  <View style={[styles.modalStickyFooter, { backgroundColor: theme.cardBg, borderTopColor: theme.borderColor }]}>
                    <Text style={[styles.modalFooterText, { color: theme.textPrimary }]}>
                      {activeSessionExercises.length} Exercise{activeSessionExercises.length > 1 ? 's' : ''} Logged
                    </Text>
                    <TouchableOpacity
                      style={[styles.modalFinishBtn, { backgroundColor: '#10B981' }]}
                      onPress={() => {
                        setSelectedModalMuscle(null);
                        setSelectedSubGroup(null);
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

                {/* Modal Sticky Footer if fromTemplateList is true */}
                {fromTemplateList && (
                  <View style={[styles.modalStickyFooter, { backgroundColor: theme.cardBg, borderTopColor: theme.borderColor }]}>
                    <Text style={[styles.modalFooterText, { color: theme.textPrimary }]}>
                      {selectedPickerExerciseIds.size} Exercise{selectedPickerExerciseIds.size !== 1 ? 's' : ''} Selected
                    </Text>
                    <TouchableOpacity
                      style={[styles.modalFinishBtn, { backgroundColor: selectedPickerExerciseIds.size > 0 ? '#10B981' : theme.borderColor }]}
                      onPress={async () => {
                        if (selectedPickerExerciseIds.size === 0) return;
                        
                        const newExercises: LoggedExercise[] = [];
                        selectedPickerExerciseIds.forEach((id) => {
                          // Check if already exists in template to avoid duplicates
                          if (templateListExercises.some(e => e.exerciseId === id)) return;
                          
                          const previousLog = getPreviousWorkoutForExercise(id);
                          const initialSets: WorkoutSet[] = [];
                          if (previousLog && previousLog.sets.length > 0) {
                            previousLog.sets.forEach((set) => {
                              initialSets.push({ id: generateId(), weight: set.weight, reps: set.reps, isCompleted: false });
                            });
                          } else {
                            initialSets.push({ id: generateId(), weight: 0, reps: 0, isCompleted: false });
                          }
                          newExercises.push({
                            exerciseId: id,
                            sets: initialSets,
                          });
                        });
                        
                        if (newExercises.length > 0) {
                          const updatedList = [...templateListExercises, ...newExercises];
                          setTemplateListExercises(updatedList);
                        }
                        
                        setSelectedModalMuscle(null);
                        setSelectedSubGroup(null);
                        setSelectedPickerExerciseIds(new Set());
                        setTemplateListVisible(true);
                      }}
                      disabled={selectedPickerExerciseIds.size === 0}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.modalFinishBtnText}>ADD TO TEMPLATE</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </KeyboardAvoidingView>
            </SafeAreaView>
          </View>
        </Modal>

      {/* Add Exercise Modal */}
      <Modal
        visible={addExerciseVisible}
        transparent={true}
        animationType="none"
        onRequestClose={() => setAddExerciseVisible(false)}
      >
        <View style={styles.addExerciseOverlay}>
          <View style={[styles.addExerciseCard, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
            <Text style={[styles.addExerciseTitle, { color: theme.textPrimary }]}>ADD EXERCISE</Text>
            <Text style={[styles.addExerciseSubtitle, { color: theme.textSecondary }]}>
              {selectedModalMuscle?.toUpperCase()}
            </Text>
            <TextInput
              style={[styles.addExerciseInput, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
              placeholder="Exercise name"
              placeholderTextColor={theme.inputPlaceholder}
              value={newExerciseName}
              onChangeText={setNewExerciseName}
              autoFocus={true}
              autoCorrect={false}
            />
            <View style={styles.addExerciseActions}>
              <TouchableOpacity
                style={[styles.addExerciseCancelBtn, { borderColor: theme.borderColor }]}
                onPress={() => setAddExerciseVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={[styles.addExerciseCancelText, { color: theme.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.addExerciseConfirmBtn, { backgroundColor: newExerciseName.trim() ? '#10B981' : theme.borderColor }]}
                onPress={async () => {
                  const name = newExerciseName.trim();
                  if (!name || !selectedModalMuscle) return;
                  const created = await createCustomExercise(name, selectedModalMuscle);
                  if (selectedSubGroup === 'Shoulders') {
                    const next = new Set(customShoulderIds);
                    next.add(created.id);
                    setCustomShoulderIds(next);
                    AsyncStorage.setItem('@custom_shoulder_ids', JSON.stringify([...next]));
                  }
                  setNewExerciseName('');
                  setAddExerciseVisible(false);
                  setSortedExerciseList(sortExercisesForMuscle(selectedModalMuscle, [created]));
                }}
                activeOpacity={0.8}
                disabled={!newExerciseName.trim()}
              >
                <Text style={styles.addExerciseConfirmText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Rest Timer Modal */}
      <Modal
        visible={restTimerVisible}
        transparent={true}
        animationType="none"
        onRequestClose={() => setRestTimerVisible(false)}
      >
        <View style={styles.timerOverlay}>
          <View style={[styles.timerCard, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
            <TouchableOpacity
              style={styles.timerCloseBtn}
              onPress={() => setRestTimerVisible(false)}
              activeOpacity={0.7}
            >
              <X size={14} color={theme.textSecondary} strokeWidth={2.5} />
            </TouchableOpacity>

            <Text style={[styles.timerDisplay, { color: restTimerRunning ? '#10B981' : theme.textPrimary }]}>
              {formatRestTime(restTimerSeconds)}
            </Text>

            <View style={styles.timerActions}>
              {restTimerRunning ? (
                <>
                  <TouchableOpacity
                    style={[styles.timerActionBtn, { backgroundColor: '#EF444420' }]}
                    onPress={stopRestTimer}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.timerActionText, { color: '#EF4444' }]}>STOP</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.timerActionBtn, { backgroundColor: '#6B728020' }]}
                    onPress={resetRestTimer}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.timerActionText, { color: '#6B7280' }]}>RESET</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity
                    style={[styles.timerActionBtn, { backgroundColor: '#10B98120' }]}
                    onPress={() => startRestTimer(restTimerSeconds > 0 ? restTimerSeconds : restTimerDuration)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.timerActionText, { color: '#10B981' }]}>START</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.timerActionBtn, { backgroundColor: '#6B728020' }]}
                    onPress={resetRestTimer}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.timerActionText, { color: '#6B7280' }]}>RESET</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>

            <View style={styles.timerPresets}>
              {[30, 60, 90, 120, 180, 300].map((sec) => (
                <TouchableOpacity
                  key={sec}
                  style={[
                    styles.timerPresetBtn,
                    {
                      backgroundColor: restTimerDuration === sec && !restTimerRunning ? '#3B82F620' : theme.background,
                      borderColor: restTimerDuration === sec && !restTimerRunning ? '#3B82F6' : theme.borderColor,
                    }
                  ]}
                  onPress={() => {
                    if (!restTimerRunning) {
                      setRestTimerDuration(sec);
                      setRestTimerSeconds(sec);
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.timerPresetText,
                      { color: restTimerDuration === sec && !restTimerRunning ? '#3B82F6' : theme.textSecondary },
                    ]}
                  >
                    {sec >= 60 ? `${sec / 60} min` : `${sec}s`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={[styles.timerSoundBox, { borderTopColor: theme.borderColor }]}>
              <Text style={[styles.timerSoundLabel, { color: theme.textSecondary }]}>SOUND</Text>
              <View style={styles.timerSoundOptions}>
                {(['alarm', 'none'] as const).map((opt) => (
                  <TouchableOpacity
                    key={opt}
                    style={[
                      styles.timerSoundBtn,
                      {
                        backgroundColor: restTimerSound === opt ? '#3B82F620' : theme.background,
                        borderColor: restTimerSound === opt ? '#3B82F6' : theme.borderColor,
                      }
                    ]}
                    onPress={() => setRestTimerSound(opt)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.timerSoundBtnText,
                        { color: restTimerSound === opt ? '#3B82F6' : theme.textSecondary },
                      ]}
                    >
                      {opt === 'none' ? 'OFF' : opt.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>
      </Modal>



      {/* Custom Modern Alert Modal */}
      <Modal
        visible={customAlertVisible}
        transparent={true}
        animationType="none"
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
        animationType="none"
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
                    <View style={styles.detailHeaderActions}>
                      <TouchableOpacity
                        style={[styles.detailActionBtn, { borderColor: theme.borderColor }]}
                        onPress={() => handleOpenSaveTemplate(selectedHistoryItem.exercises, selectedHistoryItem.name)}
                        activeOpacity={0.6}
                      >
                        <Text style={[styles.detailActionBtnText, { color: theme.textSecondary }]}>SAVE AS TEMPLATE</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.detailActionBtn, { borderColor: theme.borderColor }]}
                        onPress={() => {
                          if (editingHistoryWorkoutId === selectedHistoryItem.id) {
                            handleSaveHistoryEdit(selectedHistoryItem);
                          } else {
                            handleEditHistoryWorkout(selectedHistoryItem);
                          }
                        }}
                        activeOpacity={0.6}
                      >
                        <Text style={[styles.detailActionBtnText, { color: editingHistoryWorkoutId === selectedHistoryItem.id ? '#10B981' : theme.textSecondary }]}>
                          {editingHistoryWorkoutId === selectedHistoryItem.id ? 'SAVE' : 'EDIT'}
                        </Text>
                      </TouchableOpacity>
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
                    const isEditing = editingHistoryWorkoutId === selectedHistoryItem.id;
                    const editSets = historyEditSets[logEx.exerciseId];
                    return (
                      <View key={logEx.exerciseId} style={styles.detailExerciseGroup}>
                        <View style={styles.detailExerciseHeader}>
                          <View style={[styles.detailExerciseDot, { backgroundColor: categoryColors[exDetails?.muscleGroup || ''] || '#10B981' }]} />
                          <Text style={[styles.detailExerciseName, { color: theme.textPrimary }]}>
                            {exDetails?.name || 'Unknown'}
                          </Text>
                        </View>
                        {isEditing ? (
                          <View style={{ paddingLeft: 12, paddingRight: 4, marginBottom: 12 }}>
                            <TextInput
                              style={{
                                backgroundColor: theme.inputBg,
                                borderColor: theme.borderColor,
                                borderWidth: 1,
                                borderRadius: 8,
                                paddingHorizontal: 10,
                                paddingVertical: 6,
                                color: theme.textPrimary,
                                fontSize: 13,
                                minHeight: 36,
                                textAlignVertical: 'top',
                              }}
                              placeholder="Exercise note..."
                              placeholderTextColor={theme.inputPlaceholder}
                              value={historyEditNotes[logEx.exerciseId] || ''}
                              onChangeText={(text) => {
                                setHistoryEditNotes((prev) => ({
                                  ...prev,
                                  [logEx.exerciseId]: text,
                                }));
                              }}
                              multiline
                              maxLength={150}
                            />
                          </View>
                        ) : (
                          logEx.notes ? (
                            <View style={{ paddingLeft: 12, paddingBottom: 10 }}>
                              <Text style={{ fontSize: 13, color: '#10B981', fontStyle: 'italic', lineHeight: 17 }}>
                                Note: {logEx.notes}
                              </Text>
                            </View>
                          ) : null
                        )}

                        {(isEditing && editSets ? editSets : logEx.sets).map((set, setIndex) => (
                          <View key={set.id} style={styles.detailSetRow}>
                            <Text style={[styles.detailSetLabel, { color: theme.textSecondary }]}>SET {setIndex + 1}</Text>
                            {isEditing ? (
                              <View style={styles.detailEditSetRow}>
                                <IncrementInput
                                  value={set.weight}
                                  step={2.5}
                                  onChange={(val) => {
                                    setHistoryEditSets((prev) => ({
                                      ...prev,
                                      [logEx.exerciseId]: (prev[logEx.exerciseId] || logEx.sets.map((s) => ({ ...s }))).map((s, i) =>
                                        i === setIndex ? { ...s, weight: val } : s
                                      ),
                                    }));
                                  }}
                                  placeholder="kg"
                                  accentColor="#10B981"
                                  style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, height: 36, minWidth: 80 }}
                                  textColor={theme.textPrimary}
                                />
                                <IncrementInput
                                  value={set.reps}
                                  step={1}
                                  onChange={(val) => {
                                    setHistoryEditSets((prev) => ({
                                      ...prev,
                                      [logEx.exerciseId]: (prev[logEx.exerciseId] || logEx.sets.map((s) => ({ ...s }))).map((s, i) =>
                                        i === setIndex ? { ...s, reps: val } : s
                                      ),
                                    }));
                                  }}
                                  placeholder="reps"
                                  accentColor="#10B981"
                                  style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, height: 36, minWidth: 80 }}
                                  textColor={theme.textPrimary}
                                />
                              </View>
                            ) : (
                              <Text style={[styles.detailSetValue, { color: theme.textPrimary }]}>{set.weight} kg × {set.reps}</Text>
                            )}
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

      {/* PR Celebration Modal */}
      <Modal
        visible={showNewPrsAlert}
        transparent={true}
        animationType="none"
        onRequestClose={() => setShowNewPrsAlert(false)}
      >
        <View style={styles.timerOverlay}>
          <View style={[styles.timerCard, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
            <TouchableOpacity
              style={styles.timerCloseBtn}
              onPress={() => setShowNewPrsAlert(false)}
              activeOpacity={0.7}
            >
              <X size={14} color={theme.textSecondary} strokeWidth={2.5} />
            </TouchableOpacity>
            <Text style={[styles.prAlertEmoji]}>🏆</Text>
            <Text style={[styles.prAlertTitle, { color: theme.textPrimary }]}>NEW PR{newPrsDetected.length > 1 ? 'S' : ''}!</Text>
            <View style={styles.prAlertList}>
              {newPrsDetected.map((pr) => {
                const ex = exercises.find((e) => e.id === pr.exerciseId);
                return (
                  <View key={pr.exerciseId} style={[styles.prAlertItem, { borderColor: theme.borderColor }]}>
                    <Text style={[styles.prAlertExName, { color: theme.textPrimary }]}>{ex?.name || 'Unknown'}</Text>
                    <Text style={[styles.prAlertExValue, { color: '#10B981' }]}>{pr.weight} kg × {pr.reps}</Text>
                  </View>
                );
              })}
            </View>
            <TouchableOpacity
              style={[styles.prAlertBtn, { backgroundColor: '#10B981' }]}
              onPress={() => setShowNewPrsAlert(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.prAlertBtnText}>LET'S GO!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Edit Session Exercise Modal */}
      <Modal
        visible={editSessionExerciseModalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={() => setEditSessionExerciseModalVisible(false)}
      >
        <View style={styles.timerOverlay}>
          <View style={[styles.editWorkoutCard, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
            <View style={styles.editWorkoutHeader}>
              <Text style={[styles.editWorkoutTitle, { color: theme.textPrimary }]}>Edit Workout</Text>
              <TouchableOpacity
                onPress={() => setEditSessionExerciseModalVisible(false)}
                activeOpacity={0.6}
                style={{ padding: 4 }}
              >
                <X size={20} color={theme.textSecondary} strokeWidth={2} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={{ flexGrow: 0, maxHeight: 400 }} showsVerticalScrollIndicator={false}>
              {activeSessionExercises.map((le) => {
                const details = exercises.find((e) => e.id === le.exerciseId);
                if (!details) return null;
                const muscleColor = categoryColors[details.muscleGroup] || '#10B981';
                return (
                  <TouchableOpacity
                    key={le.exerciseId}
                    style={[styles.editWorkoutItem, { borderBottomColor: theme.borderColor }]}
                    activeOpacity={0.6}
                    onPress={() => {
                      handleToggleExpand(le.exerciseId);
                      setCameFromEditModal(true);
                      setEditSessionExerciseModalVisible(false);
                    }}
                  >
                    <View style={[styles.editWorkoutItemAccent, { backgroundColor: muscleColor }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: theme.textPrimary, fontSize: 16, fontWeight: '600', marginBottom: 2 }}>
                        {details.name}
                      </Text>
                      <View style={styles.editWorkoutItemMeta}>
                        <View style={[styles.editWorkoutMuscleBadge, { backgroundColor: `${muscleColor}15` }]}>
                          <Text style={[styles.editWorkoutMuscleBadgeText, { color: muscleColor }]}>
                            {details.muscleGroup.toUpperCase()}
                          </Text>
                        </View>
                        <Text style={{ color: theme.textSecondary, fontSize: 13, fontWeight: '600' }}>
                          {le.sets.length} set{le.sets.length > 1 ? 's' : ''}
                        </Text>
                      </View>
                    </View>
                    <ChevronRight size={18} color={theme.textSecondary} opacity={0.4} strokeWidth={2} />
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Exercise Set Logger Modal */}
      <Modal
        visible={expandedExerciseId !== null}
        transparent={true}
        animationType="none"
        onRequestClose={() => {
          if (fromTemplateList) {
            handleTemplateListBackFromLogger();
          } else {
            handleCloseActiveExerciseLogger();
          }
        }}
      >
        <View style={styles.exerciseLoggerOverlayContainer}>
          <Pressable
            style={styles.exerciseLoggerBackdrop}
            onPress={() => {
              if (fromTemplateList) handleTemplateListBackFromLogger(true);
              else handleCloseActiveExerciseLogger(true);
            }}
          />
          <View
            style={[styles.exerciseLoggerCard, { backgroundColor: theme.cardBg, borderColor: theme.borderColor, maxHeight: '85%', flexShrink: 1 }]}
          >
              {(() => {
              const exItem = expandedExerciseId ? exercises.find((e) => e.id === expandedExerciseId) : null;
              if (!exItem) return null;
              const categoryColor = categoryColors[exItem.muscleGroup] || '#10B981';
              const exerciseList = fromTemplateList ? templateListExercises : activeSessionExercises;
              const currentExIndex = exerciseList.findIndex((le) => le.exerciseId === expandedExerciseId);
              const canGoPrev = currentExIndex > 0;
              const canGoNext = currentExIndex < exerciseList.length - 1;

              const navigateToExercise = (direction: 'prev' | 'next') => {
                const exerciseList = fromTemplateList ? templateListExercises : activeSessionExercises;
                const curIdx = exerciseList.findIndex((le) => le.exerciseId === expandedExerciseId);
                const nextIndex = direction === 'next' ? curIdx + 1 : curIdx - 1;
                const nextEx = exerciseList[nextIndex];
                if (!nextEx) return;
                if (expandedExerciseId && activeSets.length > 0) {
                  const save = (prev: LoggedExercise[]) =>
                    prev.map((ex) =>
                      ex.exerciseId === expandedExerciseId
                        ? { ...ex, sets: activeSets.map((s) => ({ ...s, isCompleted: true })), notes: exerciseNote.trim() || undefined }
                        : ex
                    );
                  if (fromTemplateList) {
                    setTemplateListExercises(save);
                  } else {
                    const updated = save(activeSessionExercises);
                    setActiveSessionExercises(updated);
                    AsyncStorage.setItem('@active_session_exercises', JSON.stringify(updated));
                  }
                }
                setExpandedExerciseId(nextEx.exerciseId);
                setActiveSets(nextEx.sets.map((s) => ({
                  id: s.id,
                  weight: s.weight,
                  reps: s.reps,
                  isCompleted: true,
                })));
                setExerciseNote(nextEx.notes || '');
                setSameForAll(false);
              };
              navigateToExerciseRef.current = navigateToExercise;

              return (
                <View style={{ flexShrink: 1, maxHeight: '100%' }}>
                  <View {...exercisePanResponder.panHandlers} style={styles.exerciseLoggerHeader}>
                    {fromTemplateList ? (
                      <TouchableOpacity
                        style={styles.exerciseNavArrow}
                        onPress={() => handleTemplateListBackFromLogger()}
                        activeOpacity={0.6}
                      >
                        <ChevronLeft size={18} color={theme.textPrimary} strokeWidth={2.5} />
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={[styles.exerciseNavArrow, { opacity: canGoPrev ? 1 : 0.2 }]}
                        onPress={() => navigateToExercise('prev')}
                        disabled={!canGoPrev}
                        activeOpacity={0.6}
                      >
                        <ChevronLeft size={18} color={theme.textPrimary} strokeWidth={2.5} />
                      </TouchableOpacity>
                    )}
                    <View style={styles.exerciseLoggerTitleCol}>
                      <Text style={[styles.exerciseLoggerName, { color: theme.textPrimary }]}>{exItem.name}</Text>
                      <Text style={[styles.exerciseLoggerMuscle, { color: categoryColor }]}>{exItem.muscleGroup.toUpperCase()}</Text>
                    </View>
                    {fromTemplateList ? (
                      <TouchableOpacity
                        style={[styles.exerciseLoggerCloseBtn, { backgroundColor: '#F3F4F6', borderColor: theme.borderColor }]}
                        onPress={() => handleTemplateListBackFromLogger()}
                        activeOpacity={0.7}
                      >
                        <X size={14} color={theme.textSecondary} strokeWidth={2.5} />
                      </TouchableOpacity>
                    ) : (
                      <>
                        <TouchableOpacity
                          style={[styles.exerciseNavArrow, { opacity: canGoNext ? 1 : 0.2 }]}
                          onPress={() => navigateToExercise('next')}
                          disabled={!canGoNext}
                          activeOpacity={0.6}
                        >
                          <ChevronRight size={18} color={theme.textPrimary} strokeWidth={2.5} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.exerciseLoggerCloseBtn, { backgroundColor: '#F3F4F6', borderColor: theme.borderColor }]}
                          onPress={() => handleCloseActiveExerciseLogger()}
                          activeOpacity={0.7}
                        >
                          <X size={14} color={theme.textSecondary} strokeWidth={2.5} />
                        </TouchableOpacity>
                      </>
                    )}
                  </View>

                  <ScrollView style={{ flexShrink: 1, marginVertical: 12 }} showsVerticalScrollIndicator={false}>

                  {(() => {
                    const prev = expandedExerciseId ? getPreviousSessionForExercise(expandedExerciseId) : null;
                    const exercisePr = expandedExerciseId ? getExercisePR(expandedExerciseId) : null;
                    return prev ? (
                      <View style={[styles.prevWorkoutCard, { borderColor: theme.borderColor, backgroundColor: theme.background }]}>
                        <View style={styles.prevWorkoutHeader}>
                          <Text style={[styles.prevWorkoutLabel, { color: theme.textSecondary }]}>PREVIOUS</Text>
                          <Text style={[styles.prevWorkoutDate, { color: theme.textSecondary }]}>{new Date(prev.session.date).toLocaleDateString()}</Text>
                        </View>
                        {prev.log.sets.map((s, i) => (
                          <View key={s.id} style={styles.prevWorkoutSetRow}>
                            <Text style={[styles.prevWorkoutSetNum, { color: theme.textSecondary }]}>{i + 1}</Text>
                            <Text style={[styles.prevWorkoutSetDetail, { color: theme.textPrimary }]}>{s.weight} kg × {s.reps}</Text>
                          </View>
                        ))}
                        {prev.log.notes && (
                          <View style={{ marginTop: 8, paddingHorizontal: 4 }}>
                            <Text style={{ fontSize: 11, color: '#10B981', fontStyle: 'italic', lineHeight: 15 }}>
                              Note: {prev.log.notes}
                            </Text>
                          </View>
                        )}
                        {exercisePr && (
                          <View style={styles.prevWorkoutPrBadge}>
                            <Text style={{ fontSize: 10, fontWeight: '800', color: '#10B981', letterSpacing: 0.3 }}>PR: {exercisePr.weight} kg × {exercisePr.reps}</Text>
                          </View>
                        )}
                      </View>
                    ) : null;
                  })()}

                  <View style={[styles.exerciseLoggerDivider, { backgroundColor: theme.borderColor }]} />

                  <TouchableOpacity
                    style={styles.exerciseLoggerOptionRow}
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
                          : { backgroundColor: '#D1D5DB', alignItems: 'flex-start' }
                      ]}
                    >
                      <View style={styles.switchThumb} />
                    </View>
                  </TouchableOpacity>

                  <View style={styles.setRowLabels}>
                    <Text style={[styles.labelCol, styles.widthSet, { color: theme.textPrimary }]}>SET</Text>
                    <Text style={[styles.labelCol, styles.widthWeight, { color: theme.textSecondary }]}>WEIGHT</Text>
                    <Text style={[styles.labelCol, styles.widthReps, { color: theme.textSecondary }]}>REPS</Text>
                  </View>

                  {activeSets.map((set, index) => (
                    <View key={set.id} style={[styles.setRow, { borderBottomColor: theme.borderColor }]}>
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
                      {index === activeSets.length - 1 && activeSets.length > 1 && (
                        <TouchableOpacity
                          style={styles.setDeleteBtn}
                          onPress={() => handleRemoveSet(set.id)}
                          activeOpacity={0.6}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <X size={10} color="#EF4444" strokeWidth={2.5} />
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}

                  <View style={{ marginTop: 16, marginBottom: 8, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.borderColor, paddingTop: 16 }}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: theme.textSecondary, marginBottom: 6, letterSpacing: 0.5 }}>
                      EXERCISE NOTE
                    </Text>
                    <TextInput
                      style={{
                        backgroundColor: theme.inputBg,
                        borderColor: theme.borderColor,
                        borderWidth: 1,
                        borderRadius: 10,
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        color: theme.textPrimary,
                        fontSize: 13,
                        minHeight: 48,
                        textAlignVertical: 'top',
                      }}
                      placeholder="Add an optional exercise note..."
                      placeholderTextColor={theme.inputPlaceholder}
                      value={exerciseNote}
                      onChangeText={setExerciseNote}
                      multiline
                      maxLength={150}
                    />
                  </View>
                  </ScrollView>

                  <View style={styles.loggerActions}>
                    <TouchableOpacity
                      style={[styles.addSetBtn, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}
                      onPress={() => exItem && handleAddSet(exItem.id)}
                      activeOpacity={0.75}
                    >
                      <Plus size={14} color={theme.textSecondary} strokeWidth={2.5} />
                      <Text style={[styles.addSetBtnText, { color: theme.textSecondary }]}>ADD SET</Text>
                    </TouchableOpacity>
                    <Button
                      title={fromTemplateList ? "Save" : "Log Workout"}
                      variant="primary"
                      onPress={() => exItem && handleSaveWorkout(exItem.id)}
                      style={styles.saveWorkoutBtn}
                    />
                  </View>
                </View>
              );
            })()}
          </View>
        </View>
      </Modal>

      {/* Save as Template Modal */}
      <Modal
        visible={templateModalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={handleCancelSaveTemplate}
      >
        <View style={styles.timerOverlay}>
          <View style={[styles.timerCard, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
            <TouchableOpacity
              style={styles.timerCloseBtn}
              onPress={handleCancelSaveTemplate}
              activeOpacity={0.7}
            >
              <X size={14} color={theme.textSecondary} strokeWidth={2.5} />
            </TouchableOpacity>
            <Text style={[styles.prAlertTitle, { color: theme.textPrimary }]}>SAVE AS TEMPLATE</Text>
            <Text style={[styles.addExerciseSubtitle, { color: theme.textSecondary }]}>Name your template</Text>
            <TextInput
              style={[styles.addExerciseInput, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
              placeholder="Template name"
              placeholderTextColor={theme.inputPlaceholder}
              value={templateName}
              onChangeText={setTemplateName}
              autoFocus={true}
              autoCorrect={false}
            />
            <View style={styles.addExerciseActions}>
              <TouchableOpacity
                style={[styles.addExerciseCancelBtn, { borderColor: theme.borderColor }]}
                onPress={handleCancelSaveTemplate}
                activeOpacity={0.7}
              >
                <Text style={[styles.addExerciseCancelText, { color: theme.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.addExerciseConfirmBtn, { backgroundColor: templateName.trim() ? '#10B981' : theme.borderColor }]}
                onPress={handleConfirmSaveTemplate}
                activeOpacity={0.8}
                disabled={!templateName.trim()}
              >
                <Text style={styles.addExerciseConfirmText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Template Exercise List Overlay */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: templateListVisible ? 1000 : -1,
          opacity: templateListVisible ? 1 : 0,
          pointerEvents: templateListVisible ? 'auto' : 'none',
        }}
      >
        <View style={styles.timerOverlay}>
          <View style={[styles.editWorkoutCard, { backgroundColor: theme.cardBg, borderColor: theme.borderColor, maxHeight: '90%', width: '95%' }]}>
            <View style={styles.editWorkoutHeader}>
              <View>
                <Text style={[styles.editWorkoutTitle, { color: theme.textPrimary }]}>Exercises ({templateListExercises.length})</Text>
                {templateListExercises.length > 1 && (
                  <Text style={{ color: theme.textSecondary, fontSize: 10, fontWeight: '700', marginTop: 3, opacity: 0.8, letterSpacing: 0.2 }}>
                    Drag ⠿ to reorder
                  </Text>
                )}
              </View>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity
                  onPress={() => {
                    handleSelectMuscleCard('Chest');
                  }}
                  activeOpacity={0.6}
                  style={{ padding: 4 }}
                >
                  <Plus size={20} color={theme.textPrimary} strokeWidth={2.5} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => { setTemplateListVisible(false); setFromTemplateList(false); setTemplateListExercises([]); setActiveTemplateId(null); }}
                  activeOpacity={0.6}
                  style={{ padding: 4 }}
                >
                  <X size={24} color={theme.textSecondary} strokeWidth={2} />
                </TouchableOpacity>
              </View>
            </View>
            {templateListExercises.length === 0 ? (
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 12 }}>
                <Dumbbell size={36} color={theme.textSecondary} opacity={0.5} strokeWidth={1.5} />
                <Text style={{ color: theme.textSecondary, fontSize: 14, fontWeight: '600', textAlign: 'center' }}>
                  No exercises in this template yet.
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    handleSelectMuscleCard('Chest');
                  }}
                  activeOpacity={0.7}
                  style={{
                    backgroundColor: '#10B981',
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    borderRadius: 10,
                    marginTop: 8,
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '800' }}>ADD EXERCISE</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <DragList
                containerStyle={{ maxHeight: 400, flexShrink: 1 }}
                data={templateListExercises}
                keyExtractor={(item) => item.exerciseId}
                onReordered={(fromIdx, toIdx) => {
                  setTemplateListExercises((prev) => {
                    const updated = [...prev];
                    const [moved] = updated.splice(fromIdx, 1);
                    updated.splice(toIdx, 0, moved);
                    return updated;
                  });
                }}
                style={{ maxHeight: 400, flexShrink: 1 }}
                renderItem={({ item, onDragStart, isActive }) => {
                    const details = exercises.find((e) => e.id === item.exerciseId);
                    if (!details) return null;
                    const muscleColor = categoryColors[details.muscleGroup] || '#10B981';
                    return (
                      <TouchableOpacity
                        activeOpacity={0.6}
                        onPress={() => handleTemplateExercisePress(item)}
                        onLongPress={onDragStart}
                        delayLongPress={150}
                        style={[styles.editWorkoutItem, { borderBottomColor: theme.borderColor, opacity: isActive ? 0.5 : 1 }]}
                      >
                        <GripVertical size={16} color={theme.textSecondary} opacity={0.4} style={{ marginRight: 10 }} />
                        <View style={[styles.editWorkoutItemAccent, { backgroundColor: muscleColor }]} />
                        <View style={{ flex: 1 }}>
                          <Text style={{ color: theme.textPrimary, fontSize: 16, fontWeight: '600', marginBottom: 2 }}>
                            {details.name}
                          </Text>
                          <View style={styles.editWorkoutItemMeta}>
                            <View style={[styles.editWorkoutMuscleBadge, { backgroundColor: `${muscleColor}15` }]}>
                              <Text style={[styles.editWorkoutMuscleBadgeText, { color: muscleColor }]}>
                                {details.muscleGroup.toUpperCase()}
                              </Text>
                            </View>
                            <Text style={{ color: theme.textSecondary, fontSize: 13, fontWeight: '600' }}>
                              {item.sets.length} set{item.sets.length > 1 ? 's' : ''}
                            </Text>
                          </View>
                        </View>
                        <ChevronRight size={18} color={theme.textSecondary} opacity={0.4} strokeWidth={2} />
                      </TouchableOpacity>
                    );
                  }}
                />
            )}
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
              <TouchableOpacity
                onPress={async () => {
                  if (activeTemplateId) {
                    await updateTemplate(activeTemplateId, templateListExercises);
                  }
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  setTemplateListVisible(false);
                  setFromTemplateList(false);
                  setTemplateListExercises([]);
                  setActiveTemplateId(null);
                }}
                activeOpacity={0.7}
                style={{ flex: 1, paddingVertical: 16, alignItems: 'center', borderRadius: 14, borderWidth: 1, borderColor: '#10B981', backgroundColor: 'transparent' }}
              >
                <Text style={{ color: '#10B981', fontSize: 14, fontWeight: '800', letterSpacing: 0.3 }}>SAVE</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setTemplateLogSelectedIds(new Set(templateListExercises.map(e => e.exerciseId)));
                  setTemplateLogSelectVisible(true);
                }}
                activeOpacity={0.8}
                style={{ flex: 1, backgroundColor: '#10B981', paddingVertical: 16, alignItems: 'center', borderRadius: 14 }}
              >
                <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '800', letterSpacing: 0.5 }}>LOG</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* Template Log Selection Modal */}
      <Modal
        visible={templateLogSelectVisible}
        transparent={true}
        animationType="none"
        onRequestClose={() => setTemplateLogSelectVisible(false)}
      >
        <View style={styles.timerOverlay}>
          <View style={[styles.editWorkoutCard, { backgroundColor: theme.cardBg, borderColor: theme.borderColor, maxHeight: '85%', width: '95%' }]}>
            <View style={styles.editWorkoutHeader}>
              <View>
                <Text style={[styles.editWorkoutTitle, { color: theme.textPrimary }]}>Select Exercises</Text>
                <Text style={{ color: theme.textSecondary, fontSize: 12, fontWeight: '600', marginTop: 2 }}>
                  {templateLogSelectedIds.size} of {templateListExercises.length} selected
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  if (templateLogSelectedIds.size === templateListExercises.length) {
                    setTemplateLogSelectedIds(new Set());
                  } else {
                    setTemplateLogSelectedIds(new Set(templateListExercises.map(e => e.exerciseId)));
                  }
                }}
                activeOpacity={0.7}
                style={{ paddingVertical: 4, paddingHorizontal: 10 }}
              >
                <Text style={{ color: '#10B981', fontSize: 13, fontWeight: '700' }}>
                  {templateLogSelectedIds.size === templateListExercises.length ? 'Deselect All' : 'Select All'}
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
              {templateListExercises.map((logEx) => {
                const details = exercises.find((e) => e.id === logEx.exerciseId);
                if (!details) return null;
                const muscleColor = categoryColors[details.muscleGroup] || '#10B981';
                const isSelected = templateLogSelectedIds.has(logEx.exerciseId);
                return (
                  <TouchableOpacity
                    key={logEx.exerciseId}
                    activeOpacity={0.6}
                    onPress={() => {
                      setTemplateLogSelectedIds((prev) => {
                        const next = new Set(prev);
                        if (next.has(logEx.exerciseId)) {
                          next.delete(logEx.exerciseId);
                        } else {
                          next.add(logEx.exerciseId);
                        }
                        return next;
                      });
                    }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                      borderBottomWidth: 1,
                      borderBottomColor: theme.borderColor,
                    }}
                  >
                    <View style={{
                      width: 22,
                      height: 22,
                      borderRadius: 6,
                      borderWidth: 2,
                      borderColor: isSelected ? '#10B981' : theme.borderColor,
                      backgroundColor: isSelected ? '#10B981' : 'transparent',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 14,
                    }}>
                      {isSelected && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
                    </View>
                    <View style={[styles.editWorkoutItemAccent, { backgroundColor: muscleColor }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: isSelected ? theme.textPrimary : theme.textSecondary, fontSize: 15, fontWeight: '600' }}>
                        {details.name}
                      </Text>
                      <Text style={{ color: theme.textSecondary, fontSize: 12, fontWeight: '500', marginTop: 1 }}>
                        {details.muscleGroup} · {logEx.sets.length} set{logEx.sets.length > 1 ? 's' : ''}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
              <TouchableOpacity
                onPress={() => setTemplateLogSelectVisible(false)}
                activeOpacity={0.7}
                style={{ flex: 1, paddingVertical: 16, alignItems: 'center', borderRadius: 14, borderWidth: 1, borderColor: theme.borderColor }}
              >
                <Text style={{ color: theme.textSecondary, fontSize: 14, fontWeight: '700', letterSpacing: 0.3 }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  const selectedExercises = templateListExercises
                    .filter(e => templateLogSelectedIds.has(e.exerciseId))
                    .map(e => ({
                      exerciseId: e.exerciseId,
                      sets: e.sets.map(s => ({ ...s, id: generateId(), isCompleted: false })),
                      notes: e.notes,
                    }));
                  const now = Date.now();
                  setActiveSessionExercises(selectedExercises);
                  setSessionStartTime(now);
                  setTemplateLogSelectVisible(false);
                  setTemplateListVisible(false);
                  setFromTemplateList(false);
                  setActiveTemplateId(null);
                  setTemplateListExercises([]);
                  setActiveSegment('log');
                  AsyncStorage.setItem('@active_session_exercises', JSON.stringify(selectedExercises));
                  AsyncStorage.setItem('@session_start_time', String(now));
                }}
                activeOpacity={0.8}
                disabled={templateLogSelectedIds.size === 0}
                style={{
                  flex: 1,
                  backgroundColor: templateLogSelectedIds.size > 0 ? '#10B981' : theme.borderColor,
                  paddingVertical: 16,
                  alignItems: 'center',
                  borderRadius: 14,
                }}
              >
                <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '800', letterSpacing: 0.5 }}>
                  START ({templateLogSelectedIds.size})
                </Text>
              </TouchableOpacity>
            </View>
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
  createTemplateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
    gap: 8,
  },
  createTemplateButtonText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
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
  segmentScrollContent: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 2,
    marginBottom: 24,
  },
  segmentPill: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 99,
    borderWidth: 0.5,
  },
  segmentPillText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
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
  // Weekly Calendar Styles
  weeklyCard: {
    padding: 16,
    marginBottom: 20,
  },
  weeklyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  weeklyTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
  },
  weekDaySquare: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    gap: 2,
  },
  weekDayLabel: {
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  weekDayNum: {
    fontSize: 14,
    fontWeight: '800',
  },
  weekDayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#10B981',
    marginTop: 1,
  },
  weeklyDaySeparator: {
    height: 1,
    marginVertical: 12,
  },
  weeklyWorkouts: {
    borderTopWidth: 1,
    marginTop: 12,
    paddingTop: 12,
  },
  weeklyEmpty: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    paddingVertical: 8,
  },
  weeklyDetailBlock: {
    gap: 8,
  },
  weeklyDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weeklyDetailName: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
    flex: 1,
    marginRight: 8,
  },
  weeklyDetailDate: {
    fontSize: 10,
    fontWeight: '700',
  },
  weeklyDetailExercise: {
    paddingLeft: 4,
    gap: 2,
  },
  weeklyDetailExerciseName: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  weeklyDetailSetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 1,
    paddingLeft: 8,
  },
  weeklyDetailSetLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  weeklyDetailSetValue: {
    fontSize: 12,
    fontWeight: '700',
  },
  weeklyBadgeRow: {
    flexDirection: 'row',
    gap: 6,
    paddingTop: 4,
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#252525',
  },
  setRowCompleted: {
    opacity: 0.4,
  },
  setText: {
    width: 28,
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  setDeleteBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#EF444415',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
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
  deleteCustomBtn: {
    width: 44,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderLeftWidth: 1,
    borderLeftColor: '#252525',
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
  historySectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 4,
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
    flexWrap: 'wrap',
    gap: 4,
    flex: 1,
    marginRight: 8,
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
  detailHeaderActions: {
    flexDirection: 'row',
    gap: 8,
  },
  detailActionBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  detailActionBtnText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  detailEditSetRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  prevWorkoutCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
    gap: 4,
  },
  prevWorkoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  prevWorkoutLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  prevWorkoutDate: {
    fontSize: 10,
    fontWeight: '600',
  },
  prevWorkoutSetRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  prevWorkoutSetNum: {
    fontSize: 11,
    fontWeight: '700',
    width: 20,
  },
  prevWorkoutSetDetail: {
    fontSize: 12,
    fontWeight: '600',
  },
  prevWorkoutPrBadge: {
    marginTop: 6,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: '#10B98115',
    alignSelf: 'flex-start',
  },
  progressStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  progressStatCard: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    alignItems: 'center',
    gap: 4,
  },
  progressStatValue: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  progressStatLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  insightCard: {
    padding: 16,
    gap: 12,
    marginBottom: 20,
  },
  insightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  insightLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  insightValue: {
    fontSize: 12,
    fontWeight: '800',
  },
  prCard: {
    padding: 14,
    gap: 6,
    marginBottom: 8,
  },
  prHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  prExerciseName: {
    fontSize: 14,
    fontWeight: '800',
  },
  prDate: {
    fontSize: 10,
    fontWeight: '600',
  },
  prDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  prValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  prE1rm: {
    fontSize: 11,
    fontWeight: '600',
  },
  duplicateBtn: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  duplicateBtnText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  templateStartBtn: {
    borderWidth: 1,
    borderColor: '#10B981',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 99,
    flexShrink: 0,
  },
  templateStartBtnText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#10B981',
    letterSpacing: 0.5,
  },
  prAlertEmoji: {
    fontSize: 40,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  prAlertTitle: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  prAlertList: {
    width: '100%',
    gap: 8,
    marginBottom: 20,
  },
  prAlertItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 10,
  },
  prAlertExName: {
    fontSize: 13,
    fontWeight: '700',
  },
  prAlertExValue: {
    fontSize: 14,
    fontWeight: '800',
  },
  prAlertBtn: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  prAlertBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: 0.5,
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
  historySearchContainer: {
    marginBottom: 12,
  },
  historySearchInput: {
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
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
  restTimerBadge: {
    height: 38,
    paddingHorizontal: 10,
    borderRadius: 19,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    minWidth: 38,
  },
  restTimerText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  timerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  timerCard: {
    width: '100%',
    maxWidth: 300,
    borderRadius: 24,
    borderWidth: 1,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  timerCloseBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F3F4F6',
  },
  timerDisplay: {
    fontSize: 48,
    fontWeight: '800',
    letterSpacing: -1,
    marginTop: 8,
    marginBottom: 20,
  },
  timerActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  timerActionBtn: {
    paddingVertical: 10,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  timerActionText: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  timerPresets: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  timerPresetBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 99,
    borderWidth: 1,
  },
  timerPresetText: {
    fontSize: 12,
    fontWeight: '700',
  },
  timerSoundBox: {
    borderTopWidth: 1,
    marginTop: 20,
    paddingTop: 16,
    width: '100%',
    alignItems: 'center',
    gap: 10,
  },
  timerSoundLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  timerSoundOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  timerSoundBtn: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 99,
    borderWidth: 1,
  },
  timerSoundBtnText: {
    fontSize: 11,
    fontWeight: '800',
  },
  activeSessionCard: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  activeSessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  activeSessionTitle: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  activeSessionSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  cancelSessionBtn: {
    padding: 6,
  },
  activeSessionList: {
    gap: 0,
    marginBottom: 12,
  },
  activeSessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  activeSessionItemAccent: {
    width: 3,
    height: 28,
    borderRadius: 2,
    marginRight: 12,
  },
  activeSessionItemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activeSessionItemName: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  activeSessionItemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activeSessionMuscleBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
  },
  activeSessionMuscleBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  activeSessionItemSets: {
    fontSize: 11,
    fontWeight: '600',
  },
  activeSessionHint: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 14,
    opacity: 0.6,
  },
  editWorkoutCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    width: '90%',
    maxHeight: '80%',
    flexShrink: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  editWorkoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  editWorkoutTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  editWorkoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  editWorkoutItemAccent: {
    width: 3,
    height: 36,
    borderRadius: 2,
    marginRight: 14,
  },
  editWorkoutItemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  editWorkoutMuscleBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  editWorkoutMuscleBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.3,
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
  exerciseLoggerOverlayContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  exerciseLoggerBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(9, 10, 15, 0.7)',
  },
  exerciseLoggerCard: {
    width: '100%',
    maxWidth: 380,
    maxHeight: '85%',
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  exerciseLoggerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  exerciseLoggerTitleCol: {
    flex: 1,
    marginRight: 12,
    gap: 3,
  },
  exerciseLoggerName: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  exerciseLoggerMuscle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  exerciseNavArrow: {
    padding: 6,
  },
  exerciseLoggerCloseBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  exerciseLoggerDivider: {
    height: 1,
    marginVertical: 16,
  },
  exerciseLoggerOptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
  instrumentHeader: {
    paddingTop: 12,
    paddingBottom: 4,
    marginBottom: 2,
    borderBottomWidth: 1,
  },
  instrumentHeaderText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  addExerciseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    marginTop: 6,
  },
  addExerciseBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 0.3,
  },
  addExerciseOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  addExerciseCard: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 24,
    borderWidth: 1,
    padding: 28,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  addExerciseTitle: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  addExerciseSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
    letterSpacing: 0.8,
  },
  addExerciseInput: {
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 20,
  },
  addExerciseActions: {
    flexDirection: 'row',
    gap: 12,
  },
  addExerciseCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  addExerciseCancelText: {
    fontSize: 14,
    fontWeight: '700',
  },
  addExerciseConfirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  addExerciseConfirmText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    paddingTop: 60,
  },
  templateListHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  templateReorderCol: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    marginRight: 10,
    paddingVertical: 2,
  },
  historyLogItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 4,
  },
  templateListTitle: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  templateListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
});
