import { Image } from 'expo-image';
import {
  Award,
  Calendar,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Flame,
  GripVertical,
  Minus,
  Play,
  Plus,
  RefreshCw,
  Star,
  Timer,
  Trash2,
  Trophy,
  User,
  X
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  AppState,
  BackHandler,
  Dimensions,
  Easing,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import * as Notifications from 'expo-notifications';
import notifee, { AndroidImportance, AndroidVisibility, TriggerType, TimestampTrigger, EventType } from '@notifee/react-native';
import Svg, { Defs, LinearGradient as SvgGradient, Rect, Stop } from 'react-native-svg';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const isOngoing = notification.request.identifier === 'rest-timer-active-ongoing';
    return {
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: !isOngoing,
      shouldSetBadge: false,
    };
  },
});

const MUSCLE_IMAGES = {
  Chest: require('@/assets/images/muscle_chest.png'),
  Triceps: require('@/assets/images/muscle_triceps.png'),
  Biceps: require('@/assets/images/muscle_biceps.png'),
  Back: require('@/assets/images/muscle_back.png'),
  Legs: require('@/assets/images/muscle_legs.png'),
  'Back & Shoulders': require('@/assets/images/muscle_shoulders_v2.png'),
  'Abs & Shoulders': require('@/assets/images/muscle_shoulders_v2.png'),
  Shoulders: require('@/assets/images/muscle_shoulders_v2.png'),
};

const categoryColors: Record<string, string> = {
  Chest: '#10B981',
  Triceps: '#06B6D4',
  Biceps: '#3B82F6',
  Back: '#A855F7',
  Legs: '#FF8A00',
  'Back & Shoulders': '#22C55E',
  'Abs & Shoulders': '#22C55E',
  Abs: '#EAB308',
  Shoulders: '#22C55E',
};

const getCompactNavName = (name: string) => {
  return name
    .replace(/dumbbell/gi, 'DB')
    .replace(/barbell/gi, 'BB')
    .replace(/machine/gi, 'Mach')
    .replace(/bench press/gi, 'Press')
    .replace(/overhead/gi, 'OH')
    .trim();
};

const Haptics = {
  impactAsync: async (...args: any[]) => { },
  notificationAsync: async (...args: any[]) => { },
  selectionAsync: async (...args: any[]) => { },
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

import { auth } from '@/lib/firebase/firebaseConfig';
import { loadLocalProfile, OnboardingProfile, setSignedOut, setSignedIn, setOnboardingCompleted, saveLocalProfile, FitnessGoal, isOnboardingCompleted } from '@/lib/profile/profileStorage';
import { getProfileFromFirestore, saveProfileToFirestore } from '@/lib/firestore/profileFirestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { useGoogleSignIn, signOutFromGoogle } from '@/lib/auth/googleAuth';

import { ProgressDashboard } from '@/components/progress/ProgressDashboard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { IncrementInput } from '@/components/ui/input';
import { MuscleBadge } from '@/components/ui/muscle-badge';
import { ProgressGrid } from '@/components/ui/progress-grid';
import { DEFAULT_EXERCISES, INSTRUMENT_ORDER, INSTRUMENT_COLORS, MUSCLE_GROUPS, ALL_MUSCLE_GROUPS, MuscleGroup, SHOULDER_EXERCISE_IDS, POPULAR_EXERCISE_IDS, getMovementPatternGroup, getMovementFamilyIds } from '@/constants/exercises';
import { getExerciseImage } from '@/constants/equipmentImages';
import { useWorkoutAnalytics } from '@/hooks/use-workout-analytics';
import { Exercise, LoggedExercise, PersonalRecord, useWorkout, WorkoutSession, WorkoutSet, WorkoutTemplate } from '@/hooks/use-workout-storage';
import DragList from 'react-native-draglist';

const generateId = () => Date.now().toString() + Math.random().toString(36).substring(2, 9);

const SwipeableActiveExerciseRow: React.FC<{
  children: React.ReactNode;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  cardBgColor: string;
  disabled?: boolean;
}> = ({ children, onSwipeLeft, onSwipeRight, cardBgColor, disabled = false }) => {
  const pan = React.useRef(new Animated.Value(0)).current;

  const disabledRef = React.useRef(disabled);
  disabledRef.current = disabled;

  // Delete action backdrop opacity (revealed on Left side when swiping RIGHT pan > 0)
  const deleteOpacity = pan.interpolate({
    inputRange: [0, 15, 60],
    outputRange: [0, 0.5, 1],
    extrapolate: 'clamp',
  });

  // Variation action backdrop opacity (revealed on Right side when swiping LEFT pan < 0)
  const variationOpacity = pan.interpolate({
    inputRange: [-60, -15, 0],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp',
  });

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        if (disabledRef.current) return false;
        return Math.abs(gestureState.dx) > 16 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 2.2;
      },
      onMoveShouldSetPanResponderCapture: () => false,
      onPanResponderMove: Animated.event([null, { dx: pan }], { useNativeDriver: false }),
      onPanResponderRelease: (_, gestureState) => {
        const threshold = 35;
        const velocityThreshold = 0.3;
        const isFlickLeft = gestureState.dx < -threshold || gestureState.vx < -velocityThreshold;
        const isFlickRight = gestureState.dx > threshold || gestureState.vx > velocityThreshold;

        if (gestureState.dx < -10 && isFlickLeft) {
          // Swiping LEFT -> VARIATION SWAP
          Animated.timing(pan, {
            toValue: -350,
            duration: 120,
            useNativeDriver: false,
          }).start(() => {
            onSwipeLeft();
            pan.setValue(0);
          });
        } else if (gestureState.dx > 10 && isFlickRight) {
          // Swiping RIGHT -> DELETE
          Animated.timing(pan, {
            toValue: 350,
            duration: 120,
            useNativeDriver: false,
          }).start(() => {
            onSwipeRight();
            pan.setValue(0);
          });
        } else {
          Animated.spring(pan, {
            toValue: 0,
            useNativeDriver: false,
            bounciness: 4,
          }).start();
        }
      },
      onPanResponderTerminate: () => {
        Animated.spring(pan, {
          toValue: 0,
          useNativeDriver: false,
        }).start();
      },
    })
  ).current;

  return (
    <View style={{ position: 'relative', overflow: 'hidden', borderRadius: 14, marginBottom: 2 }}>
      {/* Left side action backdrop (Swiping RIGHT -> DELETE) */}
      <Animated.View
        style={[
          styles.activeSwipeActionBackground,
          { backgroundColor: '#EF444418', opacity: deleteOpacity, justifyContent: 'flex-start', paddingLeft: 18 }
        ]}
      >
        <Trash2 size={15} color="#EF4444" strokeWidth={2.5} />
        <Text style={[styles.activeSwipeActionText, { color: '#EF4444' }]}>DELETE</Text>
      </Animated.View>

      {/* Right side action backdrop (Swiping LEFT -> REPLACE) */}
      <Animated.View
        style={[
          styles.activeSwipeActionBackground,
          { backgroundColor: '#10B98118', opacity: variationOpacity, justifyContent: 'flex-end', paddingRight: 18 }
        ]}
      >
        <Text style={[styles.activeSwipeActionText, { color: '#10B981' }]}>REPLACE</Text>
        <RefreshCw size={15} color="#10B981" strokeWidth={2.5} />
      </Animated.View>

      {/* Solid Opaque Sliding Card Container */}
      <Animated.View
        style={{
          transform: [{ translateX: pan }],
          backgroundColor: cardBgColor || '#13141C',
        }}
        {...panResponder.panHandlers}
      >
        {children}
      </Animated.View>
    </View>
  );
};

const SwipeableLoggerCard: React.FC<{
  children: React.ReactNode;
  onGoNext?: () => void;
  onGoPrev?: () => void;
  canGoNext: boolean;
  canGoPrev: boolean;
}> = ({ children, onGoNext, onGoPrev, canGoNext, canGoPrev }) => {
  const pan = React.useRef(new Animated.Value(0)).current;

  const onGoNextRef = React.useRef(onGoNext);
  const onGoPrevRef = React.useRef(onGoPrev);
  const canGoNextRef = React.useRef(canGoNext);
  const canGoPrevRef = React.useRef(canGoPrev);

  React.useEffect(() => {
    onGoNextRef.current = onGoNext;
    onGoPrevRef.current = onGoPrev;
    canGoNextRef.current = canGoNext;
    canGoPrevRef.current = canGoPrev;
  });

  // Next exercise action backdrop (revealed on Right side when swiping LEFT pan < 0)
  const nextOpacity = pan.interpolate({
    inputRange: [-60, -15, 0],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp',
  });

  // Prev exercise action backdrop (revealed on Left side when swiping RIGHT pan > 0)
  const prevOpacity = pan.interpolate({
    inputRange: [0, 15, 60],
    outputRange: [0, 0.5, 1],
    extrapolate: 'clamp',
  });

  const panResponder = React.useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 8 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.2;
      },
      onMoveShouldSetPanResponderCapture: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.3;
      },
      onPanResponderMove: Animated.event([null, { dx: pan }], { useNativeDriver: false }),
      onPanResponderRelease: (_, gestureState) => {
        const threshold = 25;
        const velocityThreshold = 0.2;
        const isFlickLeft = gestureState.dx < -threshold || gestureState.vx < -velocityThreshold;
        const isFlickRight = gestureState.dx > threshold || gestureState.vx > velocityThreshold;

        if (gestureState.dx < -5 && isFlickLeft && canGoNextRef.current && onGoNextRef.current) {
          // Swiping LEFT -> NEXT EXERCISE
          Animated.timing(pan, {
            toValue: -350,
            duration: 120,
            useNativeDriver: false,
          }).start(() => {
            onGoNextRef.current?.();
            pan.setValue(0);
          });
        } else if (gestureState.dx > 5 && isFlickRight && canGoPrevRef.current && onGoPrevRef.current) {
          // Swiping RIGHT -> PREVIOUS EXERCISE
          Animated.timing(pan, {
            toValue: 350,
            duration: 120,
            useNativeDriver: false,
          }).start(() => {
            onGoPrevRef.current?.();
            pan.setValue(0);
          });
        } else {
          Animated.spring(pan, {
            toValue: 0,
            useNativeDriver: false,
            bounciness: 4,
          }).start();
        }
      },
      onPanResponderTerminate: () => {
        Animated.spring(pan, {
          toValue: 0,
          useNativeDriver: false,
        }).start();
      },
    })
  ).current;

  return (
    <View style={{ flexShrink: 1, maxHeight: '100%', position: 'relative', overflow: 'hidden' }}>
      <Animated.View
        style={{ transform: [{ translateX: pan }], flexShrink: 1, maxHeight: '100%' }}
        {...panResponder.panHandlers}
      >
        {children}
      </Animated.View>
    </View>
  );
};

const CONSISTENCY_QUOTES = [
  "Consistency is what transforms average into excellence. Show up today.",
  "Success isn't always about greatness. It's about consistency. Keep going!",
  "The secret of your future is hidden in your daily routine. Rest or work, stay committed.",
  "Small daily improvements over time lead to stunning results. Trust the process.",
  "Consistency is the playground of dullness, but the foundation of mastery."
];

export default function SinglePageLandingScreen() {
  const insets = useSafeAreaInsets();
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
    weekStartDay,
    setWeekStartDay,
    incrementTemplateUsage,
    restDaysOfWeek = [],
    toggleRestDayOfWeek,
  } = useWorkout();

  const {
    overallStats,
    prs,
    achievements,
  } = useWorkoutAnalytics();

  const totalWorkoutDays = new Set(history.map(session => session.date.split('T')[0])).size;

  // Active view segment: 'log' | 'progress' | 'templates' | 'history'
  const [activeSegment, setActiveSegment] = useState<'log' | 'progress' | 'templates' | 'history'>('log');
  const [progressInitialTab, setProgressInitialTab] = useState<'overview' | 'analytics' | 'milestones' | null>(null);

  const mainScrollRef = React.useRef<ScrollView>(null);
  const modalLoggerScrollRef = React.useRef<ScrollView>(null);
  const templateLayouts = React.useRef<Record<string, number>>({});
  const templatesContainerY = React.useRef<number>(0);
  const [targetScrollTemplateId, setTargetScrollTemplateId] = useState<string | null>(null);
  const [highlightedTemplateId, setHighlightedTemplateId] = useState<string | null>(null);
  const tabOpacity = React.useRef(new Animated.Value(1)).current;

  // Profile Modal states
  const router = useRouter();
  const screenWidth = Dimensions.get('window').width;
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const profileSlideAnim = React.useRef(new Animated.Value(screenWidth)).current;
  const [userProfile, setUserProfile] = useState<OnboardingProfile | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userDisplayName, setUserDisplayName] = useState<string | null>(null);
  const { signIn: signInWithGoogle } = useGoogleSignIn();
  const [isProfileSigningIn, setIsProfileSigningIn] = useState(false);

  // Auto-restore profile and listen to Firebase auth session
  React.useEffect(() => {
    let isMounted = true;

    // 1. Immediately load local profile from AsyncStorage so name/stats are available without delay
    loadLocalProfile().then((localProfile) => {
      if (isMounted && localProfile) {
        setUserProfile(localProfile);
      }
    });

    // 2. Listen to Firebase auth state (persisted across restarts via AsyncStorage)
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!isMounted) return;
      if (currentUser) {
        setUserEmail(currentUser.email);
        setUserDisplayName(currentUser.displayName);
        await setSignedIn();
        await setOnboardingCompleted();

        try {
          const cloudProfile = await getProfileFromFirestore(currentUser.uid);
          if (cloudProfile && isMounted) {
            const p: OnboardingProfile = {
              name: cloudProfile.name || currentUser.displayName || '',
              heightCm: cloudProfile.heightCm || 0,
              weightKg: cloudProfile.weightKg || 0,
              goal: cloudProfile.goal || ('' as FitnessGoal),
              updatedAt: new Date().toISOString(),
            };
            setUserProfile(p);
            await saveLocalProfile({
              name: p.name,
              heightCm: p.heightCm,
              weightKg: p.weightKg,
              goal: p.goal,
            });
          }
        } catch (e) {
          console.log('Error fetching profile from firestore on auth change', e);
        }
      } else {
        setUserEmail(null);
        setUserDisplayName(null);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Profile Editing states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editHeight, setEditHeight] = useState('');
  const [editWeight, setEditWeight] = useState('');
  const [editGoal, setEditGoal] = useState<FitnessGoal>('' as FitnessGoal);

  const handleCloseProfile = (callback?: () => void) => {
    Animated.timing(profileSlideAnim, {
      toValue: screenWidth,
      duration: 180,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      setProfileModalVisible(false);
      setIsEditingProfile(false);
      if (callback) callback();
    });
  };

  const getInitials = (name: string | null, email: string | null): string => {
    if (name) {
      const parts = name.split(' ').filter(Boolean);
      if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      return name.slice(0, 2).toUpperCase();
    }
    if (email) return email[0].toUpperCase();
    return 'G';
  };

  const handleOpenProfile = async () => {
    try {
      setIsEditingProfile(false); // Reset editing state
      let p = await loadLocalProfile();
      
      const currentUser = auth.currentUser;
      if (currentUser) {
        setUserEmail(currentUser.email);
        setUserDisplayName(currentUser.displayName);
        
        // Fetch latest profile from Firestore for signed in users
        const cloudProfile = await getProfileFromFirestore(currentUser.uid);
        if (cloudProfile) {
          p = {
            name: cloudProfile.name || p?.name || '',
            heightCm: cloudProfile.heightCm || p?.heightCm || 0,
            weightKg: cloudProfile.weightKg || p?.weightKg || 0,
            goal: cloudProfile.goal || p?.goal || ('' as FitnessGoal),
            updatedAt: new Date().toISOString(),
          };
          // Save locally so it stays in sync
          await saveLocalProfile({
            name: p.name,
            heightCm: p.heightCm,
            weightKg: p.weightKg,
            goal: p.goal,
          });
        }
      }
      
      if (p) {
        setUserProfile(p);
      }
      profileSlideAnim.setValue(screenWidth);
      setProfileModalVisible(true);
      Animated.timing(profileSlideAnim, {
        toValue: 0,
        duration: 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } catch (e) {
      console.log('Error opening profile', e);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      try {
        await signOutFromGoogle();
      } catch (googleSignOutError) {
        console.error('Error signing out from Google', googleSignOutError);
      }
      await setSignedOut();
      setUserEmail(null);
      setUserDisplayName(null);
      handleCloseProfile();
    } catch (e) {
      console.log('Error signing out', e);
    }
  };

  const handleProfileSignIn = async () => {
    try {
      setIsProfileSigningIn(true);
      const user = await signInWithGoogle();
      if (!user) {
        return;
      }

      await setSignedIn();
      await setOnboardingCompleted();
      setUserEmail(user.email);
      setUserDisplayName(user.displayName);

      const cloudProfile = await getProfileFromFirestore(user.uid);
      if (cloudProfile) {
        const p: OnboardingProfile = {
          name: cloudProfile.name || user.displayName || '',
          heightCm: cloudProfile.heightCm || 0,
          weightKg: cloudProfile.weightKg || 0,
          goal: cloudProfile.goal || ('' as FitnessGoal),
          updatedAt: new Date().toISOString(),
        };
        setUserProfile(p);
        await saveLocalProfile({
          name: p.name,
          heightCm: p.heightCm,
          weightKg: p.weightKg,
          goal: p.goal,
        });
      } else {
        const currentP = await loadLocalProfile();
        if (currentP) {
          await saveProfileToFirestore(user.uid, {
            name: currentP.name || user.displayName || '',
            heightCm: currentP.heightCm,
            weightKg: currentP.weightKg,
            goal: currentP.goal,
          });
        }
      }
    } catch (e: any) {
      console.log('Error during profile sign in', e);
      Alert.alert('Sign-In Failed', e?.message || 'Could not complete Google sign-in.');
    } finally {
      setIsProfileSigningIn(false);
    }
  };

  const handleStartEditProfile = () => {
    if (userProfile) {
      setEditName(userProfile.name);
      setEditHeight(userProfile.heightCm ? String(Math.round(userProfile.heightCm)) : '');
      setEditWeight(userProfile.weightKg ? String(Math.round(userProfile.weightKg)) : '');
      setEditGoal(userProfile.goal);
    } else {
      setEditName('');
      setEditHeight('');
      setEditWeight('');
      setEditGoal('' as FitnessGoal);
    }
    setIsEditingProfile(true);
  };

  const handleCancelEditProfile = () => {
    setIsEditingProfile(false);
  };

  const handleSaveProfile = async () => {
    try {
      const parsedHeight = Number(editHeight);
      const parsedWeight = Number(editWeight);
      
      const nameVal = editName.trim();
      const heightVal = Number.isFinite(parsedHeight) ? parsedHeight : 0;
      const weightVal = Number.isFinite(parsedWeight) ? parsedWeight : 0;
      const goalVal = editGoal;
      
      const updatedProfile: OnboardingProfile = {
        name: nameVal,
        heightCm: heightVal,
        weightKg: weightVal,
        goal: goalVal,
        updatedAt: new Date().toISOString(),
      };
      
      // Save locally
      await saveLocalProfile({
        name: nameVal,
        heightCm: heightVal,
        weightKg: weightVal,
        goal: goalVal,
      });
      
      // Sync to Firestore if signed in
      const currentUser = auth.currentUser;
      if (currentUser) {
        await saveProfileToFirestore(currentUser.uid, {
          name: nameVal,
          heightCm: heightVal,
          weightKg: weightVal,
          goal: goalVal,
        });
      }
      
      setUserProfile(updatedProfile);
      setIsEditingProfile(false);
    } catch (e) {
      console.log('Error saving profile', e);
      showCustomAlert('Save Profile', 'Failed to save profile. Please check your inputs.', [{ text: 'OK' }]);
    }
  };

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
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedTemplateExerciseIds, setSelectedTemplateExerciseIds] = useState<Set<string>>(new Set());
  const [templateLogSelectVisible, setTemplateLogSelectVisible] = useState(false);
  const [templateLogSelectedIds, setTemplateLogSelectedIds] = useState<Set<string>>(new Set());
  const [selectedPickerExerciseIds, setSelectedPickerExerciseIds] = useState<Set<string>>(new Set());
  const [loggingMode, setLoggingMode] = useState<'post_workout' | 'live'>('post_workout');
  const [workflowModalVisible, setWorkflowModalVisible] = useState(false);

  const [sortedExerciseList, setSortedExerciseList] = useState<Exercise[]>([]);
  const [customShoulderIds, setCustomShoulderIds] = useState<Set<string>>(new Set());

  // Expanded exercise state (active logger)
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null);
  const [activeSets, setActiveSets] = useState<WorkoutSet[]>([]);

  const [sameForAll, setSameForAll] = useState(true);

  const [activeSessionExercises, setActiveSessionExercises] = useState<LoggedExercise[]>([]);
  const [sessionStartTime, setSessionStartTime] = useState<number>(0);


  const [sessionInitialLoaded, setSessionInitialLoaded] = useState(false);
  const [editSessionExerciseModalVisible, setEditSessionExerciseModalVisible] = useState(false);
  const [cameFromEditModal, setCameFromEditModal] = useState(false);
  const [cameFromActiveSessionPlus, setCameFromActiveSessionPlus] = useState(false);
  const [sessionStartedFromTemplate, setSessionStartedFromTemplate] = useState(false);
  const [sessionTemplateId, setSessionTemplateId] = useState<string | null>(null);
  const [replacingActiveId, setReplacingActiveId] = useState<string | null>(null);
  const [editingActiveExerciseId, setEditingActiveExerciseId] = useState<string | null>(null);
  const [editingTemplateExerciseId, setEditingTemplateExerciseId] = useState<string | null>(null);
  const [editingModalExerciseId, setEditingModalExerciseId] = useState<string | null>(null);
  const [inPlaceLoggingContext, setInPlaceLoggingContext] = useState<{
    source: 'workout_list' | 'template_list' | 'active_session';
    returnModalMuscle?: MuscleGroup | null;
    returnSubGroup?: 'Abs' | 'Shoulders' | null;
    templateExerciseId?: string;
    temporaryActiveId?: string;
    temporaryExerciseId?: string;
    wasAlreadyInActiveSession?: boolean;
  } | null>(null);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [mainScrollEnabled, setMainScrollEnabled] = useState(true);

  const [cameFromReplaceTarget, setCameFromReplaceTarget] = useState<{
    activeId: string;
    currentExerciseId: string;
    name: string;
  } | null>(null);
  const [customReplacements, setCustomReplacements] = useState<Record<string, string[]>>({});
  const [replacementFrequencies, setReplacementFrequencies] = useState<Record<string, Record<string, number>>>({});

  const [hasSeenModeExplanation, setHasSeenModeExplanation] = useState(false);

  const handleSetLoggingMode = async (mode: 'post_workout' | 'live') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!hasSeenModeExplanation) {
      setWorkflowModalVisible(true);
      setHasSeenModeExplanation(true);
      await AsyncStorage.setItem('@has_seen_mode_explanation', 'true');
    }
    setLoggingMode(mode);
    await AsyncStorage.setItem('@workout_logging_mode', mode);
  };

  React.useEffect(() => {
    AsyncStorage.getItem('@workout_logging_mode').then((saved) => {
      if (saved === 'live' || saved === 'post_workout') {
        setLoggingMode(saved);
      }
    });

    AsyncStorage.getItem('@has_seen_mode_explanation').then((seen) => {
      if (seen === 'true') {
        setHasSeenModeExplanation(true);
      }
    });

    AsyncStorage.getItem('@custom_replacement_map').then((data) => {
      if (data) {
        try {
          setCustomReplacements(JSON.parse(data));
        } catch (e) {
          // ignore parse error
        }
      }
    });

    AsyncStorage.getItem('@exercise_replacement_frequency').then((data) => {
      if (data) {
        try {
          setReplacementFrequencies(JSON.parse(data));
        } catch (e) {
          // ignore parse error
        }
      }
    });
  }, []);

  React.useEffect(() => {
    if (!replacingActiveId && !editingActiveExerciseId) {
      setMainScrollEnabled(true);
    }
  }, [replacingActiveId, editingActiveExerciseId]);

  // Consistency Modal state
  const [consistencyModalVisible, setConsistencyModalVisible] = useState(false);
  const [currentQuote, setCurrentQuote] = useState('');

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
  const restTimerTargetEndRef = React.useRef<number | null>(null);
  const notificationIdRef = React.useRef<string | null>(null);
  const soundObjectRef = React.useRef<any>(null);

  const ensureNotificationPermission = async () => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      if (existingStatus !== 'granted') {
        await Notifications.requestPermissionsAsync();
      }
    } catch (err) {
      console.warn('Expo Notifications permission request error:', err);
    }

    try {
      await notifee.requestPermission();
    } catch (e) {}
  };

  const updateOngoingNotification = async (sec: number, targetEndMs?: number | null) => {
    // Disabled ongoing live notification per user preference so status bar stays clean while timer is running
  };

  const dismissOngoingNotification = async () => {
    try {
      await notifee.cancelNotification('rest-timer-active-ongoing');
    } catch (err) {}
    try {
      await Notifications.dismissNotificationAsync('rest-timer-active-ongoing');
    } catch (err) {}
  };

  const cancelRestTimerNotification = async () => {
    try {
      await notifee.cancelNotification('workout-alarm-trigger');
    } catch (e) {}
    try {
      await notifee.cancelTriggerNotification('workout-alarm-trigger');
    } catch (e) {}
    try {
      const storedId = notificationIdRef.current || (await AsyncStorage.getItem('@workout_scheduled_notification_id'));
      if (storedId) {
        await Notifications.cancelScheduledNotificationAsync(storedId).catch(() => {});
        notificationIdRef.current = null;
        await AsyncStorage.removeItem('@workout_scheduled_notification_id').catch(() => {});
      }
    } catch (e) {}
  };

  const scheduleRestTimerNotification = async (seconds: number, targetEndMs?: number | null): Promise<boolean> => {
    if (seconds <= 0) return false;
    await cancelRestTimerNotification();
    const triggerTime = targetEndMs || (Date.now() + seconds * 1000);

    try {
      const trigger: TimestampTrigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: triggerTime,
        alarmManager: {
          allowWhileIdle: true,
        },
      };

      const scheduledId = await notifee.createTriggerNotification(
        {
          id: 'workout-alarm-trigger',
          title: "Time's up! ⏱️",
          body: "Rest period over. Time to start your next set!",
          android: {
            channelId: 'workout-alarm-v11',
            smallIcon: 'notification_icon',
            color: '#10B981',
            importance: AndroidImportance.HIGH,
            sound: 'default',
            vibrationPattern: [100, 500, 250, 500],
            ongoing: true,
            autoCancel: false,
            pressAction: { id: 'default' },
            actions: [
              {
                title: '+ 30s',
                pressAction: { id: 'add-30s' },
              },
              {
                title: 'DISMISS',
                pressAction: { id: 'stop-alarm' },
              },
            ],
          },
        },
        trigger
      );
      notificationIdRef.current = scheduledId;
      await AsyncStorage.setItem('@workout_scheduled_notification_id', scheduledId);
      return true;
    } catch (err) {
      console.warn('Notifee alarm registration error:', err);
      return false;
    }
  };

  const playTimerSound = async () => {};
  const stopTimerSound = async () => {};

  const formatRestTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };



  const handleTimerFinished = async () => {
    if (restTimerRef.current) clearInterval(restTimerRef.current);
    restTimerRef.current = null;
    restTimerTargetEndRef.current = null;
    setRestTimerRunning(false);
    setRestTimerSeconds(0);
    dismissOngoingNotification();
    await AsyncStorage.removeItem('@workout_rest_timer_target_end').catch(() => {});
    await AsyncStorage.removeItem('@workout_rest_timer_duration').catch(() => {});

    const isMinimized = AppState.currentState !== 'active';

    if (!isMinimized) {
      cancelRestTimerNotification();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showCustomAlert(
        'Rest Finished',
        'Time to start your next set!',
        [
          {
            text: '+ 30s',
            color: '#38BDF8',
            bgColor: isDarkMode ? 'rgba(56, 189, 248, 0.15)' : '#E0F2FE',
            onPress: () => {
              startRestTimer(30);
            },
          },
          {
            text: 'READY',
            color: '#10B981',
            bgColor: isDarkMode ? 'rgba(16, 185, 129, 0.15)' : '#DCFCE7',
            onPress: () => {},
          },
        ],
        <Timer size={28} color="#10B981" />
      );
    }
  };

  const startRestTimer = async (seconds: number) => {
    ensureNotificationPermission().catch(() => {});
    stopTimerSound();
    dismissOngoingNotification();
    await cancelRestTimerNotification();
    if (restTimerRef.current) clearInterval(restTimerRef.current);
    
    const targetEnd = Date.now() + seconds * 1000;
    restTimerTargetEndRef.current = targetEnd;
    setRestTimerDuration(seconds);
    setRestTimerSeconds(seconds);
    setRestTimerRunning(true);
    await AsyncStorage.setItem('@workout_rest_timer_target_end', String(targetEnd)).catch(() => {});
    await AsyncStorage.setItem('@workout_rest_timer_duration', String(seconds)).catch(() => {});
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const isScheduled = await scheduleRestTimerNotification(seconds, targetEnd);
    if (!isScheduled) {
      console.warn('Failed to schedule native background alarm');
    }

    restTimerRef.current = setInterval(() => {
      if (!restTimerTargetEndRef.current) return;
      const remainingMs = restTimerTargetEndRef.current - Date.now();
      const remainingSec = Math.max(0, Math.ceil(remainingMs / 1000));
      setRestTimerSeconds(remainingSec);
      if (remainingSec <= 0) {
        handleTimerFinished();
      }
    }, 1000);
  };

  const stopRestTimer = () => {
    stopTimerSound();
    dismissOngoingNotification();
    cancelRestTimerNotification();
    if (restTimerRef.current) clearInterval(restTimerRef.current);
    restTimerRef.current = null;
    restTimerTargetEndRef.current = null;
    setRestTimerRunning(false);
    setRestTimerSeconds(0);
    AsyncStorage.removeItem('@workout_rest_timer_target_end').catch(() => {});
    AsyncStorage.removeItem('@workout_rest_timer_duration').catch(() => {});
  };

  const resetRestTimer = () => {
    stopTimerSound();
    dismissOngoingNotification();
    cancelRestTimerNotification();
    if (restTimerRef.current) clearInterval(restTimerRef.current);
    restTimerRef.current = null;
    restTimerTargetEndRef.current = null;
    setRestTimerRunning(false);
    setRestTimerSeconds(0);
    AsyncStorage.removeItem('@workout_rest_timer_target_end').catch(() => {});
    AsyncStorage.removeItem('@workout_rest_timer_duration').catch(() => {});
  };

  const syncRestTimerFromStorage = async () => {
    try {
      const storedEnd = await AsyncStorage.getItem('@workout_rest_timer_target_end');
      if (storedEnd) {
        const targetEnd = parseInt(storedEnd, 10);
        const now = Date.now();
        if (targetEnd > now) {
          const remainingSec = Math.max(1, Math.ceil((targetEnd - now) / 1000));
          const storedDur = await AsyncStorage.getItem('@workout_rest_timer_duration');
          const duration = storedDur ? parseInt(storedDur, 10) : 30;

          restTimerTargetEndRef.current = targetEnd;
          setRestTimerDuration(duration);
          setRestTimerSeconds(remainingSec);
          setRestTimerRunning(true);

          if (restTimerRef.current) clearInterval(restTimerRef.current);
          restTimerRef.current = setInterval(() => {
            if (!restTimerTargetEndRef.current) return;
            const remMs = restTimerTargetEndRef.current - Date.now();
            const remSec = Math.max(0, Math.ceil(remMs / 1000));
            setRestTimerSeconds(remSec);
            if (remSec <= 0) {
              handleTimerFinished();
            }
          }, 1000);
          return;
        } else {
          await AsyncStorage.removeItem('@workout_rest_timer_target_end').catch(() => {});
          await AsyncStorage.removeItem('@workout_rest_timer_duration').catch(() => {});
          if (restTimerRunning || restTimerTargetEndRef.current) {
            handleTimerFinished();
          }
        }
      } else if (restTimerTargetEndRef.current) {
        const now = Date.now();
        if (restTimerTargetEndRef.current > now) {
          const remainingSec = Math.max(1, Math.ceil((restTimerTargetEndRef.current - now) / 1000));
          setRestTimerSeconds(remainingSec);
          if (!restTimerRef.current) {
            restTimerRef.current = setInterval(() => {
              if (!restTimerTargetEndRef.current) return;
              const remMs = restTimerTargetEndRef.current - Date.now();
              const remSec = Math.max(0, Math.ceil(remMs / 1000));
              setRestTimerSeconds(remSec);
              if (remSec <= 0) {
                handleTimerFinished();
              }
            }, 1000);
          }
        } else {
          handleTimerFinished();
        }
      }
    } catch (e) {}
  };

  React.useEffect(() => {
    async function configureNotifications() {
      try {
        if (Platform.OS === 'android') {
          try {
            await notifee.createChannel({
              id: 'workout-alarm-v11',
              name: 'Workout Alarm',
              importance: AndroidImportance.HIGH,
              sound: 'default',
              vibration: true,
              vibrationPattern: [100, 500, 250, 500],
              bypassDnd: true,
              visibility: AndroidVisibility.PUBLIC,
            });

            await notifee.createChannel({
              id: 'rest-timer-ongoing-v11',
              name: 'Rest Timer Live Countdown',
              importance: AndroidImportance.LOW,
              sound: undefined,
              vibration: false,
              visibility: AndroidVisibility.PUBLIC,
            });
          } catch (e) {}

          try {
            await Notifications.setNotificationChannelAsync('workout-alarm-v11', {
              name: 'Workout Alarm',
              importance: Notifications.AndroidImportance.MAX,
              vibrationPattern: [100, 500, 250, 500],
              lightColor: '#10B981',
              sound: 'default',
              enableVibrate: true,
              bypassDnd: true,
              lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
            });

            await Notifications.setNotificationChannelAsync('rest-timer-ongoing-v11', {
              name: 'Rest Timer Live Countdown',
              importance: Notifications.AndroidImportance.LOW,
              sound: undefined,
              vibrationPattern: undefined,
            });
          } catch (e) {}
        }
      } catch (e) {
        console.warn('Notification setup error:', e);
      }
    }
    configureNotifications();

    const unsubscribeForeground = notifee.onForegroundEvent(({ type, detail }) => {
      if (type === EventType.ACTION_PRESS) {
        if (detail.pressAction?.id === 'stop-alarm') {
          stopRestTimer();
        } else if (detail.pressAction?.id === 'add-30s') {
          startRestTimer(30);
        }
      } else if (type === EventType.PRESS) {
        syncRestTimerFromStorage();
      }
    });

    return () => unsubscribeForeground();
  }, []);

  React.useEffect(() => {
    syncRestTimerFromStorage();
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        syncRestTimerFromStorage();
      }
    });
    return () => subscription.remove();
  }, []);

  const loggerScrollViewRef = React.useRef<ScrollView | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  React.useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Weekly calendar state
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const getWeekDates = (offset: number, firstDay: number = weekStartDay) => {
    const now = new Date();
    now.setDate(now.getDate() + offset * 7);
    const dayOfWeek = now.getDay();
    const diff = (dayOfWeek - firstDay + 7) % 7;
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - diff);
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      week.push(d);
    }
    return week;
  };

  const renderWeekRow = (offset: number) => {
    const dates = getWeekDates(offset);
    const todayLocal = new Date();
    const todayLocalStr = `${todayLocal.getFullYear()}-${String(todayLocal.getMonth() + 1).padStart(2, '0')}-${String(todayLocal.getDate()).padStart(2, '0')}`;

    return (
      <View style={styles.weekDaysRow}>
        {dates.map((date, i) => {
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
                  paddingVertical: 6,
                },
              ]}
              onPress={isFuture ? undefined : () => setSelectedDay(isSelected ? null : dateStr)}
              activeOpacity={isFuture ? 1 : 0.7}
            >
              <Text
                style={[
                  styles.weekDayNum,
                  { color: isSelected ? '#FFFFFF' : theme.textPrimary, fontSize: 13, fontWeight: '700' },
                ]}
              >
                {date.getDate()}
              </Text>
              {hasWorkout && !isSelected && (
                <View style={[styles.weekDayDot, { marginTop: 1 }]} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    );
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
  const [customAlertButtons, setCustomAlertButtons] = useState<{ text: string; style?: 'cancel' | 'destructive' | 'default'; color?: string; bgColor?: string; onPress?: () => void }[]>([]);
  const [customAlertIcon, setCustomAlertIcon] = useState<React.ReactNode | null>(null);

  // Custom Workout Delete Confirmation Dialog State
  const [exerciseToDelete, setExerciseToDelete] = useState<{ id: string; name: string } | null>(null);

  const showCustomAlert = (
    title: string,
    message: string,
    buttons: { text: string; style?: 'cancel' | 'destructive' | 'default'; color?: string; bgColor?: string; onPress?: () => void }[] = [{ text: 'OK' }],
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
      if (workflowModalVisible) {
        setWorkflowModalVisible(false);
        return true;
      }
      if (exerciseToDelete !== null) {
        setExerciseToDelete(null);
        return true;
      }
      if (editingTemplateExerciseId !== null) {
        setEditingTemplateExerciseId(null);
        return true;
      }
      if (editingModalExerciseId !== null) {
        setEditingModalExerciseId(null);
        return true;
      }
      if (editingActiveExerciseId !== null) {
        handleCancelInPlaceLogger();
        return true;
      }
      if (replacingActiveId !== null) {
        setReplacingActiveId(null);
        setMainScrollEnabled(true);
        return true;
      }
      if (templateListVisible) {
        setTemplateListVisible(false);
        setFromTemplateList(false);
        setTemplateListExercises([]);
        setActiveTemplateId(null);
        setIsDeleteMode(false);
        setEditingTemplateExerciseId(null);
        return true;
      }
      return false;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', handleBackButton);
    return () => subscription.remove();
  }, [templateListVisible, editingActiveExerciseId, editingTemplateExerciseId, editingModalExerciseId, replacingActiveId, workflowModalVisible]);

  React.useEffect(() => {
    return () => {
      if (restTimerRef.current) clearInterval(restTimerRef.current);
      stopTimerSound();
    };
  }, []);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [activeVal, startVal, templateStartedVal, templateIdVal, shoulderVal] = await Promise.all([
          AsyncStorage.getItem('@active_session_exercises'),
          AsyncStorage.getItem('@session_start_time'),
          AsyncStorage.getItem('@session_started_from_template'),
          AsyncStorage.getItem('@session_template_id'),
          AsyncStorage.getItem('@custom_shoulder_ids'),
        ]);

        if (!mounted) return;

        if (activeVal !== null) {
          setActiveSessionExercises(JSON.parse(activeVal));
        }
        if (startVal !== null) {
          setSessionStartTime(Number(startVal));
        }
        if (templateStartedVal === 'true') {
          setSessionStartedFromTemplate(true);
        }
        if (templateIdVal !== null) {
          setSessionTemplateId(templateIdVal);
        }
        if (shoulderVal !== null) {
          setCustomShoulderIds(new Set(JSON.parse(shoulderVal)));
        }
      } finally {
        if (mounted) {
          setSessionInitialLoaded(true);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  React.useEffect(() => {
    if (!targetScrollTemplateId) {
      mainScrollRef.current?.scrollTo({ y: 0, animated: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSegment]);

  React.useEffect(() => {
    if (activeSegment === 'templates' && targetScrollTemplateId) {
      const timer = setTimeout(() => {
        const cardY = templateLayouts.current[targetScrollTemplateId];
        if (cardY !== undefined) {
          const absoluteY = templatesContainerY.current + cardY - 20;
          mainScrollRef.current?.scrollTo({ y: absoluteY, animated: false });
        }
        setTargetScrollTemplateId(null);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [activeSegment, targetScrollTemplateId]);

  React.useEffect(() => {
    if (highlightedTemplateId) {
      const timer = setTimeout(() => {
        setHighlightedTemplateId(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [highlightedTemplateId]);

  const isFirstTabRender = React.useRef(true);
  React.useEffect(() => {
    if (isFirstTabRender.current) {
      isFirstTabRender.current = false;
      return;
    }
    tabOpacity.setValue(0);
    Animated.timing(tabOpacity, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSegment]);

  const handleShowWorkoutDaysInfo = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    showCustomAlert(
      "Workout Days",
      `This is the total number of unique days you have logged a workout.\n\nYou have worked out for ${totalWorkoutDays} day${totalWorkoutDays === 1 ? '' : 's'} total!`,
      [{ text: "OK" }],
      <Trophy size={28} color="#FACC15" fill="#FACC15" />
    );
  };

  const handleOpenConsistency = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const rand = CONSISTENCY_QUOTES[Math.floor(Math.random() * CONSISTENCY_QUOTES.length)];
    setCurrentQuote(rand);
    setConsistencyModalVisible(true);
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
    const all = extras ? [...exercises, ...extras] : exercises;
    let filtered = all;
    if (muscle === 'Back & Shoulders' || muscle === 'Abs & Shoulders') {
      filtered = all.filter((ex) => ex.muscleGroup === 'Back' || ex.muscleGroup === 'Shoulders');
    } else {
      filtered = all.filter((ex) => ex.muscleGroup === muscle);
    }
    if (excludeIds) {
      filtered = filtered.filter((ex) => !excludeIds.has(ex.id));
    }
    const getFavoriteIndex = (exercise: Exercise) => {
      const idx = favoriteOrder.indexOf(exercise.id);
      if (idx !== -1) return idx;

      const defaultIdx = DEFAULT_EXERCISES.findIndex((e) => e.id === exercise.id);
      if (defaultIdx !== -1) {
        return -1000 + defaultIdx;
      }
      return 999999;
    };

    return [...filtered].sort((a, b) => {
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
    const targetMuscle = (muscle === 'Back & Shoulders' || muscle === 'Abs & Shoulders') ? 'Shoulders' : muscle;
    setSelectedModalMuscle(targetMuscle);
    setSelectedSubGroup(null);
    setSearch('');
    setExpandedExerciseId(null);
    setActiveSets([]);
    setSameForAll(true);
    setSortedExerciseList(sortExercisesForMuscle(targetMuscle));
  };

  const getReplacementOptionsForExercise = (currentExerciseId: string, muscleGroup: MuscleGroup) => {
    const activeExIds = new Set(
      activeSessionExercises
        .filter((le) => (le.id ? le.id !== replacingActiveId : le.exerciseId !== currentExerciseId))
        .map((le) => le.exerciseId)
    );

    const userCustomIds = customReplacements[currentExerciseId] || [];
    const patternGroup = getMovementPatternGroup(currentExerciseId, muscleGroup, exercises);

    // Candidates from the curated pattern group, excluding current and active exercises
    const validPatternExs = patternGroup.filter(
      (ex) => ex.id !== currentExerciseId && !activeExIds.has(ex.id)
    );

    // User replacement frequency map for this movement
    const freqMap = replacementFrequencies[currentExerciseId] || {};

    // ANCHOR & ADAPT ARCHITECTURE:
    // Slot 1-3: Fixed Anchors (Top staples remain fixed to protect muscle memory)
    const anchorSlots = validPatternExs.slice(0, 3);
    const chosenIds = new Set(anchorSlots.map((e) => e.id));

    // Adaptive Slots:
    // 1. User explicitly added exercises via "+ More" picker
    const customExs = userCustomIds
      .map((id) => exercises.find((e) => e.id === id))
      .filter((e): e is Exercise => e !== undefined && !activeExIds.has(e.id) && e.id !== currentExerciseId && !chosenIds.has(e.id))
      .map((e) => ({ ...e, isUserAdded: true, isFrequent: false }));

    customExs.forEach((e) => chosenIds.add(e.id));

    // 2. Repeated user habits (used at least 2 times for this exercise), sorted stably by frequency
    const frequentReplacements = Object.entries(freqMap)
      .filter(([exId, count]) => count >= 2 && !chosenIds.has(exId) && !activeExIds.has(exId) && exId !== currentExerciseId)
      .sort((a, b) => b[1] - a[1])
      .map(([exId]) => exercises.find((e) => e.id === exId))
      .filter((e): e is Exercise => e !== undefined)
      .map((e) => ({ ...e, isUserAdded: false, isFrequent: true }));

    frequentReplacements.forEach((e) => chosenIds.add(e.id));

    // 3. Remaining staples from the movement pattern group
    const remainingStaples = validPatternExs
      .filter((e) => !chosenIds.has(e.id))
      .map((e) => ({ ...e, isUserAdded: false, isFrequent: false }));

    remainingStaples.forEach((e) => chosenIds.add(e.id));

    // Combine in stable order
    const finalOptions = [
      ...anchorSlots.map((e) => ({
        ...e,
        isUserAdded: userCustomIds.includes(e.id),
        isFrequent: (freqMap[e.id] || 0) >= 2,
      })),
      ...customExs,
      ...frequentReplacements,
      ...remainingStaples,
    ];

    if (finalOptions.length >= 6) {
      return finalOptions.slice(0, 6);
    }

    // Fallback: fill with same muscle group if fewer than 6
    const sameMuscle = exercises.filter(
      (ex) =>
        ex.muscleGroup === muscleGroup &&
        ex.id !== currentExerciseId &&
        !activeExIds.has(ex.id) &&
        !chosenIds.has(ex.id)
    ).map((e) => ({ ...e, isUserAdded: false, isFrequent: false }));

    return [...finalOptions, ...sameMuscle].slice(0, 6);
  };

  const handleReplaceExercise = (activeId: string, currentExerciseId: string, newExerciseId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const updated = activeSessionExercises.map((le) => {
      const isTarget = activeId ? (le.id ? le.id === activeId : le.exerciseId === currentExerciseId) : le.exerciseId === currentExerciseId;
      if (isTarget) {
        return {
          ...le,
          exerciseId: newExerciseId,
        };
      }
      return le;
    });

    setActiveSessionExercises(updated);
    AsyncStorage.setItem('@active_session_exercises', JSON.stringify(updated));

    // Record replacement habit frequency
    setReplacementFrequencies((prev) => {
      const currentMap = prev[currentExerciseId] || {};
      const newCount = (currentMap[newExerciseId] || 0) + 1;
      const updatedFreq = {
        ...prev,
        [currentExerciseId]: {
          ...currentMap,
          [newExerciseId]: newCount,
        },
      };
      AsyncStorage.setItem('@exercise_replacement_frequency', JSON.stringify(updatedFreq)).catch(() => {});
      return updatedFreq;
    });

    setReplacingActiveId(null);
    setMainScrollEnabled(true);
  };

  const handleOpenReplaceLibrary = (activeId: string, currentExercise: { id: string; name: string; muscleGroup: MuscleGroup }) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCameFromReplaceTarget({
      activeId,
      currentExerciseId: currentExercise.id,
      name: currentExercise.name,
    });
    handleSelectMuscleCard(currentExercise.muscleGroup);
  };

  const handleAddReplacementFromPicker = (newExerciseId: string) => {
    if (!cameFromReplaceTarget) return;
    const { currentExerciseId } = cameFromReplaceTarget;

    // Do NOT alter the active session / template list.
    // Only add to the movement group's replacement options:
    const familyIds = getMovementFamilyIds(currentExerciseId);

    setCustomReplacements((prev) => {
      const updatedMap = { ...prev };
      familyIds.forEach((famId) => {
        const existing = updatedMap[famId] || [];
        if (!existing.includes(newExerciseId) && famId !== newExerciseId) {
          updatedMap[famId] = [newExerciseId, ...existing];
        }
      });
      if (!updatedMap[currentExerciseId]?.includes(newExerciseId)) {
        updatedMap[currentExerciseId] = [newExerciseId, ...(updatedMap[currentExerciseId] || [])];
      }
      AsyncStorage.setItem('@custom_replacement_map', JSON.stringify(updatedMap));
      return updatedMap;
    });

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCameFromReplaceTarget(null);
    setSelectedModalMuscle(null);
    setSelectedSubGroup(null);
  };

  const getMostFrequentMuscleGroup = (loggedExercises: LoggedExercise[]): MuscleGroup => {
    if (!loggedExercises || loggedExercises.length === 0) {
      return 'Chest';
    }

    const counts: Record<string, number> = {};
    for (const logEx of loggedExercises) {
      const ex = exercises.find((e) => e.id === logEx.exerciseId);
      if (ex && ex.muscleGroup) {
        let muscle = ex.muscleGroup;
        if (muscle === 'Abs' || muscle === 'Shoulders') {
          muscle = 'Abs & Shoulders';
        }
        counts[muscle] = (counts[muscle] || 0) + 1;
      }
    }

    let maxMuscle: MuscleGroup = 'Chest';
    let maxCount = 0;
    for (const m of Object.keys(counts)) {
      if (counts[m] > maxCount) {
        maxCount = counts[m];
        maxMuscle = m as MuscleGroup;
      }
    }
    return maxMuscle;
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
            isCompleted: set.isCompleted,
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
        }

        while (initialSets.length < 3) {
          const lastSet = initialSets.length > 0 ? initialSets[initialSets.length - 1] : null;
          initialSets.push({
            id: generateId(),
            weight: lastSet ? lastSet.weight : 0,
            reps: lastSet ? lastSet.reps : 0,
            isCompleted: false,
          });
        }
      }

      setActiveSets(initialSets);
    }
  };

  const handleOpenInPlaceEdit = (loggedExId: string, exerciseId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setReplacingActiveId(null);

    const targetLoggedEx = activeSessionExercises.find(
      (le) => (le.id ? le.id === loggedExId : le.exerciseId === exerciseId)
    );

    const initialSets: WorkoutSet[] = [];
    if (targetLoggedEx && targetLoggedEx.sets.length > 0) {
      targetLoggedEx.sets.forEach((set) => {
        initialSets.push({
          id: set.id,
          weight: set.weight,
          reps: set.reps,
          isCompleted: set.isCompleted,
        });
      });
      setExerciseNote(targetLoggedEx.notes || '');
      setShowNoteInput(!!targetLoggedEx.notes);
    } else {
      setExerciseNote('');
      setShowNoteInput(false);
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
      }

      while (initialSets.length < 3) {
        const lastSet = initialSets.length > 0 ? initialSets[initialSets.length - 1] : null;
        initialSets.push({
          id: generateId(),
          weight: lastSet ? lastSet.weight : 0,
          reps: lastSet ? lastSet.reps : 0,
          isCompleted: false,
        });
      }
    }

    setActiveSets(initialSets);
    setSameForAll(true);
    setEditingActiveExerciseId(loggedExId || exerciseId);
  };

  const handleNavigateInPlace = (direction: 'prev' | 'next') => {
    if (activeSessionExercises.length <= 1) return;
    const curIdx = activeSessionExercises.findIndex(
      (le) => (le.id ? le.id === editingActiveExerciseId : le.exerciseId === editingActiveExerciseId)
    );
    if (curIdx === -1) return;

    if (activeSets.length > 0 && activeSets.some((s) => s.reps > 0)) {
      const updated = activeSessionExercises.map((le, idx) =>
        idx === curIdx
          ? {
              ...le,
              sets: activeSets.map((s) => ({ ...s, isCompleted: true })),
              notes: exerciseNote.trim() || undefined,
            }
          : le
      );
      setActiveSessionExercises(updated);
      AsyncStorage.setItem('@active_session_exercises', JSON.stringify(updated));
    }

    const nextIndex =
      direction === 'next'
        ? (curIdx + 1) % activeSessionExercises.length
        : (curIdx - 1 + activeSessionExercises.length) % activeSessionExercises.length;
    const nextItem = activeSessionExercises[nextIndex];
    if (!nextItem) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    handleOpenInPlaceEdit(nextItem.id || nextItem.exerciseId, nextItem.exerciseId);
  };

  const handleCancelInPlaceLogger = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMainScrollEnabled(true);
    setShowNoteInput(false);

    const context = inPlaceLoggingContext;
    setInPlaceLoggingContext(null);
    setEditingActiveExerciseId(null);

    if (!context || context.source === 'active_session') {
      return;
    }

    if (context.source === 'workout_list') {
      if (context.returnModalMuscle) {
        setSelectedModalMuscle(context.returnModalMuscle);
        setSelectedSubGroup(context.returnSubGroup || null);
      }
    } else if (context.source === 'template_list') {
      setTemplateListVisible(true);
    }

    if (context.temporaryActiveId && !context.wasAlreadyInActiveSession) {
      const updated = activeSessionExercises.filter(
        (le) => le.id !== context.temporaryActiveId && le.exerciseId !== context.temporaryActiveId
      );
      setActiveSessionExercises(updated);
      AsyncStorage.setItem('@active_session_exercises', JSON.stringify(updated));
      if (updated.length === 0) {
        setSessionStartTime(0);
        AsyncStorage.removeItem('@session_start_time');
      }
    }
  };

  const handleSwitchInPlaceExercise = (targetLoggedExId: string, targetExId: string) => {
    if (targetLoggedExId === editingActiveExerciseId || targetExId === editingActiveExerciseId) return;

    if (inPlaceLoggingContext?.source === 'template_list') {
      if (activeSets.length > 0 && activeSets.some((s) => s.reps > 0)) {
        const curExId = inPlaceLoggingContext.templateExerciseId;
        if (curExId) {
          setTemplateListExercises((prev) =>
            prev.map((ex) =>
              ex.exerciseId === curExId
                ? {
                    ...ex,
                    sets: activeSets.filter((s) => s.reps > 0).map((s) => ({ ...s, isCompleted: true })),
                    notes: exerciseNote.trim() || undefined,
                  }
                : ex
            )
          );
        }
      }

      const targetTmplEx = templateListExercises.find((le) => le.exerciseId === targetExId);
      if (targetTmplEx) {
        const initialSets: WorkoutSet[] =
          targetTmplEx.sets.length > 0
            ? targetTmplEx.sets.map((s) => ({
                id: s.id || generateId(),
                weight: s.weight,
                reps: s.reps,
                isCompleted: s.isCompleted ?? false,
              }))
            : [
                { id: generateId(), weight: 0, reps: 0, isCompleted: false },
                { id: generateId(), weight: 0, reps: 0, isCompleted: false },
                { id: generateId(), weight: 0, reps: 0, isCompleted: false },
              ];

        setInPlaceLoggingContext({
          source: 'template_list',
          templateExerciseId: targetExId,
        });

        setActiveSets(initialSets);
        setExerciseNote(targetTmplEx.notes || '');
        setShowNoteInput(!!targetTmplEx.notes);
        setSameForAll(true);
        setEditingActiveExerciseId(targetExId);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      return;
    }

    const curIdx = activeSessionExercises.findIndex(
      (le) => (le.id ? le.id === editingActiveExerciseId : le.exerciseId === editingActiveExerciseId)
    );
    if (curIdx !== -1 && activeSets.length > 0 && activeSets.some((s) => s.reps > 0)) {
      const updated = activeSessionExercises.map((le, idx) =>
        idx === curIdx
          ? {
              ...le,
              sets: activeSets.map((s) => ({ ...s, isCompleted: true })),
              notes: exerciseNote.trim() || undefined,
            }
          : le
      );
      setActiveSessionExercises(updated);
      AsyncStorage.setItem('@active_session_exercises', JSON.stringify(updated));
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    handleOpenInPlaceEdit(targetLoggedExId, targetExId);
  };

  const handleSaveInPlace = async (targetExId: string) => {
    const validSets = activeSets.filter((s) => s.reps > 0);

    if (validSets.length === 0) {
      await handleCancelInPlaceLogger();
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const context = inPlaceLoggingContext;

    if (context?.source === 'workout_list') {
      const setsToSave: WorkoutSet[] = validSets.map((s) => ({
        ...s,
        isCompleted: true,
      }));

      const updatedExercises = activeSessionExercises.map((le) => {
        const isTarget = le.id ? le.id === context.temporaryActiveId : le.exerciseId === targetExId;
        if (isTarget) {
          return {
            ...le,
            sets: setsToSave,
            notes: exerciseNote.trim() || undefined,
          };
        }
        return le;
      });

      setActiveSessionExercises(updatedExercises);
      AsyncStorage.setItem('@active_session_exercises', JSON.stringify(updatedExercises));

      if (context.returnModalMuscle) {
        setSelectedModalMuscle(context.returnModalMuscle);
        setSelectedSubGroup(context.returnSubGroup || null);
      }
      setEditingActiveExerciseId(null);
      setInPlaceLoggingContext(null);
      setShowNoteInput(false);
      setMainScrollEnabled(true);
      return;
    }

    if (context?.source === 'template_list') {
      const targetTemplateExId = context.templateExerciseId || targetExId;
      const setsToSave: WorkoutSet[] = validSets.map((s) => ({
        ...s,
        isCompleted: true,
      }));

      setTemplateListExercises((prev) =>
        prev.map((ex) =>
          ex.exerciseId === targetTemplateExId
            ? { ...ex, sets: setsToSave, notes: exerciseNote.trim() || undefined }
            : ex
        )
      );

      setTemplateListVisible(true);
      setEditingActiveExerciseId(null);
      setInPlaceLoggingContext(null);
      setShowNoteInput(false);
      setMainScrollEnabled(true);

      const tmplId = sessionTemplateId || activeTemplateId;
      if (tmplId) {
        const currentTmpl = templates.find((t) => t.id === tmplId);
        if (currentTmpl) {
          const updatedTmpl = currentTmpl.exercises.map((te) =>
            te.exerciseId === targetTemplateExId
              ? { ...te, sets: setsToSave, notes: exerciseNote.trim() || undefined }
              : te
          );
          updateTemplate(tmplId, updatedTmpl);
        }
      }

      if (context.temporaryActiveId && !context.wasAlreadyInActiveSession) {
        const updated = activeSessionExercises.filter(
          (le) => le.id !== context.temporaryActiveId && le.exerciseId !== targetExId
        );
        setActiveSessionExercises(updated);
        AsyncStorage.setItem('@active_session_exercises', JSON.stringify(updated));
        if (updated.length === 0) {
          setSessionStartTime(0);
          AsyncStorage.removeItem('@session_start_time');
        }
      }
      return;
    }

    setEditingActiveExerciseId(null);
    setInPlaceLoggingContext(null);
    setShowNoteInput(false);
    setMainScrollEnabled(true);

    if (loggingMode === 'live') {
      startRestTimer(restTimerDuration || 90);
    }

    const updatedExercises = activeSessionExercises.map((le) => {
      const isTarget = le.id ? le.id === editingActiveExerciseId : le.exerciseId === targetExId;
      if (isTarget) {
        return {
          ...le,
          sets: validSets.map((s) => ({ ...s, isCompleted: true })),
          notes: exerciseNote.trim() || undefined,
        };
      }
      return le;
    });

    setActiveSessionExercises(updatedExercises);
    await AsyncStorage.setItem('@active_session_exercises', JSON.stringify(updatedExercises));
  };

  const handleAddSet = (exerciseId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    let newWeight = 0;
    let newReps = 0;

    if (activeSets.length > 0) {
      const lastSet = activeSets[activeSets.length - 1];
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

  const handleRemoveLastSet = () => {
    if (activeSets.length <= 1) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveSets((prev) => prev.slice(0, prev.length - 1));
  };

  const handleSaveModalExercise = async () => {
    if (!editingModalExerciseId) return;

    const validSets = activeSets.filter((s) => s.reps > 0);
    if (validSets.length === 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showCustomAlert('Add Sets', 'Please add at least one set with repetitions before saving.', [{ text: 'OK' }]);
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const setsToSave: WorkoutSet[] = validSets.map((s) => ({
      ...s,
      isCompleted: true,
    }));

    const existingIndex = activeSessionExercises.findIndex((le) => le.exerciseId === editingModalExerciseId);
    let updatedExercises: LoggedExercise[];

    if (existingIndex !== -1) {
      updatedExercises = activeSessionExercises.map((le, idx) =>
        idx === existingIndex
          ? { ...le, sets: setsToSave, notes: exerciseNote.trim() || undefined }
          : le
      );
    } else {
      const newLog: LoggedExercise = {
        id: generateId(),
        exerciseId: editingModalExerciseId,
        sets: setsToSave,
        notes: exerciseNote.trim() || undefined,
      };
      updatedExercises = [...activeSessionExercises, newLog];
    }

    setActiveSessionExercises(updatedExercises);
    await AsyncStorage.setItem('@active_session_exercises', JSON.stringify(updatedExercises));

    if (activeSessionExercises.length === 0 && sessionStartTime === 0) {
      const now = Date.now();
      setSessionStartTime(now);
      await AsyncStorage.setItem('@session_start_time', String(now));
    }

    if (loggingMode === 'live') {
      const curIdx = updatedExercises.findIndex((le) => le.exerciseId === editingModalExerciseId);
      if (curIdx !== -1 && curIdx < updatedExercises.length - 1) {
        const nextEx = updatedExercises[curIdx + 1];
        const nextDetails = exercises.find((e) => e.id === nextEx.exerciseId);
        if (nextDetails && nextDetails.muscleGroup !== selectedModalMuscle) {
          setSelectedModalMuscle(nextDetails.muscleGroup);
        }
        const nextSets = nextEx.sets.length > 0
          ? nextEx.sets.map((s) => ({ ...s }))
          : [{ id: generateId(), setNumber: 1, weight: 0, reps: 0, isCompleted: false }];
        setActiveSets(nextSets);
        setExerciseNote(nextEx.notes || '');
        setShowNoteInput(!!nextEx.notes);
        setSameForAll(true);
        setEditingModalExerciseId(nextEx.exerciseId);
        return;
      }
      setEditingModalExerciseId(null);
      setSelectedModalMuscle(null);
      setSelectedSubGroup(null);
      setActiveSegment('log');
      return;
    }

    setEditingModalExerciseId(null);
  };

  const handleSwitchModalExercise = (targetExId: string) => {
    if (targetExId === editingModalExerciseId) return;

    let updated: LoggedExercise[] | undefined;

    // Save current exercise sets if valid
    if (editingModalExerciseId) {
      const setsToSave = activeSets.map((s) => ({
        ...s,
        isCompleted: s.weight > 0 && s.reps > 0 ? true : s.isCompleted,
      }));
      const existingIdx = activeSessionExercises.findIndex((le) => le.exerciseId === editingModalExerciseId);
      if (existingIdx !== -1) {
        updated = activeSessionExercises.map((le, idx) =>
          idx === existingIdx ? { ...le, sets: setsToSave, notes: exerciseNote.trim() || undefined } : le
        );
      } else {
        updated = [
          ...activeSessionExercises,
          { id: generateId(), exerciseId: editingModalExerciseId, sets: setsToSave, notes: exerciseNote.trim() || undefined },
        ];
      }
      setActiveSessionExercises(updated);
      AsyncStorage.setItem('@active_session_exercises', JSON.stringify(updated));
    }

    const targetDetails = exercises.find((e) => e.id === targetExId);
    if (targetDetails && targetDetails.muscleGroup !== selectedModalMuscle) {
      setSelectedModalMuscle(targetDetails.muscleGroup);
    }

    const targetList = updated || activeSessionExercises;
    const targetLog = targetList.find((le) => le.exerciseId === targetExId);
    if (targetLog) {
      const initialSets = targetLog.sets.length > 0
        ? targetLog.sets.map((s) => ({ ...s }))
        : [{ id: generateId(), setNumber: 1, weight: 0, reps: 0, isCompleted: false }];
      setActiveSets(initialSets);
      setExerciseNote(targetLog.notes || '');
      setShowNoteInput(!!targetLog.notes);
      setSameForAll(true);
      setEditingModalExerciseId(targetExId);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleFinishFromModalLogger = async () => {
    if (editingModalExerciseId) {
      const setsToSave = activeSets.map((s) => ({
        ...s,
        isCompleted: s.weight > 0 && s.reps > 0 ? true : s.isCompleted,
      }));
      const existingIdx = activeSessionExercises.findIndex((le) => le.exerciseId === editingModalExerciseId);
      let updated: LoggedExercise[];
      if (existingIdx !== -1) {
        updated = activeSessionExercises.map((le, idx) =>
          idx === existingIdx ? { ...le, sets: setsToSave, notes: exerciseNote.trim() || undefined } : le
        );
      } else {
        updated = [
          ...activeSessionExercises,
          { id: generateId(), exerciseId: editingModalExerciseId, sets: setsToSave, notes: exerciseNote.trim() || undefined },
        ];
      }
      setActiveSessionExercises(updated);
      await AsyncStorage.setItem('@active_session_exercises', JSON.stringify(updated));
    }

    setEditingModalExerciseId(null);
    setSelectedModalMuscle(null);
    setSelectedSubGroup(null);
    setActiveSegment('log');

    await handleFinishWorkoutDay();
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

    if (activeSets.some((s) => s.reps <= 0)) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showCustomAlert(
        'Invalid Reps',
        'Please ensure all sets have at least 1 repetition before saving.',
        [{ text: 'OK' }],
        <Flame size={28} color="#EF4444" />
      );
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const existingEx = (fromTemplateList ? templateListExercises : activeSessionExercises).find(le => le.exerciseId === exerciseId);
    const newLog = {
      id: existingEx?.id || generateId(),
      exerciseId,
      sets: activeSets.map((s) => ({ ...s, isCompleted: true })),
      notes: exerciseNote.trim() || undefined,
    };

    if (fromTemplateList) {
      let updatedList: LoggedExercise[] = [];
      setTemplateListExercises((prev) => {
        const updated = [...prev];
        const existingIndex = updated.findIndex((le) => le.exerciseId === exerciseId);
        if (existingIndex > -1) {
          updated[existingIndex] = newLog;
        } else {
          updated.push(newLog);
        }
        updatedList = updated;
        return updated;
      });

      const curIdx = templateListExercises.findIndex((le) => le.exerciseId === exerciseId);
      const nextEx = templateListExercises[curIdx + 1];
      if (nextEx) {
        setExpandedExerciseId(nextEx.exerciseId);
        setActiveSets(nextEx.sets.map((s) => ({ ...s, isCompleted: true })));
        setExerciseNote(nextEx.notes || '');
        setSameForAll(true);
        return;
      }

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

    if (cameFromActiveSessionPlus) {
      setSelectedModalMuscle(null);
      setSelectedSubGroup(null);
      setCameFromActiveSessionPlus(false);
    }

    // Check if there is a next workout in the session to log
    const curIdx = updatedExercises.findIndex((le) => le.exerciseId === exerciseId);
    const nextEx = updatedExercises[curIdx + 1];

    if (nextEx) {
      setExpandedExerciseId(nextEx.exerciseId);
      const isLogged = nextEx.sets.every(s => s.isCompleted);
      const nextSets: WorkoutSet[] = nextEx.sets.map((s) => ({
        id: s.id,
        weight: isLogged ? 0 : s.weight,
        reps: isLogged ? 0 : s.reps,
        isCompleted: isLogged ? false : s.isCompleted,
      }));

      setActiveSets(nextSets);
      setExerciseNote(nextEx.notes || '');
      setSameForAll(true);
      return;
    }

    // Reset logger states if last exercise
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

  const ensureGoogleSignedIn = async (onSuccess: () => Promise<void>) => {
    if (auth.currentUser || userEmail) {
      await onSuccess();
      return;
    }

    showCustomAlert(
      'Log In to Save',
      'Log in with Google to save your workout and sync your consistency streak.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log In with Google',
          onPress: async () => {
            try {
              const user = await signInWithGoogle();
              if (user) {
                await setSignedIn();
                setUserEmail(user.email);
                setUserDisplayName(user.displayName);
                const cloudProfile = await getProfileFromFirestore(user.uid);
                if (cloudProfile) {
                  const p = {
                    name: cloudProfile.name || '',
                    heightCm: cloudProfile.heightCm || 0,
                    weightKg: cloudProfile.weightKg || 0,
                    goal: cloudProfile.goal || ('' as FitnessGoal),
                    updatedAt: new Date().toISOString(),
                  };
                  setUserProfile(p);
                  await saveLocalProfile({
                    name: p.name,
                    heightCm: p.heightCm,
                    weightKg: p.weightKg,
                    goal: p.goal,
                  });
                }
                await onSuccess();
              }
            } catch (e: any) {
              console.warn('Google Sign-In failed during save:', e);
            }
          },
        },
      ],
      <User size={28} color="#10B981" />
    );
  };

  const handleFinishWorkoutDay = async () => {
    if (activeSessionExercises.length === 0) {
      showCustomAlert(
        'Active Session',
        'You have not logged any workouts in the active session yet.',
        [{ text: 'OK' }],
        <Dumbbell size={28} color="#3B82F6" />
      );
      return;
    }

    const suggestedTitle = suggestWorkoutTitle(activeSessionExercises);

    const performSave = async () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      const elapsedMinutes = sessionStartTime > 0
        ? Math.max(1, Math.round((Date.now() - sessionStartTime) / 60000))
        : 15;

      const detectedPrs = await addCompletedWorkout(suggestedTitle, activeSessionExercises, elapsedMinutes);

      // If started from a template, update the template's default sets/reps/notes
      if (sessionTemplateId) {
        const currentTmpl = templates.find(t => t.id === sessionTemplateId);
        if (currentTmpl) {
          const updatedTmplExercises = [...currentTmpl.exercises];
          
          for (const activeEx of activeSessionExercises) {
            const idx = updatedTmplExercises.findIndex(te => te.exerciseId === activeEx.exerciseId);
            const mappedEx = {
              exerciseId: activeEx.exerciseId,
              sets: activeEx.sets.map(s => ({
                id: generateId(),
                weight: s.weight,
                reps: s.reps,
                isCompleted: false
              })),
              notes: activeEx.notes
            };
            
            if (idx !== -1) {
              updatedTmplExercises[idx] = mappedEx;
            } else {
              updatedTmplExercises.push(mappedEx);
            }
          }
          await updateTemplate(sessionTemplateId, updatedTmplExercises);
        }
      }

      // Clear active session
      setActiveSessionExercises([]);
      setSessionStartTime(0);
      setSessionStartedFromTemplate(false);
      setSessionTemplateId(null);
      await Promise.all([
        AsyncStorage.removeItem('@active_session_exercises'),
        AsyncStorage.removeItem('@session_start_time'),
        AsyncStorage.removeItem('@session_started_from_template'),
        AsyncStorage.removeItem('@session_template_id'),
      ]);

      // Reset modal, logger, and views
      setExpandedExerciseId(null);
      setEditingActiveExerciseId(null);
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
    };

    await performSave();
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
            setSessionStartedFromTemplate(false);
            setSessionTemplateId(null);
            setReplacingActiveId(null);
            setEditingActiveExerciseId(null);
            setMainScrollEnabled(true);
            await Promise.all([
              AsyncStorage.removeItem('@active_session_exercises'),
              AsyncStorage.removeItem('@session_start_time'),
              AsyncStorage.removeItem('@session_started_from_template'),
              AsyncStorage.removeItem('@session_template_id'),
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

    // Validate sets and reps
    for (const ex of updatedExercises) {
      if (ex.sets.length === 0) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        showCustomAlert(
          'Add Sets',
          'Please ensure all exercises have at least one set.',
          [{ text: 'OK' }],
          <Flame size={28} color="#EF4444" />
        );
        return;
      }
      if (ex.sets.some((s) => s.reps <= 0)) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        showCustomAlert(
          'Invalid Reps',
          'Please ensure all sets have at least 1 repetition.',
          [{ text: 'OK' }],
          <Flame size={28} color="#EF4444" />
        );
        return;
      }
    }

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
      setSessionStartedFromTemplate(false);
      setSessionTemplateId(null);
      await Promise.all([
        AsyncStorage.removeItem('@active_session_exercises'),
        AsyncStorage.removeItem('@session_start_time'),
        AsyncStorage.removeItem('@session_started_from_template'),
        AsyncStorage.removeItem('@session_template_id'),
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
      setTemplateListVisible(false);
      setFromTemplateList(true);

      // Instantly pop open the exercise selector to add workouts to this template
      handleSelectMuscleCard(getMostFrequentMuscleGroup(templateExercises));
    }

    setTemplateModalVisible(false);
    setTemplateName('');
    setTemplateExercises([]);
  };

  const sortTemplateExercises = (exercisesList: LoggedExercise[]) => {
    return [...exercisesList].sort((a, b) => {
      const detailsA = exercises.find((e) => e.id === a.exerciseId);
      const detailsB = exercises.find((e) => e.id === b.exerciseId);
      const muscleA = detailsA ? detailsA.muscleGroup : '';
      const muscleB = detailsB ? detailsB.muscleGroup : '';
      const idxA = MUSCLE_GROUPS.indexOf(muscleA as MuscleGroup);
      const idxB = MUSCLE_GROUPS.indexOf(muscleB as MuscleGroup);
      if (idxA === -1) return 1;
      if (idxB === -1) return -1;
      return idxA - idxB;
    });
  };

  const handleUseTemplate = (tmpl: WorkoutTemplate) => {
    const sortedExercises = sortTemplateExercises(tmpl.exercises);
    const exercisesToLoad = sortedExercises.map((logEx) => ({
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const initialSets: WorkoutSet[] =
      logEx.sets && logEx.sets.length > 0
        ? logEx.sets.map((s) => ({
            id: s.id || generateId(),
            weight: s.weight,
            reps: s.reps,
            isCompleted: s.isCompleted ?? false,
          }))
        : [];

    if (initialSets.length === 0) {
      const previousLog = getPreviousWorkoutForExercise(logEx.exerciseId);
      if (previousLog && previousLog.sets.length > 0) {
        previousLog.sets.forEach((set) => {
          initialSets.push({
            id: generateId(),
            weight: set.weight,
            reps: set.reps,
            isCompleted: false,
          });
        });
      }
    }

    while (initialSets.length < 3) {
      const lastSet = initialSets.length > 0 ? initialSets[initialSets.length - 1] : null;
      initialSets.push({
        id: generateId(),
        weight: lastSet ? lastSet.weight : 0,
        reps: lastSet ? lastSet.reps : 0,
        isCompleted: false,
      });
    }

    setActiveSets(initialSets);
    setExerciseNote(logEx.notes || '');
    setShowNoteInput(!!logEx.notes);
    setSameForAll(true);

    setInPlaceLoggingContext({
      source: 'template_list',
      templateExerciseId: logEx.exerciseId,
    });

    setTemplateListVisible(false);
    setActiveSegment('log');
    setEditingActiveExerciseId(logEx.exerciseId);
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

  const getDateGroupLabel = (dateStr: string, firstDay: number = weekStartDay): string => {
    const d = new Date(dateStr);
    const today = new Date();
    const dateOnly = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const diffDays = Math.round((todayOnly.getTime() - dateOnly.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';

    const dayOfWeek = todayOnly.getDay();
    const diff = (dayOfWeek - firstDay + 7) % 7;
    const weekStart = new Date(todayOnly);
    weekStart.setDate(todayOnly.getDate() - diff);

    if (dateOnly >= weekStart) return 'This Week';

    const lastWeekStart = new Date(weekStart);
    lastWeekStart.setDate(weekStart.getDate() - 7);
    if (dateOnly >= lastWeekStart) return 'Last Week';

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

  // Extract ordered list of recently logged exercise IDs from workout history
  const recentExerciseIdsInOrder: string[] = [];
  history.forEach((session) => {
    session.exercises.forEach((logEx) => {
      if (!recentExerciseIdsInOrder.includes(logEx.exerciseId)) {
        recentExerciseIdsInOrder.push(logEx.exerciseId);
      }
    });
  });

  const favoriteExercises = displayedExercises.filter((ex) => ex.isFavorite);

  // Recent exercises for this muscle group (not in favorites)
  const recentExercises = displayedExercises
    .filter((ex) => !ex.isFavorite && recentExerciseIdsInOrder.includes(ex.id))
    .sort((a, b) => recentExerciseIdsInOrder.indexOf(a.id) - recentExerciseIdsInOrder.indexOf(b.id));

  // Popular exercises (not in favorites or recent)
  const popularExercises = displayedExercises
    .filter((ex) => POPULAR_EXERCISE_IDS.includes(ex.id) && !ex.isFavorite && !recentExerciseIdsInOrder.includes(ex.id))
    .sort((a, b) => POPULAR_EXERCISE_IDS.indexOf(a.id) - POPULAR_EXERCISE_IDS.indexOf(b.id));

  // Custom / Added exercises (not in favorites or recent)
  const customExercises = displayedExercises.filter((ex) => ex.isCustom && !ex.isFavorite && !recentExerciseIdsInOrder.includes(ex.id));

  // Remaining default exercises grouped by instrument
  const defaultExercises = displayedExercises.filter(
    (ex) => !ex.isCustom && !ex.isFavorite && !recentExerciseIdsInOrder.includes(ex.id) && !POPULAR_EXERCISE_IDS.includes(ex.id)
  );

  const exerciseSections: { title: string; data: typeof displayedExercises }[] = [];
  if (favoriteExercises.length > 0) {
    exerciseSections.push({ title: 'Favorites', data: favoriteExercises });
  }
  if (recentExercises.length > 0) {
    exerciseSections.push({ title: 'Recent Workouts', data: recentExercises });
  }
  if (customExercises.length > 0) {
    exerciseSections.push({ title: 'Added Workouts', data: customExercises });
  }
  if (popularExercises.length > 0) {
    exerciseSections.push({ title: 'Popular Workouts', data: popularExercises });
  }
  INSTRUMENT_ORDER.forEach((inst) => {
    const data = defaultExercises.filter((ex) => (ex.instrument || 'Other') === inst);
    if (data.length > 0) {
      exerciseSections.push({ title: inst, data });
    }
  });

  // Dynamic section color mapping: first list on top gets muscle group's own color, then green -> purple -> blue -> teal
  const sectionColorMap: Record<string, string> = {};
  const currentMuscleColor = categoryColors[selectedModalMuscle || 'Chest'] || '#10B981';

  // Base rotation: green -> purple -> blue -> teal, followed by orange, pink, gold
  const CYCLE_PALETTE = [
    '#10B981', // Green
    '#8B5CF6', // Purple
    '#3B82F6', // Blue
    '#14B8A6', // Teal
    '#F97316', // Orange
    '#EC4899', // Pink
    '#EAB308', // Gold
  ];

  // Exclude current muscle color so it is not repeated in subsequent lists
  const remainingPalette = CYCLE_PALETTE.filter(
    (c) => c.toLowerCase() !== currentMuscleColor.toLowerCase()
  );

  exerciseSections.forEach((s, idx) => {
    if (idx === 0) {
      sectionColorMap[s.title] = currentMuscleColor;
    } else {
      sectionColorMap[s.title] = remainingPalette[(idx - 1) % remainingPalette.length];
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

  if (!sessionInitialLoaded) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top', 'left', 'right']} />
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inner}
      >
        <ScrollView
          ref={mainScrollRef}
          nestedScrollEnabled={true}
          scrollEnabled={mainScrollEnabled}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(60, insets.bottom + 70) }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Landing Header */}
          <View style={styles.header}>
            <View style={styles.headerRow}>
              <View style={{ flexShrink: 1, marginRight: 10, justifyContent: 'center' }}>
                <Text style={[styles.headerSlogan, { color: theme.textSecondary }]} numberOfLines={1} ellipsizeMode="clip">
                  WE REMEMBER SO YOU CAN
                </Text>
                <Text style={[styles.headerBrand, { color: theme.textPrimary }]} numberOfLines={1}>
                  FORGET
                </Text>
              </View>
              {/* Header Action Controls */}
              <View style={styles.headerActionContainer}>
                {/* Workout Days Counter Badge */}
                <TouchableOpacity
                  style={[
                    styles.workoutDaysBadge,
                    { backgroundColor: theme.cardBg, borderColor: theme.borderColor }
                  ]}
                  onPress={handleOpenConsistency}
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
                  {restTimerRunning && restTimerSeconds > 0 ? (
                    <Text style={[styles.restTimerText, { color: '#FFFFFF' }]}>
                      {formatRestTime(restTimerSeconds)}
                    </Text>
                  ) : null}
                </TouchableOpacity>

                {/* Profile Badge */}
                <TouchableOpacity
                  style={[
                    styles.profileBadge,
                    { backgroundColor: userEmail || auth.currentUser ? '#111827' : theme.cardBg, borderColor: userEmail || auth.currentUser ? '#111827' : theme.borderColor }
                  ]}
                  onPress={handleOpenProfile}
                  activeOpacity={0.7}
                >
                  {userEmail || auth.currentUser ? (
                    <Text style={styles.profileBadgeInitials}>
                      {getInitials(auth.currentUser?.displayName ?? null, auth.currentUser?.email ?? null)}
                    </Text>
                  ) : (
                    <User size={14} color={theme.textSecondary} strokeWidth={2.5} />
                  )}
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
                    if (replacingActiveId) setReplacingActiveId(null);
                    if (editingActiveExerciseId) setEditingActiveExerciseId(null);
                    setMainScrollEnabled(true);
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
          <Animated.View style={{ opacity: tabOpacity }}>
            {activeSegment === 'log' ? (
            <>
              {/* Active Session Status Card */}
              {(activeSessionExercises.length > 0 || editingActiveExerciseId !== null) && (
                <Card style={[styles.activeSessionCard, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
                  {replacingActiveId !== null ? (
                    (() => {
                      const targetLoggedEx = activeSessionExercises.find(
                        (le) => (le.id ? le.id === replacingActiveId : le.exerciseId === replacingActiveId)
                      );
                      const targetEx = targetLoggedEx ? exercises.find((e) => e.id === targetLoggedEx.exerciseId) : null;
                      if (!targetLoggedEx || !targetEx) {
                        return null;
                      }
                      const muscleColor = categoryColors[targetEx.muscleGroup] || '#10B981';
                      const options = getReplacementOptionsForExercise(targetEx.id, targetEx.muscleGroup);

                      return (
                        <View>
                          <View style={styles.activeSessionHeader}>
                            <View style={{ flex: 1, paddingRight: 8 }}>
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                                <RefreshCw size={14} color={muscleColor} strokeWidth={2.5} />
                                <Text style={[styles.activeSessionTitle, { color: theme.textPrimary }]} numberOfLines={1}>
                                  Replace {targetEx.name}
                                </Text>
                              </View>
                              <Text style={[styles.activeSessionSubtitle, { color: theme.textSecondary }]}>
                                {options.length} top alternative{options.length !== 1 ? 's' : ''} • Tap to swap
                              </Text>
                            </View>
                            <TouchableOpacity
                              onPress={() => {
                                setReplacingActiveId(null);
                                setMainScrollEnabled(true);
                              }}
                              activeOpacity={0.6}
                              style={{ padding: 6 }}
                              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            >
                              <X size={18} color={theme.textSecondary} strokeWidth={2.5} />
                            </TouchableOpacity>
                          </View>

                          <ScrollView
                            style={{ maxHeight: 260, marginVertical: 6 }}
                            contentContainerStyle={{ paddingBottom: 4 }}
                            showsVerticalScrollIndicator={true}
                            nestedScrollEnabled={true}
                            overScrollMode="never"
                            bounces={false}
                            keyboardShouldPersistTaps="handled"
                            onTouchStart={() => setMainScrollEnabled(false)}
                            onTouchEnd={() => setMainScrollEnabled(true)}
                            onTouchCancel={() => setMainScrollEnabled(true)}
                            onMomentumScrollEnd={() => setMainScrollEnabled(true)}
                          >
                            {options.length === 0 ? (
                              <Text style={{ fontSize: 13, color: theme.textSecondary, fontStyle: 'italic', paddingVertical: 16, textAlign: 'center' }}>
                                No alternative exercises found
                              </Text>
                            ) : (
                              options.map((alt, optIdx) => {
                                const isUserAdded = !!(alt as any).isUserAdded;
                                const isFrequent = !!(alt as any).isFrequent;
                                const groupColor = isUserAdded
                                  ? '#06B6D4'
                                  : (isFrequent ? '#8B5CF6' : (INSTRUMENT_COLORS[alt.instrument] || categoryColors[alt.muscleGroup] || '#10B981'));
                                return (
                                  <TouchableOpacity
                                    key={alt.id}
                                    activeOpacity={0.6}
                                    onPress={() => handleReplaceExercise(targetLoggedEx.id || targetLoggedEx.exerciseId, targetLoggedEx.exerciseId, alt.id)}
                                    style={[
                                      styles.replaceOptionItem,
                                      { borderBottomColor: theme.borderColor, backgroundColor: theme.cardBg },
                                      isUserAdded && { backgroundColor: isDarkMode ? '#06B6D40C' : '#06B6D408' },
                                      isFrequent && !isUserAdded && { backgroundColor: isDarkMode ? '#8B5CF60C' : '#8B5CF608' },
                                    ]}
                                  >
                                    <View style={[styles.activeSessionItemAccent, { backgroundColor: groupColor }]} />
                                    <View style={{ flex: 1, marginRight: 8 }}>
                                      <Text style={[styles.replaceOptionItemName, { color: theme.textPrimary }]} numberOfLines={1}>
                                        {alt.name}
                                      </Text>
                                    </View>
                                    <View style={[styles.activeSessionMuscleBadge, { backgroundColor: `${groupColor}18` }]}>
                                      <Text style={[styles.activeSessionMuscleBadgeText, { color: groupColor }]}>
                                        {isUserAdded
                                          ? `SAVED • ${alt.instrument.toUpperCase()}`
                                          : (isFrequent ? `FREQUENT • ${alt.instrument.toUpperCase()}` : alt.instrument.toUpperCase())}
                                      </Text>
                                    </View>
                                  </TouchableOpacity>
                                );
                              })
                            )}
                            <TouchableOpacity
                              activeOpacity={0.6}
                              onPress={() => handleOpenReplaceLibrary(targetLoggedEx.id || targetLoggedEx.exerciseId, targetEx)}
                              style={[
                                styles.replaceOptionItem,
                                { borderBottomWidth: 0, paddingTop: 10, paddingBottom: 6 }
                              ]}
                            >
                              <View style={[styles.activeSessionItemAccent, { backgroundColor: theme.borderColor }]} />
                              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 7 }}>
                                <Plus size={14} color={muscleColor} strokeWidth={2.5} />
                                <Text style={[styles.replaceOptionItemName, { color: theme.textSecondary, fontSize: 13, fontWeight: '600' }]} numberOfLines={1}>
                                  Add from library...
                                </Text>
                              </View>
                            </TouchableOpacity>
                          </ScrollView>

                          <TouchableOpacity
                            onPress={() => {
                              setReplacingActiveId(null);
                              setMainScrollEnabled(true);
                            }}
                            style={[styles.cancelReplaceBtn, { borderColor: theme.borderColor, backgroundColor: isDarkMode ? '#1E1E28' : '#F3F4F6' }]}
                            activeOpacity={0.7}
                          >
                            <Text style={[styles.cancelReplaceBtnText, { color: theme.textSecondary }]}>CANCEL</Text>
                          </TouchableOpacity>
                        </View>
                      );
                    })()
                  ) : editingActiveExerciseId !== null ? (
                    (() => {
                      const isFromTemplate = inPlaceLoggingContext?.source === 'template_list';
                      const targetLoggedEx = activeSessionExercises.find(
                        (le) => le.id === editingActiveExerciseId || le.exerciseId === editingActiveExerciseId
                      ) || (isFromTemplate
                        ? templateListExercises.find((le) => le.exerciseId === editingActiveExerciseId)
                        : null);
                      const targetEx = targetLoggedEx
                        ? exercises.find((e) => e.id === targetLoggedEx.exerciseId)
                        : exercises.find(
                            (e) => e.id === editingActiveExerciseId || e.id === inPlaceLoggingContext?.temporaryExerciseId
                          );
                      if (!targetEx) {
                        return null;
                      }
                      const safeLoggedEx = targetLoggedEx || {
                        id: editingActiveExerciseId || '',
                        exerciseId: targetEx.id,
                        sets: activeSets,
                        notes: exerciseNote,
                      };
                      const listForSwitcher = isFromTemplate
                        ? templateListExercises
                        : (activeSessionExercises.length > 0
                            ? activeSessionExercises
                            : [{ id: safeLoggedEx.id, exerciseId: targetEx.id, sets: activeSets }]);
                      const muscleColor = categoryColors[targetEx.muscleGroup] || '#10B981';

                      return (
                        <View>
                          {/* Top Fixed Action Bar: CANCEL on left, SAVE on right */}
                          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                            <TouchableOpacity
                              onPress={() => handleCancelInPlaceLogger()}
                              activeOpacity={0.7}
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 4,
                                paddingVertical: 6,
                                paddingHorizontal: 12,
                                borderRadius: 99,
                                backgroundColor: isDarkMode ? 'rgba(239, 68, 68, 0.08)' : '#FEE2E2',
                                borderWidth: 1,
                                borderColor: isDarkMode ? 'rgba(239, 68, 68, 0.22)' : '#FECACA',
                              }}
                            >
                              <X size={12} color={isDarkMode ? '#F87171' : '#DC2626'} strokeWidth={2.4} />
                              <Text style={{ fontSize: 11, fontWeight: '700', color: isDarkMode ? '#F87171' : '#DC2626', letterSpacing: 0.5 }}>
                                CANCEL
                              </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              onPress={() => handleSaveInPlace(targetEx.id)}
                              activeOpacity={0.85}
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 5,
                                paddingVertical: 6,
                                paddingHorizontal: 16,
                                borderRadius: 99,
                                backgroundColor: '#10B981',
                              }}
                            >
                              <Check size={13} color="#000000" strokeWidth={3} />
                              <Text style={{ fontSize: 11, fontWeight: '800', color: '#000000', letterSpacing: 0.5 }}>
                                SAVE
                              </Text>
                            </TouchableOpacity>
                          </View>

                          {/* Top Workout Navigation Pill Wrap (All exercises visible on one page, zero scrolling) */}
                          {listForSwitcher.length > 1 && (
                            <View style={[styles.loggerNavPillWrap, { marginTop: 2, marginBottom: 14 }]}>
                              {listForSwitcher.map((item, index) => {
                                const isSelected = isFromTemplate
                                  ? item.exerciseId === (inPlaceLoggingContext?.templateExerciseId || editingActiveExerciseId)
                                  : (item.id ? item.id === editingActiveExerciseId : item.exerciseId === editingActiveExerciseId);
                                const exDetails = exercises.find((e) => e.id === item.exerciseId);
                                const rawName = exDetails?.name || 'Exercise';
                                const exName = getCompactNavName(rawName);
                                const mColor = exDetails ? categoryColors[exDetails.muscleGroup] || '#10B981' : '#10B981';
                                const hasCompletedSets = item.sets.some((s) => s.isCompleted || (s.weight > 0 && s.reps > 0));

                                return (
                                  <TouchableOpacity
                                    key={item.id || `${item.exerciseId}-${index}`}
                                    activeOpacity={0.7}
                                    onPress={() => handleSwitchInPlaceExercise(item.id || item.exerciseId, item.exerciseId)}
                                    style={[
                                      styles.loggerNavPill,
                                      {
                                        backgroundColor: isSelected
                                          ? (isDarkMode ? `${mColor}25` : `${mColor}18`)
                                          : (isDarkMode ? '#1E1E28' : '#F3F4F6'),
                                        borderColor: isSelected ? mColor : theme.borderColor,
                                        borderWidth: isSelected ? 1.5 : 1,
                                      }
                                    ]}
                                  >
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                      {hasCompletedSets ? (
                                        <Check size={11} color={isSelected ? mColor : '#10B981'} strokeWidth={3} />
                                      ) : (
                                        <Text style={[styles.loggerNavPillIndex, { color: isSelected ? mColor : theme.textSecondary }]}>
                                          {index + 1}
                                        </Text>
                                      )}
                                      <Text
                                        numberOfLines={1}
                                        ellipsizeMode="tail"
                                        style={[
                                          styles.loggerNavPillText,
                                          {
                                            color: isSelected ? (isDarkMode ? '#FFFFFF' : theme.textPrimary) : theme.textSecondary,
                                            fontWeight: isSelected ? '700' : '500',
                                          }
                                        ]}
                                      >
                                        {exName}
                                      </Text>
                                    </View>
                                  </TouchableOpacity>
                                );
                              })}
                            </View>
                          )}

                          <ScrollView
                            style={{ maxHeight: 440, marginVertical: 4 }}
                            contentContainerStyle={{ paddingBottom: 8 }}
                            showsVerticalScrollIndicator={true}
                            nestedScrollEnabled={true}
                            overScrollMode="never"
                            bounces={false}
                            keyboardShouldPersistTaps="handled"
                            onTouchStart={() => setMainScrollEnabled(false)}
                            onTouchEnd={() => setMainScrollEnabled(true)}
                            onTouchCancel={() => setMainScrollEnabled(true)}
                            onMomentumScrollEnd={() => setMainScrollEnabled(true)}
                          >
                            {/* Exercise Header & Details (Inside Scrollable Area) */}
                            <View style={{ marginBottom: 8, paddingBottom: 6, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.borderColor }}>
                              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                                <View style={{ flex: 1, paddingRight: 4 }}>
                                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                                    <View style={[styles.activeSessionItemAccent, { backgroundColor: muscleColor, height: 14, width: 3, borderRadius: 2 }]} />
                                    <Text style={[styles.activeSessionTitle, { color: theme.textPrimary, flexShrink: 1 }]} numberOfLines={1}>
                                      {targetEx.name}
                                    </Text>
                                  </View>
                                  <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginTop: 2 }}>
                                    <Text style={[styles.activeSessionSubtitle, { color: theme.textSecondary, marginTop: 0 }]}>
                                      {targetEx.muscleGroup.toUpperCase()} • {activeSets.length} set{activeSets.length !== 1 ? 's' : ''}
                                    </Text>
                                    {targetEx.target ? (
                                      <View style={{
                                        backgroundColor: `${muscleColor}14`,
                                        paddingHorizontal: 6,
                                        paddingVertical: 1.5,
                                        borderRadius: 4,
                                        borderWidth: 0.5,
                                        borderColor: `${muscleColor}28`,
                                      }}>
                                        <Text style={{ fontSize: 10, fontWeight: '600', color: muscleColor, letterSpacing: 0.1 }}>
                                          {targetEx.target}
                                        </Text>
                                      </View>
                                    ) : null}
                                  </View>
                                </View>

                                {/* Rest Timer Pill on the right of the heading */}
                                <View style={{ marginRight: 6 }}>
                                  {restTimerRunning ? (
                                    <TouchableOpacity
                                      onPress={() => {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                        setRestTimerVisible(true);
                                      }}
                                      activeOpacity={0.8}
                                      style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        gap: 5,
                                        paddingVertical: 5,
                                        paddingHorizontal: 11,
                                        borderRadius: 99,
                                        backgroundColor: isDarkMode ? '#10B98125' : '#10B98118',
                                        borderWidth: 1,
                                        borderColor: '#10B981',
                                      }}
                                    >
                                      <Timer size={12} color="#10B981" strokeWidth={2.4} />
                                      <Text style={{ fontSize: 11, fontWeight: '800', color: '#10B981', letterSpacing: 0.5 }}>
                                        {formatRestTime(restTimerSeconds)}
                                      </Text>
                                    </TouchableOpacity>
                                  ) : (
                                    <TouchableOpacity
                                      onPress={() => {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                        setRestTimerVisible(true);
                                      }}
                                      activeOpacity={0.7}
                                      style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        gap: 5,
                                        paddingVertical: 5,
                                        paddingHorizontal: 11,
                                        borderRadius: 99,
                                        backgroundColor: isDarkMode ? 'rgba(56, 189, 248, 0.08)' : '#F0F9FF',
                                        borderWidth: 1,
                                        borderColor: isDarkMode ? 'rgba(56, 189, 248, 0.28)' : '#BAE6FD',
                                      }}
                                    >
                                      <Timer size={12} color="#38BDF8" strokeWidth={2.4} />
                                      <Text style={{ fontSize: 10, fontWeight: '700', color: isDarkMode ? '#38BDF8' : '#0284C7', letterSpacing: 0.4 }}>
                                        REST TIMER
                                      </Text>
                                    </TouchableOpacity>
                                  )}
                                </View>
                              </View>
                            </View>
                            {/* Best PR banner if available */}
                            {(() => {
                              const targetExId = targetEx.id;
                              const prFromState = getExercisePR(targetExId);
                              let pr = prFromState;

                              if (!pr) {
                                let max1RM = 0;
                                let bestWeight = 0;
                                let bestReps = 0;
                                let bestDate = '';
                                for (const session of history) {
                                  const logEx = session.exercises.find((e) => e.exerciseId === targetExId);
                                  if (logEx) {
                                    for (const set of logEx.sets) {
                                      if (set.weight > 0 && set.reps > 0) {
                                        const e1RM = set.weight * (1 + set.reps / 30);
                                        if (e1RM > max1RM) {
                                          max1RM = e1RM;
                                          bestWeight = set.weight;
                                          bestReps = set.reps;
                                          bestDate = session.date;
                                        }
                                      }
                                    }
                                  }
                                }
                                if (bestWeight > 0) {
                                  pr = { exerciseId: targetExId, weight: bestWeight, reps: bestReps, date: bestDate, estimatedOneRM: max1RM };
                                }
                              }

                              if (!pr) return null;

                              const formattedDate = new Date(pr.date).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              });

                              return (
                                <View
                                  style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.03)' : '#F9FAFB',
                                    borderWidth: 1,
                                    borderColor: theme.borderColor,
                                    borderRadius: 8,
                                    paddingHorizontal: 10,
                                    paddingVertical: 7,
                                    marginBottom: 10,
                                  }}
                                >
                                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                    <Trophy size={13} color="#10B981" strokeWidth={2} />
                                    <Text style={{ fontSize: 9, fontWeight: '800', color: '#10B981', letterSpacing: 0.8 }}>
                                      BEST
                                    </Text>
                                    <Text style={{ fontSize: 13, fontWeight: '800', color: theme.textPrimary, marginLeft: 2 }}>
                                      {pr.weight} <Text style={{ fontSize: 10, fontWeight: '600', color: theme.textSecondary }}>kg</Text> × {pr.reps} <Text style={{ fontSize: 10, fontWeight: '600', color: theme.textSecondary }}>reps</Text>
                                    </Text>
                                  </View>
                                  <Text style={{ fontSize: 11, fontWeight: '500', color: theme.textSecondary }}>
                                    {formattedDate}
                                  </Text>
                                </View>
                              );
                            })()}

                            {/* Same for all sets toggle */}
                            <TouchableOpacity
                              style={[styles.exerciseLoggerOptionRow, { paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.borderColor, marginBottom: 8 }]}
                              onPress={toggleSameForAll}
                              activeOpacity={0.8}
                            >
                              <View style={{ flex: 1, paddingRight: 8 }}>
                                <Text style={[styles.optionsTitle, { color: theme.textPrimary, fontSize: 13 }]}>Same for all sets</Text>
                                <Text style={[styles.optionsSubtitle, { color: theme.textSecondary, fontSize: 11 }]}>
                                  Sync weight and reps automatically
                                </Text>
                              </View>
                              <View
                                style={[
                                  styles.switchTrack,
                                  sameForAll
                                    ? { backgroundColor: muscleColor, alignItems: 'flex-end' }
                                    : { backgroundColor: '#D1D5DB', alignItems: 'flex-start' }
                                ]}
                              >
                                <View style={styles.switchThumb} />
                              </View>
                            </TouchableOpacity>

                            {/* Set row labels */}
                            <View style={styles.setRowLabels}>
                              <Text style={[styles.labelCol, styles.widthSet, { color: theme.textPrimary }]}>SET</Text>
                              <Text style={[styles.labelCol, styles.widthWeight, { color: theme.textSecondary }]}>WEIGHT</Text>
                              <Text style={[styles.labelCol, styles.widthReps, { color: theme.textSecondary }]}>REPS</Text>
                              <View style={styles.widthActions} />
                            </View>

                            {/* Sets */}
                            {activeSets.map((set, index) => (
                              <View key={set.id} style={[styles.setRow, { borderBottomColor: theme.borderColor, paddingVertical: 8 }]}>
                                <View style={styles.widthSet}>
                                  <Text style={[styles.setText, { color: theme.textPrimary }]}>{index + 1}</Text>
                                </View>
                                <View style={styles.widthWeight}>
                                  <IncrementInput
                                    value={set.weight}
                                    step={2.5}
                                    allowDecimals={true}
                                    onChange={(val) => handleUpdateSet(set.id, { weight: val })}
                                    placeholder="kg"
                                    accentColor={muscleColor}
                                    style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder }}
                                    textColor={theme.textPrimary}
                                  />
                                </View>
                                <View style={styles.widthReps}>
                                  <IncrementInput
                                    value={set.reps}
                                    step={1}
                                    allowDecimals={false}
                                    onChange={(val) => handleUpdateSet(set.id, { reps: val })}
                                    placeholder="reps"
                                    accentColor={muscleColor}
                                    style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder }}
                                    textColor={theme.textPrimary}
                                  />
                                </View>
                                <View style={styles.widthActions}>
                                  {index === activeSets.length - 1 && activeSets.length > 1 && (
                                    <TouchableOpacity
                                      style={styles.setDeleteBtn}
                                      onPress={() => handleRemoveSet(set.id)}
                                      activeOpacity={0.6}
                                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                    >
                                      <Trash2 size={12} color="#EF4444" strokeWidth={2} />
                                    </TouchableOpacity>
                                  )}
                                </View>
                              </View>
                            ))}

                            {/* Compact Add Set & Note row */}
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10, marginBottom: 6 }}>
                              <TouchableOpacity
                                style={[
                                  styles.addSetBtn,
                                  {
                                    flex: 1,
                                    height: 38,
                                    borderRadius: 99,
                                    borderWidth: 1,
                                    borderStyle: 'dashed',
                                    borderColor: isDarkMode ? '#282A3A' : theme.borderColor,
                                    backgroundColor: isDarkMode ? '#13141C' : '#F9FAFB',
                                  }
                                ]}
                                onPress={() => handleAddSet(targetEx.id)}
                                activeOpacity={0.75}
                              >
                                <Plus size={13} color={theme.textSecondary} strokeWidth={2.5} />
                                <Text style={[styles.addSetBtnText, { color: theme.textSecondary }]}>
                                  ADD SET
                                </Text>
                              </TouchableOpacity>

                              {!showNoteInput && (
                                <TouchableOpacity
                                  style={[
                                    styles.addSetBtn,
                                    {
                                      paddingHorizontal: 16,
                                      height: 38,
                                      borderRadius: 99,
                                      borderWidth: 1,
                                      borderStyle: exerciseNote.trim() ? 'solid' : 'dashed',
                                      borderColor: exerciseNote.trim() ? '#10B98160' : (isDarkMode ? '#282A3A' : theme.borderColor),
                                      backgroundColor: exerciseNote.trim() ? (isDarkMode ? '#10B98115' : '#10B9810C') : (isDarkMode ? '#13141C' : '#F9FAFB'),
                                    }
                                  ]}
                                  onPress={() => setShowNoteInput(true)}
                                  activeOpacity={0.75}
                                >
                                  <Text style={[styles.addSetBtnText, { color: exerciseNote.trim() ? '#10B981' : theme.textSecondary }]}>
                                    {exerciseNote.trim() ? 'NOTE ✓' : '+ NOTE'}
                                  </Text>
                                </TouchableOpacity>
                              )}
                            </View>

                            {/* Optional Note (Expands when needed) */}
                            {showNoteInput && (
                              <View style={{ marginTop: 6, marginBottom: 8 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                                  <Text style={{ fontSize: 10, fontWeight: '800', color: theme.textSecondary, letterSpacing: 0.6 }}>
                                    EXERCISE NOTE
                                  </Text>
                                  {!exerciseNote.trim() && (
                                    <TouchableOpacity
                                      onPress={() => setShowNoteInput(false)}
                                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                    >
                                      <Text style={{ fontSize: 10, color: theme.textSecondary, fontWeight: '700', letterSpacing: 0.4 }}>HIDE</Text>
                                    </TouchableOpacity>
                                  )}
                                </View>
                                <TextInput
                                  style={{
                                    backgroundColor: isDarkMode ? '#13141C' : '#F9FAFB',
                                    borderColor: isDarkMode ? '#282A3A' : theme.borderColor,
                                    borderWidth: 1,
                                    borderRadius: 12,
                                    paddingHorizontal: 12,
                                    paddingVertical: 8,
                                    color: theme.textPrimary,
                                    fontSize: 12,
                                    minHeight: 44,
                                    textAlignVertical: 'top',
                                  }}
                                  placeholder="Add an optional workout note..."
                                  placeholderTextColor={theme.inputPlaceholder}
                                  value={exerciseNote}
                                  onChangeText={setExerciseNote}
                                  multiline
                                  maxLength={150}
                                  autoFocus={!exerciseNote}
                                />
                              </View>
                            )}
                          </ScrollView>
                        </View>
                      );
                    })()
                  ) : (
                    <>
                      <View style={styles.activeSessionHeader}>
                        <View>
                          <Text style={[styles.activeSessionTitle, { color: theme.textPrimary }]}>Active Session</Text>
                          <Text style={[styles.activeSessionSubtitle, { color: theme.textSecondary }]}>
                            {activeSessionExercises.length} exercise{activeSessionExercises.length > 1 ? 's' : ''} logged today
                          </Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <TouchableOpacity
                            onPress={() => {
                              setCameFromActiveSessionPlus(true);
                              handleSelectMuscleCard(getMostFrequentMuscleGroup(activeSessionExercises));
                            }}
                            activeOpacity={0.6}
                            style={{ padding: 6 }}
                          >
                            <Plus size={20} color="#10B981" strokeWidth={2.5} />
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

                      <DragList
                        scrollEnabled={false}
                        data={activeSessionExercises}
                        keyExtractor={(item, index) => item.id || `${item.exerciseId}-${index}`}
                        onReordered={(fromIdx, toIdx) => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          const updated = [...activeSessionExercises];
                          const [moved] = updated.splice(fromIdx, 1);
                          updated.splice(toIdx, 0, moved);
                          setActiveSessionExercises(updated);
                          AsyncStorage.setItem('@active_session_exercises', JSON.stringify(updated));
                        }}
                        style={styles.activeSessionList}
                        renderItem={({ item, index, onDragStart, isActive }) => {
                          const details = exercises.find((e) => e.id === item.exerciseId);
                          if (!details) return null;
                          const muscleColor = categoryColors[details.muscleGroup] || '#10B981';
                          const rowKey = item.id || `${item.exerciseId}-${index}`;

                          return (
                            <SwipeableActiveExerciseRow
                              key={rowKey}
                              cardBgColor={theme.cardBg}
                              disabled={isActive}
                              onSwipeLeft={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                setEditingActiveExerciseId(null);
                                setReplacingActiveId(item.id || item.exerciseId);
                              }}
                              onSwipeRight={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                const updated = activeSessionExercises.filter((le) => (item.id ? le.id !== item.id : le.exerciseId !== item.exerciseId));
                                setActiveSessionExercises(updated);
                                AsyncStorage.setItem('@active_session_exercises', JSON.stringify(updated));
                              }}
                            >
                              <TouchableOpacity
                                style={[
                                  styles.activeSessionItem,
                                  { borderBottomColor: theme.borderColor, opacity: isActive ? 0.6 : 1, backgroundColor: theme.cardBg }
                                ]}
                                activeOpacity={0.6}
                                onPress={() => {
                                  handleOpenInPlaceEdit(item.id || item.exerciseId, item.exerciseId);
                                }}
                                onLongPress={onDragStart}
                                delayLongPress={100}
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
                                      {item.sets.length} set{item.sets.length > 1 ? 's' : ''}
                                    </Text>
                                  </View>
                                </View>
                                <TouchableOpacity
                                  onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    setEditingActiveExerciseId(null);
                                    setReplacingActiveId(item.id || item.exerciseId);
                                  }}
                                  style={{ padding: 4, marginRight: 2 }}
                                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                  activeOpacity={0.6}
                                >
                                  <RefreshCw size={13} color={theme.textSecondary} opacity={0.45} strokeWidth={2} />
                                </TouchableOpacity>
                                <ChevronRight size={16} color={theme.textSecondary} opacity={0.4} strokeWidth={2} />
                              </TouchableOpacity>
                            </SwipeableActiveExerciseRow>
                          );
                        }}
                      />

                      <Text style={[styles.activeSessionHint, { color: theme.textSecondary }]}>Tap to edit • Swipe left to replace • Long press to reorder</Text>

                      <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                        <TouchableOpacity
                          style={[styles.finishSessionBtn, { flex: 1, backgroundColor: '#10B981', paddingVertical: 10, borderRadius: 10 }]}
                          onPress={handleFinishWorkoutDay}
                          activeOpacity={0.8}
                        >
                          <Text style={[styles.finishSessionBtnText, { fontSize: 11, letterSpacing: 0.3 }]}>SAVE WORKOUT</Text>
                        </TouchableOpacity>

                    {!sessionTemplateId && !sessionStartedFromTemplate && (
                      <TouchableOpacity
                        style={[
                          styles.finishSessionBtn,
                          {
                            flex: 1,
                            backgroundColor: 'transparent',
                            borderWidth: 1.5,
                            borderColor: '#10B981',
                            paddingVertical: 8.5,
                            borderRadius: 10,
                          }
                        ]}
                        onPress={async () => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          await ensureGoogleSignedIn(async () => {
                            const suggestedTitle = suggestWorkoutTitle(activeSessionExercises);
                            setIsSavingActiveSessionAsTemplate(true);
                            const exercisesToSave = activeSessionExercises.map((le) => ({
                              id: le.id || generateId(),
                              exerciseId: le.exerciseId,
                              sets: le.sets.map((s) => ({ ...s })),
                            }));
                            setTemplateExercises(exercisesToSave);
                            setTemplateName(suggestedTitle);
                            setTemplateModalVisible(true);
                          });
                        }}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.finishSessionBtnText, { color: '#10B981', fontSize: 11, letterSpacing: 0.3 }]}>SAVE AS TEMPLATE</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                    </>
                  )}
                </Card>
              )}

              {/* Muscle Selector (hidden during active Live session) */}
              {!(loggingMode === 'live' && (activeSessionExercises.length > 0 || editingActiveExerciseId !== null)) && (
                <>
                  {/* Muscle Selector Cards Grid */}
                  <Text style={[styles.sectionHeader, { color: theme.textSecondary, marginTop: 4, marginBottom: 12 }]}>
                    SELECT MUSCLE GROUP
                  </Text>
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
                            {muscle === 'Shoulders' ? 'SHOULDERS & ABS' : muscle.toUpperCase()}
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
                </>
              )}

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
                  <View style={styles.weekStartToggle}>
                    <TouchableOpacity
                      onPress={() => setWeekStartDay(0)}
                      activeOpacity={0.6}
                      style={[
                        styles.weekStartToggleOption,
                        { backgroundColor: weekStartDay === 0 ? '#10B981' : 'transparent' },
                      ]}
                    >
                      <Text
                        style={[
                          styles.weekStartToggleText,
                          { color: weekStartDay === 0 ? '#FFFFFF' : theme.textSecondary },
                        ]}
                      >
                        SUN
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setWeekStartDay(1)}
                      activeOpacity={0.6}
                      style={[
                        styles.weekStartToggleOption,
                        { backgroundColor: weekStartDay === 1 ? '#10B981' : 'transparent' },
                      ]}
                    >
                      <Text
                        style={[
                          styles.weekStartToggleText,
                          { color: weekStartDay === 1 ? '#FFFFFF' : theme.textSecondary },
                        ]}
                      >
                        MON
                      </Text>
                    </TouchableOpacity>
                  </View>
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

                {(() => {
                  const baseLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                  const dayLabels = [...baseLabels.slice(weekStartDay), ...baseLabels.slice(0, weekStartDay)];
                  return (
                    <View style={{ gap: 10 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                        {dayLabels.map((lbl, idx) => (
                          <Text key={idx} style={{ flex: 1, textAlign: 'center', fontSize: 10, fontWeight: '800', color: theme.textSecondary, opacity: 0.6 }}>
                            {lbl.toUpperCase()}
                          </Text>
                        ))}
                      </View>

                      <View>
                        <Text style={{ fontSize: 9, fontWeight: '800', color: theme.textSecondary, marginBottom: 4, letterSpacing: 0.5 }}>
                          {currentWeekOffset === 0 ? 'THIS WEEK' : 'CURRENT WEEK'}
                        </Text>
                        {renderWeekRow(currentWeekOffset)}
                      </View>

                      <View>
                        <Text style={{ fontSize: 9, fontWeight: '800', color: theme.textSecondary, marginBottom: 4, letterSpacing: 0.5 }}>
                          {currentWeekOffset === 0 ? 'LAST WEEK' : 'PREVIOUS WEEK'}
                        </Text>
                        {renderWeekRow(currentWeekOffset - 1)}
                      </View>
                    </View>
                  );
                })()}

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
                              {w.exercises.map((logEx, exIndex) => {
                                const exDetails = exercises.find((e) => e.id === logEx.exerciseId);
                                return (
                                  <View key={logEx.id || `${logEx.exerciseId}-${exIndex}`} style={styles.weeklyDetailExercise}>
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
                <ProgressGrid history={history} isDarkMode={isDarkMode} weekStartDay={weekStartDay} />
              </TouchableOpacity>

            </>
          ) : activeSegment === 'templates' ? (
            /* Templates View Section */
            <View
              style={styles.historySection}
              onLayout={(event) => {
                templatesContainerY.current = event.nativeEvent.layout.y;
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, marginTop: 4 }}>
                <View>
                  <Text style={[styles.sectionHeader, { color: theme.textSecondary, marginBottom: 0, marginTop: 0 }]}>TEMPLATES</Text>
                  {templates.length > 0 && (
                    <Text style={{ color: theme.textSecondary, fontSize: 9, fontWeight: '600', marginTop: 5, opacity: 0.75, letterSpacing: 0.2 }}>
                      Tap to edit
                    </Text>
                  )}
                </View>
                <TouchableOpacity
                  onPress={async () => {
                    await ensureGoogleSignedIn(async () => {
                      setTemplateName('');
                      setTemplateExercises([]);
                      setIsSavingActiveSessionAsTemplate(false);
                      setTemplateModalVisible(true);
                    });
                  }}
                  activeOpacity={0.7}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                    paddingVertical: 4,
                    paddingLeft: 8,
                    paddingRight: 0,
                  }}
                >
                  <Plus size={12} color="#10B981" strokeWidth={2.5} />
                  <Text style={{ color: '#10B981', fontSize: 11, fontWeight: '700', letterSpacing: 0.5 }}>
                    NEW
                  </Text>
                </TouchableOpacity>
              </View>

              {templates.length === 0 ? (
                <Card style={[styles.welcomeCard, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
                  <Calendar size={32} color="#10B981" strokeWidth={1.5} />
                  <Text style={[styles.welcomeTitle, { color: theme.textPrimary }]}>No templates yet</Text>
                  <Text style={[styles.welcomeDesc, { color: theme.textSecondary }]}>
                    Save a workout as a template from history or after finishing a session.
                  </Text>
                </Card>
              ) : (
                (() => {
                  const todayDayOfWeek = new Date().getDay();
                  const todayStr = new Date().toDateString();
                  const lastSameDayLog = [...history]
                    .filter((log) => {
                      const logDate = new Date(log.date);
                      return logDate.getDay() === todayDayOfWeek && logDate.toDateString() !== todayStr;
                    })
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

                  const targetName = lastSameDayLog ? lastSameDayLog.name.toLowerCase() : null;

                  const defaultOrder = ['tmpl-push', 'tmpl-pull', 'tmpl-legs', 'tmpl-upper', 'tmpl-full'];
                  const sortedList = [...templates].sort((a, b) => {
                    if (targetName) {
                      const matchA = a.name.toLowerCase() === targetName;
                      const matchB = b.name.toLowerCase() === targetName;
                      if (matchA && !matchB) return -1;
                      if (matchB && !matchA) return 1;
                    }
                    const idxA = defaultOrder.indexOf(a.id);
                    const idxB = defaultOrder.indexOf(b.id);
                    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
                    if (idxA !== -1) return -1;
                    if (idxB !== -1) return 1;
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                  });
                  return sortedList.map((tmpl) => {
                    const sortedExercises = sortTemplateExercises(tmpl.exercises);
                    const sessionMuscles: MuscleGroup[] = [];
                    const muscleSetCounts: Record<string, number> = {};
                    sortedExercises.forEach((logEx) => {
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
                    const firstEx = tmpl.exercises[0];
                    const firstExDetails = firstEx ? exercises.find((e) => e.id === firstEx.exerciseId) : null;
                    const primaryMuscle = firstExDetails ? firstExDetails.muscleGroup : 'Chest';
                    const muscleColor = categoryColors[primaryMuscle] || '#10B981';
                    return (
                      <TouchableOpacity
                        key={tmpl.id}
                        onLayout={(event) => {
                          templateLayouts.current[tmpl.id] = event.nativeEvent.layout.y;
                        }}
                        onPress={() => handleUseTemplate(tmpl)}
                        activeOpacity={0.85}
                      >
                        <Card
                          style={[
                            styles.historyLogCard,
                            {
                              padding: 12,
                              borderLeftWidth: 4,
                              borderLeftColor: muscleColor,
                              backgroundColor: theme.cardBg,
                              borderColor: tmpl.id === highlightedTemplateId ? muscleColor : theme.borderColor,
                              borderWidth: tmpl.id === highlightedTemplateId ? 2 : 1,
                            }
                          ]}
                        >
                          <View style={[styles.historyCardHeader, { marginBottom: 8 }]}>
                            <View style={styles.historyTitleCol}>
                              <Text style={[styles.historySessionName, { color: theme.textPrimary, fontSize: 15 }]}>{tmpl.name}</Text>
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
                          <View style={[styles.historySetsReceipt, { borderTopColor: theme.borderColor, paddingVertical: 6, marginBottom: 6 }]}>
                            <Text style={[styles.historySummaryText, { color: theme.textSecondary }]} numberOfLines={1}>
                              {muscleSetsString}
                            </Text>
                          </View>
                          <View style={[styles.historyFooter, { borderTopColor: theme.borderColor, paddingTop: 8 }]}>
                            <View style={styles.historyBadgeRow}>
                              {uniqueMuscles.map((m) => (
                                <MuscleBadge key={m} muscleGroup={m} size="sm" />
                              ))}
                            </View>
                            <TouchableOpacity
                              style={styles.templateStartBtn}
                              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                              onPress={async () => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                await incrementTemplateUsage(tmpl.id);
                                const sortedExercises = sortTemplateExercises(tmpl.exercises);
                                const exercisesToLoad = sortedExercises.map((logEx) => ({
                                  exerciseId: logEx.exerciseId,
                                  sets: logEx.sets.map((s) => ({ ...s, id: generateId(), isCompleted: false })),
                                  notes: logEx.notes,
                                }));
                                const now = Date.now();
                                setActiveSessionExercises(exercisesToLoad);
                                setSessionStartTime(now);
                                setSessionStartedFromTemplate(true);
                                setSessionTemplateId(tmpl.id);
                                setActiveSegment('log');
                                AsyncStorage.setItem('@active_session_exercises', JSON.stringify(exercisesToLoad));
                                AsyncStorage.setItem('@session_start_time', String(now));
                                AsyncStorage.setItem('@session_started_from_template', 'true');
                                AsyncStorage.setItem('@session_template_id', tmpl.id);
                              }}
                              activeOpacity={0.7}
                            >
                              <Text style={styles.templateStartBtnText}>START</Text>
                            </TouchableOpacity>
                          </View>
                        </Card>
                      </TouchableOpacity>
                    );
                  });
                })()
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
              onStartWorkout={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveSegment('log');
              }}
            />
          )}
          </Animated.View>
        </ScrollView>

        {/* Muscle Workout list popup modal */}
        <Modal
          visible={selectedModalMuscle !== null}
          animationType="none"
          presentationStyle="overFullScreen"
          statusBarTranslucent={true}
          onRequestClose={() => {
            if (exerciseToDelete !== null) {
              setExerciseToDelete(null);
              return;
            }
            if (editingModalExerciseId) {
              if (loggingMode === 'live') {
                const setsToSave = activeSets.map((s) => ({
                  ...s,
                  isCompleted: s.weight > 0 && s.reps > 0 ? true : s.isCompleted,
                }));
                const existingIdx = activeSessionExercises.findIndex((le) => le.exerciseId === editingModalExerciseId);
                let updated: LoggedExercise[];
                if (existingIdx !== -1) {
                  updated = activeSessionExercises.map((le, idx) =>
                    idx === existingIdx ? { ...le, sets: setsToSave, notes: exerciseNote.trim() || undefined } : le
                  );
                } else {
                  updated = [
                    ...activeSessionExercises,
                    { id: generateId(), exerciseId: editingModalExerciseId, sets: setsToSave, notes: exerciseNote.trim() || undefined },
                  ];
                }
                setActiveSessionExercises(updated);
                AsyncStorage.setItem('@active_session_exercises', JSON.stringify(updated));
              }
              setEditingModalExerciseId(null);
              return;
            }
            setSelectedModalMuscle(null);
            setSelectedSubGroup(null);
            setSelectedPickerExerciseIds(new Set());
            if (fromTemplateList) {
              setTemplateListVisible(true);
            }
            setCameFromActiveSessionPlus(false);
            setCameFromReplaceTarget(null);
          }}
        >
          <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
            <View
              style={[
                styles.modalInnerContainer,
                {
                  paddingTop: insets.top,
                  paddingBottom: insets.bottom,
                  paddingLeft: insets.left,
                  paddingRight: insets.right,
                },
              ]}
            >
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.modalKeyboardContainer}
              >
                {/* Workout List (Always mounted to preserve scroll position) */}
                <View style={{ flex: 1 }}>
                {/* Modal Header */}
                <View style={[styles.modalHeaderMinimal, { flexDirection: 'column', alignItems: 'stretch', gap: 6, paddingBottom: 10 }]}>
                  {/* Top Row: Title + Add & Close */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text
                      style={[styles.modalHeaderTitle, { color: theme.textPrimary, flex: 1, marginRight: 12 }]}
                      numberOfLines={1}
                    >
                      {cameFromReplaceTarget
                        ? `Replace: ${cameFromReplaceTarget.name}`
                        : (selectedSubGroup || selectedModalMuscle || '')}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <TouchableOpacity
                        onPress={() => {
                          setNewExerciseName(search.trim() || '');
                          setAddExerciseVisible(true);
                        }}
                        activeOpacity={0.7}
                        style={styles.modalAddExercisePill}
                      >
                        <Plus size={12} color="#10B981" strokeWidth={2.5} />
                        <Text style={styles.modalAddExercisePillText}>
                          ADD
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => {
                          setSelectedModalMuscle(null);
                          setSelectedSubGroup(null);
                          setSelectedPickerExerciseIds(new Set());
                          if (fromTemplateList) {
                            setTemplateListVisible(true);
                          }
                          setCameFromActiveSessionPlus(false);
                          setCameFromReplaceTarget(null);
                        }}
                        activeOpacity={0.7}
                        style={styles.modalCloseIconButton}
                      >
                        <X size={20} color={theme.textSecondary} strokeWidth={2.2} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Subtitle */}
                  <Text
                    style={[styles.modalHeaderSubtitle, { color: theme.textSecondary, marginTop: 0 }]}
                    numberOfLines={1}
                  >
                    {cameFromReplaceTarget
                      ? 'Select replacement workout'
                      : loggingMode === 'live'
                      ? 'Select exercises to build your session'
                      : 'Select an exercise to log'}
                  </Text>
                </View>

                {/* Top Horizontal Muscle Switcher with Smooth Centering & Edge Fades */}
                <View style={styles.modalSwitcherRow}>
                  <View style={styles.switcherLeftFade} pointerEvents="none">
                    <Svg height="100%" width="100%">
                      <Defs>
                        <SvgGradient id="fadeLeft" x1="0" y1="0" x2="1" y2="0">
                          <Stop offset="0" stopColor={theme.background} stopOpacity="1" />
                          <Stop offset="1" stopColor={theme.background} stopOpacity="0" />
                        </SvgGradient>
                      </Defs>
                      <Rect x="0" y="0" width="100%" height="100%" fill="url(#fadeLeft)" />
                    </Svg>
                  </View>
                  <View style={styles.switcherRightFade} pointerEvents="none">
                    <Svg height="100%" width="100%">
                      <Defs>
                        <SvgGradient id="fadeRight" x1="0" y1="0" x2="1" y2="0">
                          <Stop offset="0" stopColor={theme.background} stopOpacity="0" />
                          <Stop offset="1" stopColor={theme.background} stopOpacity="1" />
                        </SvgGradient>
                      </Defs>
                      <Rect x="0" y="0" width="100%" height="100%" fill="url(#fadeRight)" />
                    </Svg>
                  </View>

                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.modalSwitcherScroll}
                    keyboardShouldPersistTaps="handled"
                  >
                    {ALL_MUSCLE_GROUPS.map((m) => {
                      const isActive = selectedModalMuscle === m;
                      const activeColor = categoryColors[m] || '#10B981';

                      return (
                        <TouchableOpacity
                          key={m}
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
                            setSelectedModalMuscle(m);
                            setSelectedSubGroup(null);
                            setSearch('');
                            setExpandedExerciseId(null);
                            setSortedExerciseList(sortExercisesForMuscle(m));
                          }}
                          activeOpacity={0.8}
                        >
                          <Text
                            style={[
                              styles.modalSwitcherPillText,
                              { color: isActive ? activeColor : theme.textSecondary },
                            ]}
                          >
                            {m.toUpperCase()}
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
                    placeholder="Search workouts..."
                    placeholderTextColor={theme.inputPlaceholder}
                    value={search}
                    onChangeText={setSearch}
                    autoCorrect={false}
                  />
                </View>

                {/* Mode Selector Button (Focus Mode / Live Session) */}
                {!cameFromReplaceTarget && (
                  <View style={{ paddingHorizontal: 24, marginBottom: 14 }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: isDarkMode ? '#13141C' : '#F3F4F6',
                        borderRadius: 14,
                        padding: 4,
                        borderWidth: 1,
                        borderColor: isDarkMode ? '#222533' : theme.borderColor,
                        gap: 6,
                      }}
                    >
                      {/* Focus Mode Button */}
                      <TouchableOpacity
                        onPress={() => {
                          if (loggingMode !== 'post_workout') {
                            handleSetLoggingMode('post_workout');
                          }
                        }}
                        activeOpacity={0.7}
                        style={{
                          flex: 1,
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 7,
                          paddingVertical: 10,
                          borderRadius: 11,
                          backgroundColor: loggingMode === 'post_workout'
                            ? (isDarkMode ? '#1D4ED8' : '#2563EB')
                            : 'transparent',
                          shadowColor: loggingMode === 'post_workout' ? '#2563EB' : 'transparent',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: loggingMode === 'post_workout' ? 0.35 : 0,
                          shadowRadius: 4,
                          elevation: loggingMode === 'post_workout' ? 2 : 0,
                        }}
                      >
                        <View
                          style={{
                            width: 7,
                            height: 7,
                            borderRadius: 4,
                            backgroundColor: loggingMode === 'post_workout' ? '#93C5FD' : '#6B7280',
                          }}
                        />
                        <Text
                          style={{
                            fontSize: 12,
                            fontWeight: loggingMode === 'post_workout' ? '800' : '600',
                            color: loggingMode === 'post_workout' ? '#FFFFFF' : theme.textSecondary,
                            letterSpacing: 0.5,
                          }}
                        >
                          FOCUS MODE
                        </Text>
                      </TouchableOpacity>

                      {/* Live Session Button */}
                      <TouchableOpacity
                        onPress={() => {
                          if (loggingMode !== 'live') {
                            handleSetLoggingMode('live');
                          }
                        }}
                        activeOpacity={0.7}
                        style={{
                          flex: 1,
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 7,
                          paddingVertical: 10,
                          borderRadius: 11,
                          backgroundColor: loggingMode === 'live'
                            ? '#10B981'
                            : 'transparent',
                          shadowColor: loggingMode === 'live' ? '#10B981' : 'transparent',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: loggingMode === 'live' ? 0.35 : 0,
                          shadowRadius: 4,
                          elevation: loggingMode === 'live' ? 2 : 0,
                        }}
                      >
                        <View
                          style={{
                            width: 7,
                            height: 7,
                            borderRadius: 4,
                            backgroundColor: loggingMode === 'live' ? '#A7F3D0' : '#6B7280',
                          }}
                        />
                        <Text
                          style={{
                            fontSize: 12,
                            fontWeight: loggingMode === 'live' ? '800' : '600',
                            color: loggingMode === 'live' ? '#FFFFFF' : theme.textSecondary,
                            letterSpacing: 0.5,
                          }}
                        >
                          LIVE SESSION
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* Exercises List */}
                <SectionList
                  key={selectedModalMuscle || 'all'}
                  sections={exerciseSections}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={[
                    styles.modalListContent,
                    {
                      paddingBottom: (insets.bottom > 0 ? insets.bottom : 16) + 110,
                    },
                  ]}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  stickySectionHeadersEnabled={false}
                  initialNumToRender={20}
                  maxToRenderPerBatch={20}
                  windowSize={11}
                  removeClippedSubviews={false}
                  renderSectionHeader={({ section }) => (
                    <View style={styles.modalSectionHeader}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={[styles.modalSectionHeaderText, { color: theme.textSecondary }]}>
                          {section.title.toUpperCase()}
                        </Text>
                        {section.title === 'Added Workouts' && (
                          <Text style={{ fontSize: 10, fontWeight: '500', color: theme.textSecondary, opacity: 0.65, letterSpacing: 0.2 }}>
                            (hold to delete)
                          </Text>
                        )}
                      </View>
                      <View style={[styles.modalSectionHeaderLine, { backgroundColor: theme.borderColor }]} />
                    </View>
                  )}
                  renderItem={({ item, section }) => {
                    const liveEx = exercises.find((e) => e.id === item.id);
                    const isFav = liveEx?.isFavorite ?? false;
                    const itemInstrument = item.instrument || 'Other';
                    const itemColor = sectionColorMap[section?.title || ''] || '#6B7280';

                    return (
                      <View
                        style={[
                          styles.modalExerciseItem,
                          { backgroundColor: theme.cardBg, borderColor: theme.borderColor },
                        ]}
                      >
                        <TouchableOpacity
                          style={styles.modalExerciseMainClick}
                          onPress={() => {
                            if (cameFromReplaceTarget) {
                              handleAddReplacementFromPicker(item.id);
                              return;
                            }

                            if (fromTemplateList || loggingMode === 'live') {
                              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
                                initialSets.push({
                                  id: set.id,
                                  weight: set.weight,
                                  reps: set.reps,
                                  isCompleted: fromTemplateList ? true : set.isCompleted,
                                });
                              });
                            } else {
                              const previousLog = getPreviousWorkoutForExercise(item.id);
                              if (previousLog && previousLog.sets.length > 0) {
                                previousLog.sets.forEach((set) => {
                                  initialSets.push({
                                    id: generateId(),
                                    weight: set.weight,
                                    reps: set.reps,
                                    isCompleted: false,
                                  });
                                });
                              }

                              while (initialSets.length < 3) {
                                const lastSet = initialSets.length > 0 ? initialSets[initialSets.length - 1] : null;
                                initialSets.push({
                                  id: generateId(),
                                  weight: lastSet ? lastSet.weight : 0,
                                  reps: lastSet ? lastSet.reps : 0,
                                  isCompleted: false,
                                });
                              }
                            }
                            if (fromTemplateList) {
                              setActiveSets(initialSets);
                              setSameForAll(true);
                              setExerciseNote(existingInActive?.notes || '');
                              setExpandedExerciseId(item.id);
                              setSelectedModalMuscle(null);
                              setSelectedSubGroup(null);
                            } else {
                              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                              setActiveSets(initialSets);
                              setSameForAll(true);
                              setExerciseNote(existingInActive?.notes || '');
                              setEditingModalExerciseId(item.id);
                            }
                          }}
                          onLongPress={() => {
                            if (item.isCustom) {
                              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                              setExerciseToDelete({ id: item.id, name: item.name });
                            }
                          }}
                          delayLongPress={450}
                          activeOpacity={0.65}
                        >
                          {(fromTemplateList || loggingMode === 'live') && (
                            <View
                              style={[
                                styles.modalExerciseCheckbox,
                                {
                                  borderColor: selectedPickerExerciseIds.has(item.id) ? '#10B981' : theme.borderColor,
                                  backgroundColor: selectedPickerExerciseIds.has(item.id) ? '#10B981' : 'transparent',
                                },
                              ]}
                            >
                              {selectedPickerExerciseIds.has(item.id) && <Check size={11} color="#FFFFFF" strokeWidth={3} />}
                            </View>
                          )}

                          <View style={[styles.activeSessionItemAccent, { backgroundColor: itemColor }]} />

                          <View style={{ flex: 1, marginRight: 8 }}>
                            <Text
                              style={[styles.modalExerciseName, { color: theme.textPrimary }]}
                              numberOfLines={1}
                            >
                              {item.name}
                            </Text>
                            {(() => {
                              const activeEntry = activeSessionExercises.find((le) => le.exerciseId === item.id);
                              if (!activeEntry) return null;
                              return (
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                                  <Check size={11} color="#10B981" strokeWidth={2.5} />
                                  <Text style={{ fontSize: 11, fontWeight: '600', color: '#10B981' }}>
                                    {activeEntry.sets.length} set{activeEntry.sets.length > 1 ? 's' : ''} in session
                                  </Text>
                                </View>
                              );
                            })()}
                          </View>

                          <View style={[styles.activeSessionMuscleBadge, { backgroundColor: `${itemColor}18` }]}>
                            <Text style={[styles.activeSessionMuscleBadgeText, { color: itemColor }]}>
                              {itemInstrument.toUpperCase()}
                            </Text>
                          </View>
                        </TouchableOpacity>

                        <View style={styles.modalExerciseActions}>
                          <TouchableOpacity
                            style={styles.modalExerciseActionBtn}
                            onPress={() => {
                              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                              toggleFavoriteExercise(item.id);
                            }}
                            hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
                            activeOpacity={0.7}
                          >
                            <Star
                              size={17}
                              color={isFav ? '#FF8A00' : (POPULAR_EXERCISE_IDS.includes(item.id) ? '#9CA3AF' : theme.textSecondary)}
                              fill={isFav ? '#FF8A00' : (POPULAR_EXERCISE_IDS.includes(item.id) ? '#9CA3AF' : 'transparent')}
                              strokeWidth={isFav ? 2.2 : 1.8}
                            />
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  }}
                  ListEmptyComponent={
                    <View style={{ paddingVertical: 24, alignItems: 'center' }}>
                      <Text style={{ fontSize: 13, color: theme.textSecondary, fontStyle: 'italic', marginBottom: 12, textAlign: 'center' }}>
                        {search.trim() ? `No workouts found matching "${search.trim()}"` : 'No workouts in this section'}
                      </Text>
                      <TouchableOpacity
                        activeOpacity={0.6}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          setNewExerciseName(search.trim());
                          setAddExerciseVisible(true);
                        }}
                        style={[
                          styles.modalExerciseItem,
                          {
                            width: '100%',
                            backgroundColor: theme.cardBg,
                            borderColor: theme.borderColor,
                          },
                        ]}
                      >
                        <View style={[styles.activeSessionItemAccent, { backgroundColor: currentMuscleColor }]} />
                        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 7, paddingVertical: 4 }}>
                          <Plus size={14} color={currentMuscleColor} strokeWidth={2.5} />
                          <Text
                            style={[
                              styles.modalExerciseName,
                              { color: theme.textSecondary, fontSize: 13, fontWeight: '600' },
                            ]}
                            numberOfLines={1}
                          >
                            {search.trim() ? `Add "${search.trim()}" to library...` : `Add new ${selectedModalMuscle || ''} exercise...`}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  }
                  ListFooterComponent={
                    exerciseSections.length > 0 ? (
                      <TouchableOpacity
                        activeOpacity={0.6}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          setNewExerciseName(search.trim());
                          setAddExerciseVisible(true);
                        }}
                        style={[
                          styles.modalExerciseItem,
                          {
                            backgroundColor: theme.cardBg,
                            borderColor: theme.borderColor,
                            marginTop: 4,
                            marginBottom: 16,
                          },
                        ]}
                      >
                        <View style={[styles.activeSessionItemAccent, { backgroundColor: currentMuscleColor }]} />
                        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 7, paddingVertical: 4 }}>
                          <Plus size={14} color={currentMuscleColor} strokeWidth={2.5} />
                          <Text
                            style={[
                              styles.modalExerciseName,
                              { color: theme.textSecondary, fontSize: 13, fontWeight: '600' },
                            ]}
                            numberOfLines={1}
                          >
                            {search.trim() ? `Add "${search.trim()}" to library...` : `Add new ${selectedModalMuscle || ''} exercise...`}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ) : null
                  }
                />

                {/* Modal Sticky Footer if active session is not empty in post-workout mode */}
                {loggingMode === 'post_workout' && activeSessionExercises.length > 0 && !fromTemplateList && (
                  <View style={[styles.modalStickyFooter, { backgroundColor: theme.cardBg, borderTopColor: theme.borderColor }]}>
                    <Text style={[styles.modalFooterText, { color: theme.textPrimary }]} numberOfLines={1}>
                      {activeSessionExercises.length} {activeSessionExercises.length === 1 ? 'exercise' : 'exercises'} in session
                    </Text>
                    <TouchableOpacity
                      style={[styles.modalFinishBtn, { backgroundColor: '#10B981' }]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setSelectedModalMuscle(null);
                        setSelectedSubGroup(null);
                        setActiveSegment('log');
                      }}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.modalFinishBtnText}>VIEW SESSION</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Modal Sticky Footer in Live mode */}
                {loggingMode === 'live' && !fromTemplateList && (selectedPickerExerciseIds.size > 0 || activeSessionExercises.length > 0) && (
                  <View style={[styles.modalStickyFooter, { backgroundColor: theme.cardBg, borderTopColor: theme.borderColor }]}>
                    <Text style={[styles.modalFooterText, { color: theme.textPrimary }]} numberOfLines={1}>
                      {selectedPickerExerciseIds.size > 0
                        ? `${selectedPickerExerciseIds.size} Exercise${selectedPickerExerciseIds.size !== 1 ? 's' : ''} Selected`
                        : `${activeSessionExercises.length} ${activeSessionExercises.length === 1 ? 'exercise' : 'exercises'} in session`}
                    </Text>
                    <TouchableOpacity
                      style={[
                        styles.modalFinishBtn,
                        {
                          backgroundColor: selectedPickerExerciseIds.size > 0 || activeSessionExercises.length > 0 ? '#10B981' : theme.borderColor
                        }
                      ]}
                      onPress={async () => {
                        if (selectedPickerExerciseIds.size === 0) {
                          if (activeSessionExercises.length > 0) {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            const first = activeSessionExercises[0];
                            setActiveSets(first.sets.map((s) => ({ ...s })));
                            setExerciseNote(first.notes || '');
                            setShowNoteInput(!!first.notes);
                            setSameForAll(true);
                            setEditingModalExerciseId(first.exerciseId);
                          }
                          return;
                        }

                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                        const newExercises: LoggedExercise[] = [];
                        selectedPickerExerciseIds.forEach((id) => {
                          if (activeSessionExercises.some(e => e.exerciseId === id)) return;

                          const previousLog = getPreviousWorkoutForExercise(id);
                          const initialSets: WorkoutSet[] = [];
                          if (previousLog && previousLog.sets.length > 0) {
                            previousLog.sets.forEach((set) => {
                              initialSets.push({ id: generateId(), weight: set.weight, reps: set.reps, isCompleted: false });
                            });
                          }

                          while (initialSets.length < 3) {
                            const lastSet = initialSets.length > 0 ? initialSets[initialSets.length - 1] : null;
                            initialSets.push({
                              id: generateId(),
                              weight: lastSet ? lastSet.weight : 0,
                              reps: lastSet ? lastSet.reps : 0,
                              isCompleted: false,
                            });
                          }
                          newExercises.push({
                            id: generateId(),
                            exerciseId: id,
                            sets: initialSets,
                          });
                        });

                        let updatedList = [...activeSessionExercises];
                        if (newExercises.length > 0) {
                          updatedList = [...activeSessionExercises, ...newExercises];
                          setActiveSessionExercises(updatedList);
                          AsyncStorage.setItem('@active_session_exercises', JSON.stringify(updatedList));
                        }

                        if (sessionStartTime === 0) {
                          const now = Date.now();
                          setSessionStartTime(now);
                          AsyncStorage.setItem('@session_start_time', now.toString());
                        }

                        // Open first exercise directly into the full-screen modal logger!
                        const firstToOpen = newExercises[0] || updatedList[0];
                        if (firstToOpen) {
                          setActiveSets(firstToOpen.sets.map((s) => ({ ...s })));
                          setExerciseNote(firstToOpen.notes || '');
                          setShowNoteInput(!!firstToOpen.notes);
                          setSameForAll(true);
                          setEditingModalExerciseId(firstToOpen.exerciseId);
                        }
                        setSelectedPickerExerciseIds(new Set());
                      }}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.modalFinishBtnText}>
                        {selectedPickerExerciseIds.size > 0
                          ? (activeSessionExercises.length > 0
                              ? `ADD TO WORKOUT (${selectedPickerExerciseIds.size})`
                              : `START WORKOUT (${selectedPickerExerciseIds.size})`)
                          : 'VIEW SESSION'}
                      </Text>
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
                          }

                          while (initialSets.length < 3) {
                            const lastSet = initialSets.length > 0 ? initialSets[initialSets.length - 1] : null;
                            initialSets.push({
                              id: generateId(),
                              weight: lastSet ? lastSet.weight : 0,
                              reps: lastSet ? lastSet.reps : 0,
                              isCompleted: false,
                            });
                          }
                          newExercises.push({
                            id: generateId(),
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
                </View>

                {/* Workout Logging Overlay Sheet */}
                {editingModalExerciseId !== null && (
                  (() => {
                    const targetEx = exercises.find((e) => e.id === editingModalExerciseId);
                    if (!targetEx) return null;
                    const muscleColor = categoryColors[targetEx.muscleGroup] || '#10B981';

                    const prFromState = getExercisePR(targetEx.id);
                    let pr = prFromState;
                    if (!pr) {
                      let max1RM = 0;
                      let bestWeight = 0;
                      let bestReps = 0;
                      let bestDate = '';
                      for (const session of history) {
                        const logEx = session.exercises.find((e) => e.exerciseId === targetEx.id);
                        if (logEx) {
                          for (const set of logEx.sets) {
                            if (set.weight > 0 && set.reps > 0) {
                              const e1RM = set.weight * (1 + set.reps / 30);
                              if (e1RM > max1RM) {
                                max1RM = e1RM;
                                bestWeight = set.weight;
                                bestReps = set.reps;
                                bestDate = session.date;
                              }
                            }
                          }
                        }
                      }
                      if (bestWeight > 0) {
                        pr = { exerciseId: targetEx.id, weight: bestWeight, reps: bestReps, date: bestDate, estimatedOneRM: max1RM };
                      }
                    }
                    const formattedDate = pr ? new Date(pr.date).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    }) : '';

                    const isLiveLogger = loggingMode === 'live';
                    const ContentWrapper = isLiveLogger ? View : Card;
                    const contentWrapperProps = isLiveLogger
                      ? { style: { flex: 1, paddingBottom: 16 } }
                      : { style: [styles.activeSessionCard, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }] };

                    return (
                      <View style={[StyleSheet.absoluteFill, { backgroundColor: isLiveLogger ? theme.cardBg : theme.background, zIndex: 50 }]}>
                        <ScrollView
                          ref={modalLoggerScrollRef}
                          style={{ flex: 1 }}
                          contentContainerStyle={{
                            paddingHorizontal: 16,
                            paddingTop: insets.top > 0 ? insets.top + 16 : 24,
                            paddingBottom: (insets.bottom > 0 ? insets.bottom + 24 : 32) + (showNoteInput ? 120 : 0),
                          }}
                          keyboardShouldPersistTaps="handled"
                          automaticallyAdjustKeyboardInsets={true}
                          showsVerticalScrollIndicator={false}
                        >
                          {/* Live Mode Top Header: Minimize on left, Rest Timer on right */}
                          {isLiveLogger && (
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                              <TouchableOpacity
                                onPress={() => {
                                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                  if (editingModalExerciseId) {
                                    const setsToSave = activeSets.map((s) => ({
                                      ...s,
                                      isCompleted: s.weight > 0 && s.reps > 0 ? true : s.isCompleted,
                                    }));
                                    const existingIdx = activeSessionExercises.findIndex((le) => le.exerciseId === editingModalExerciseId);
                                    let updated: LoggedExercise[];
                                    if (existingIdx !== -1) {
                                      updated = activeSessionExercises.map((le, idx) =>
                                        idx === existingIdx ? { ...le, sets: setsToSave, notes: exerciseNote.trim() || undefined } : le
                                      );
                                    } else {
                                      updated = [
                                        ...activeSessionExercises,
                                        { id: generateId(), exerciseId: editingModalExerciseId, sets: setsToSave, notes: exerciseNote.trim() || undefined },
                                      ];
                                    }
                                    setActiveSessionExercises(updated);
                                    AsyncStorage.setItem('@active_session_exercises', JSON.stringify(updated));
                                  }
                                  setEditingModalExerciseId(null);
                                  setSelectedModalMuscle(null);
                                  setSelectedSubGroup(null);
                                  setActiveSegment('log');
                                }}
                                activeOpacity={0.7}
                                style={{
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                  gap: 6,
                                  paddingVertical: 8,
                                  paddingHorizontal: 14,
                                  borderRadius: 99,
                                  backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.06)' : '#F3F4F6',
                                  borderWidth: 1,
                                  borderColor: theme.borderColor,
                                }}
                              >
                                <ChevronDown size={14} color={theme.textSecondary} strokeWidth={2.4} />
                                <Text style={{ fontSize: 11, fontWeight: '700', color: theme.textSecondary, letterSpacing: 0.3 }}>
                                  MINIMIZE
                                </Text>
                              </TouchableOpacity>

                              {/* Rest Timer Button / Active Countdown */}
                              {restTimerRunning ? (
                                <TouchableOpacity
                                  onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    setRestTimerVisible(true);
                                  }}
                                  activeOpacity={0.8}
                                  style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: 6,
                                    paddingVertical: 8,
                                    paddingHorizontal: 14,
                                    borderRadius: 99,
                                    backgroundColor: isDarkMode ? '#10B98125' : '#10B98118',
                                    borderWidth: 1,
                                    borderColor: '#10B981',
                                  }}
                                >
                                  <Timer size={13} color="#10B981" strokeWidth={2.4} />
                                  <Text style={{ fontSize: 12, fontWeight: '800', color: '#10B981', letterSpacing: 0.5 }}>
                                    {formatRestTime(restTimerSeconds)}
                                  </Text>
                                </TouchableOpacity>
                              ) : (
                                <TouchableOpacity
                                  onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    setRestTimerVisible(true);
                                  }}
                                  activeOpacity={0.7}
                                  style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: 6,
                                    paddingVertical: 8,
                                    paddingHorizontal: 14,
                                    borderRadius: 99,
                                    backgroundColor: isDarkMode ? 'rgba(56, 189, 248, 0.08)' : '#F0F9FF',
                                    borderWidth: 1,
                                    borderColor: isDarkMode ? 'rgba(56, 189, 248, 0.28)' : '#BAE6FD',
                                  }}
                                >
                                  <Timer size={13} color={isDarkMode ? '#38BDF8' : '#0284C7'} strokeWidth={2.4} />
                                  <Text style={{ fontSize: 11, fontWeight: '700', color: isDarkMode ? '#38BDF8' : '#0284C7', letterSpacing: 0.4 }}>
                                    REST TIMER
                                  </Text>
                                </TouchableOpacity>
                              )}
                            </View>
                          )}

                          {/* Selected Workouts Navigation Strip (Live Mode) */}
                          {isLiveLogger && activeSessionExercises.length > 1 && (
                            <View style={[styles.loggerNavPillWrap, { marginTop: 0, marginBottom: 22, gap: 8 }]}>
                              {activeSessionExercises.map((item, index) => {
                                const isSelected = item.exerciseId === editingModalExerciseId;
                                const exDetails = exercises.find((e) => e.id === item.exerciseId);
                                const rawName = exDetails?.name || 'Exercise';
                                const exName = getCompactNavName(rawName);
                                const mColor = exDetails ? categoryColors[exDetails.muscleGroup] || '#10B981' : '#10B981';
                                const hasCompletedSets = item.sets.some((s) => s.isCompleted || (s.weight > 0 && s.reps > 0));

                                return (
                                  <TouchableOpacity
                                    key={item.id || `${item.exerciseId}-${index}`}
                                    activeOpacity={0.7}
                                    onPress={() => handleSwitchModalExercise(item.exerciseId)}
                                    style={[
                                      styles.loggerNavPill,
                                      {
                                        backgroundColor: isSelected
                                          ? (isDarkMode ? `${mColor}25` : `${mColor}18`)
                                          : (isDarkMode ? '#1E1E28' : '#F3F4F6'),
                                        borderColor: isSelected ? mColor : theme.borderColor,
                                        borderWidth: isSelected ? 1.5 : 1,
                                        paddingHorizontal: 12,
                                        paddingVertical: 7,
                                        borderRadius: 10,
                                      }
                                    ]}
                                  >
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                      {hasCompletedSets ? (
                                        <Check size={11} color={isSelected ? mColor : '#10B981'} strokeWidth={3} />
                                      ) : (
                                        <Text style={[styles.loggerNavPillIndex, { color: isSelected ? mColor : theme.textSecondary }]}>
                                          {index + 1}
                                        </Text>
                                      )}
                                      <Text
                                        numberOfLines={1}
                                        ellipsizeMode="tail"
                                        style={[
                                          styles.loggerNavPillText,
                                          {
                                            color: isSelected ? (isDarkMode ? '#FFFFFF' : theme.textPrimary) : theme.textSecondary,
                                            fontWeight: isSelected ? '700' : '500',
                                          }
                                        ]}
                                      >
                                        {exName}
                                      </Text>
                                    </View>
                                  </TouchableOpacity>
                                );
                              })}
                            </View>
                          )}

                          <ContentWrapper {...contentWrapperProps}>
                            {/* Header */}
                            <View style={[styles.activeSessionHeader, { alignItems: 'flex-start' }]}>
                              <View style={{ flex: 1, paddingRight: 8 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                                  <View style={[styles.activeSessionItemAccent, { backgroundColor: muscleColor, height: 14, width: 3, borderRadius: 2 }]} />
                                  <Text style={[styles.activeSessionTitle, { color: theme.textPrimary, flexShrink: 1 }]} numberOfLines={1}>
                                    {targetEx.name}
                                  </Text>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginTop: 2 }}>
                                  <Text style={[styles.activeSessionSubtitle, { color: theme.textSecondary, marginTop: 0 }]}>
                                    {targetEx.muscleGroup.toUpperCase()} • {activeSets.length} set{activeSets.length !== 1 ? 's' : ''}
                                  </Text>
                                  {targetEx.target ? (
                                    <View style={{
                                      backgroundColor: `${muscleColor}14`,
                                      paddingHorizontal: 6,
                                      paddingVertical: 1.5,
                                      borderRadius: 4,
                                      borderWidth: 0.5,
                                      borderColor: `${muscleColor}28`,
                                    }}>
                                      <Text style={{ fontSize: 10, fontWeight: '600', color: muscleColor, letterSpacing: 0.1 }}>
                                        {targetEx.target}
                                      </Text>
                                    </View>
                                  ) : null}
                                </View>
                              </View>
                            <TouchableOpacity
                              onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                if (loggingMode === 'live') {
                                  if (editingModalExerciseId) {
                                    const setsToSave = activeSets.map((s) => ({
                                      ...s,
                                      isCompleted: s.weight > 0 && s.reps > 0 ? true : s.isCompleted,
                                    }));
                                    const existingIdx = activeSessionExercises.findIndex((le) => le.exerciseId === editingModalExerciseId);
                                    let updated: LoggedExercise[];
                                    if (existingIdx !== -1) {
                                      updated = activeSessionExercises.map((le, idx) =>
                                        idx === existingIdx ? { ...le, sets: setsToSave, notes: exerciseNote.trim() || undefined } : le
                                      );
                                    } else {
                                      updated = [
                                        ...activeSessionExercises,
                                        { id: generateId(), exerciseId: editingModalExerciseId, sets: setsToSave, notes: exerciseNote.trim() || undefined },
                                      ];
                                    }
                                    setActiveSessionExercises(updated);
                                    AsyncStorage.setItem('@active_session_exercises', JSON.stringify(updated));
                                  }
                                  setEditingModalExerciseId(null);
                                  setSelectedModalMuscle(null);
                                  setSelectedSubGroup(null);
                                  setActiveSegment('log');
                                  return;
                                }
                                setEditingModalExerciseId(null);
                              }}
                              activeOpacity={0.6}
                              style={{ padding: 6 }}
                              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            >
                              <X size={18} color={theme.textSecondary} strokeWidth={2.5} />
                            </TouchableOpacity>
                          </View>

                          <View style={{ marginVertical: 6 }}>
                            {/* Best PR banner if available */}
                            {pr && (
                              <View
                                style={{
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.03)' : '#F9FAFB',
                                  borderWidth: 1,
                                  borderColor: theme.borderColor,
                                  borderRadius: 8,
                                  paddingHorizontal: 10,
                                  paddingVertical: 7,
                                  marginBottom: 10,
                                }}
                              >
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                  <Trophy size={13} color="#10B981" strokeWidth={2} />
                                  <Text style={{ fontSize: 9, fontWeight: '800', color: '#10B981', letterSpacing: 0.8 }}>
                                    BEST
                                  </Text>
                                  <Text style={{ fontSize: 13, fontWeight: '800', color: theme.textPrimary, marginLeft: 2 }}>
                                    {pr.weight} <Text style={{ fontSize: 10, fontWeight: '600', color: theme.textSecondary }}>kg</Text> × {pr.reps} <Text style={{ fontSize: 10, fontWeight: '600', color: theme.textSecondary }}>reps</Text>
                                  </Text>
                                </View>
                                {formattedDate ? (
                                  <Text style={{ fontSize: 11, fontWeight: '500', color: theme.textSecondary }}>
                                    {formattedDate}
                                  </Text>
                                ) : null}
                              </View>
                            )}

                            {/* Same for all sets toggle */}
                            <TouchableOpacity
                              style={[styles.exerciseLoggerOptionRow, { paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.borderColor, marginBottom: 8 }]}
                              onPress={toggleSameForAll}
                              activeOpacity={0.8}
                            >
                              <View style={{ flex: 1, paddingRight: 8 }}>
                                <Text style={[styles.optionsTitle, { color: theme.textPrimary, fontSize: 13 }]}>Same for all sets</Text>
                                <Text style={[styles.optionsSubtitle, { color: theme.textSecondary, fontSize: 11 }]}>
                                  Sync weight and reps automatically
                                </Text>
                              </View>
                              <View
                                style={[
                                  styles.switchTrack,
                                  sameForAll
                                    ? { backgroundColor: muscleColor, alignItems: 'flex-end' }
                                    : { backgroundColor: '#D1D5DB', alignItems: 'flex-start' }
                                ]}
                              >
                                <View style={styles.switchThumb} />
                              </View>
                            </TouchableOpacity>

                            {/* Set row labels */}
                            <View style={styles.setRowLabels}>
                              <Text style={[styles.labelCol, styles.widthSet, { color: theme.textPrimary }]}>SET</Text>
                              <Text style={[styles.labelCol, styles.widthWeight, { color: theme.textSecondary }]}>WEIGHT</Text>
                              <Text style={[styles.labelCol, styles.widthReps, { color: theme.textSecondary }]}>REPS</Text>
                              <View style={styles.widthActions} />
                            </View>

                            {/* Sets */}
                            {activeSets.map((set, index) => (
                              <View key={set.id} style={[styles.setRow, { borderBottomColor: theme.borderColor, paddingVertical: 8 }]}>
                                <View style={styles.widthSet}>
                                  <Text style={[styles.setText, { color: theme.textPrimary }]}>{index + 1}</Text>
                                </View>
                                <View style={styles.widthWeight}>
                                  <IncrementInput
                                    value={set.weight}
                                    step={2.5}
                                    allowDecimals={true}
                                    onChange={(val) => handleUpdateSet(set.id, { weight: val })}
                                    placeholder="kg"
                                    accentColor={muscleColor}
                                    style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder }}
                                    textColor={theme.textPrimary}
                                  />
                                </View>
                                <View style={styles.widthReps}>
                                  <IncrementInput
                                    value={set.reps}
                                    step={1}
                                    allowDecimals={false}
                                    onChange={(val) => handleUpdateSet(set.id, { reps: val })}
                                    placeholder="reps"
                                    accentColor={muscleColor}
                                    style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder }}
                                    textColor={theme.textPrimary}
                                  />
                                </View>
                                <View style={styles.widthActions}>
                                  {index === activeSets.length - 1 && activeSets.length > 1 && (
                                    <TouchableOpacity
                                      style={styles.setDeleteBtn}
                                      onPress={() => handleRemoveSet(set.id)}
                                      activeOpacity={0.6}
                                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                    >
                                      <Trash2 size={12} color="#EF4444" strokeWidth={2} />
                                    </TouchableOpacity>
                                  )}
                                </View>
                              </View>
                            ))}

                            {/* Action Buttons: Add Set & Collapsible Note */}
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 8 }}>
                              <TouchableOpacity
                                style={[
                                  styles.addSetBtn,
                                  {
                                    flex: 1,
                                    height: 38,
                                    borderRadius: 99,
                                    borderWidth: 1,
                                    borderColor: isDarkMode ? '#282A3A' : theme.borderColor,
                                    backgroundColor: isDarkMode ? '#13141C' : '#F9FAFB',
                                  }
                                ]}
                                onPress={() => handleAddSet(targetEx.id)}
                                activeOpacity={0.75}
                              >
                                <Plus size={13} color={theme.textSecondary} strokeWidth={2.5} />
                                <Text style={[styles.addSetBtnText, { color: theme.textSecondary }]}>
                                  ADD SET
                                </Text>
                              </TouchableOpacity>

                              {!showNoteInput && (
                                <TouchableOpacity
                                  style={[
                                    styles.addSetBtn,
                                    {
                                      paddingHorizontal: 16,
                                      height: 38,
                                      borderRadius: 99,
                                      borderWidth: 1,
                                      borderStyle: exerciseNote.trim() ? 'solid' : 'dashed',
                                      borderColor: exerciseNote.trim() ? '#10B98160' : (isDarkMode ? '#282A3A' : theme.borderColor),
                                      backgroundColor: exerciseNote.trim() ? (isDarkMode ? '#10B98115' : '#10B9810C') : (isDarkMode ? '#13141C' : '#F9FAFB'),
                                    }
                                  ]}
                                  onPress={() => {
                                    setShowNoteInput(true);
                                    setTimeout(() => {
                                      modalLoggerScrollRef.current?.scrollToEnd({ animated: true });
                                    }, 100);
                                  }}
                                  activeOpacity={0.75}
                                >
                                  <Text style={[styles.addSetBtnText, { color: exerciseNote.trim() ? '#10B981' : theme.textSecondary }]}>
                                    {exerciseNote.trim() ? 'NOTE ✓' : '+ NOTE'}
                                  </Text>
                                </TouchableOpacity>
                              )}
                            </View>

                            {/* Optional Note (Expands when needed) */}
                            {showNoteInput && (
                              <View style={{ marginTop: 4, marginBottom: 8 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                                  <Text style={{ fontSize: 10, fontWeight: '800', color: theme.textSecondary, letterSpacing: 0.6 }}>
                                    EXERCISE NOTE
                                  </Text>
                                  {!exerciseNote.trim() && (
                                    <TouchableOpacity
                                      onPress={() => setShowNoteInput(false)}
                                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                    >
                                      <Text style={{ fontSize: 10, color: theme.textSecondary, fontWeight: '700', letterSpacing: 0.4 }}>HIDE</Text>
                                    </TouchableOpacity>
                                  )}
                                </View>
                                <TextInput
                                  style={{
                                    backgroundColor: isDarkMode ? '#13141C' : '#F9FAFB',
                                    borderColor: isDarkMode ? '#282A3A' : theme.borderColor,
                                    borderWidth: 1,
                                    borderRadius: 12,
                                    paddingHorizontal: 12,
                                    paddingVertical: 8,
                                    color: theme.textPrimary,
                                    fontSize: 12,
                                    minHeight: 44,
                                    textAlignVertical: 'top',
                                  }}
                                  placeholder="Add an optional workout note..."
                                  placeholderTextColor={theme.inputPlaceholder}
                                  value={exerciseNote}
                                  onChangeText={setExerciseNote}
                                  onFocus={() => {
                                    setTimeout(() => {
                                      modalLoggerScrollRef.current?.scrollToEnd({ animated: true });
                                    }, 150);
                                  }}
                                  multiline
                                  maxLength={150}
                                  autoFocus={!exerciseNote}
                                />
                              </View>
                            )}
                          </View>

                          {/* Footer buttons */}
                          {loggingMode === 'live' ? (
                            <View style={{ gap: 8, marginTop: 8 }}>
                              <View style={{ flexDirection: 'row', gap: 8 }}>
                                <TouchableOpacity
                                  onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    handleSaveModalExercise();
                                  }}
                                  style={[
                                    styles.finishSessionBtn,
                                    {
                                      flex: 1,
                                      backgroundColor: isDarkMode ? '#1E1E28' : '#F3F4F6',
                                      borderWidth: 1,
                                      borderColor: theme.borderColor,
                                    }
                                  ]}
                                  activeOpacity={0.7}
                                >
                                  <Text style={[styles.finishSessionBtnText, { color: theme.textPrimary }]}>
                                    {(() => {
                                      const curIdx = activeSessionExercises.findIndex(le => le.exerciseId === editingModalExerciseId);
                                      if (curIdx !== -1 && curIdx < activeSessionExercises.length - 1) {
                                        return 'SAVE & NEXT';
                                      }
                                      return 'SAVE EXERCISE';
                                    })()}
                                  </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                  style={[styles.finishSessionBtn, { flex: 1, backgroundColor: '#10B981' }]}
                                  onPress={handleFinishFromModalLogger}
                                  activeOpacity={0.8}
                                >
                                  <Text style={[styles.finishSessionBtnText, { color: '#000000', fontWeight: '800' }]}>FINISH WORKOUT</Text>
                                </TouchableOpacity>
                              </View>
                            </View>
                          ) : (
                            <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
                              <TouchableOpacity
                                onPress={() => {
                                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                  setEditingModalExerciseId(null);
                                }}
                                style={[
                                  styles.finishSessionBtn,
                                  {
                                    flex: 1,
                                    backgroundColor: isDarkMode ? '#1E1E28' : '#F3F4F6',
                                    borderWidth: 1,
                                    borderColor: theme.borderColor,
                                  }
                                ]}
                                activeOpacity={0.7}
                              >
                                <Text style={[styles.finishSessionBtnText, { color: theme.textSecondary }]}>CANCEL</Text>
                              </TouchableOpacity>

                              <TouchableOpacity
                                style={[styles.finishSessionBtn, { flex: 1, backgroundColor: '#10B981' }]}
                                onPress={handleSaveModalExercise}
                                activeOpacity={0.8}
                              >
                                <Text style={styles.finishSessionBtnText}>SAVE</Text>
                              </TouchableOpacity>
                            </View>
                          )}
                        </ContentWrapper>
                      </ScrollView>
                      </View>
                    );
                  })()
                )}
              </KeyboardAvoidingView>
            </View>

            {/* Aesthetic Delete Custom Workout Confirmation Overlay */}
            {exerciseToDelete && (
              <View style={styles.modalDeleteOverlay}>
                <Pressable
                  style={StyleSheet.absoluteFill}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setExerciseToDelete(null);
                  }}
                />
                <View style={[styles.alertCard, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
                  <View style={[styles.alertIconWrapper, { backgroundColor: isDarkMode ? '#EF444415' : '#FEE2E2' }]}>
                    <Trash2 size={26} color="#EF4444" strokeWidth={2.2} />
                  </View>

                  <Text style={[styles.alertTitle, { color: theme.textPrimary }]}>
                    Delete Custom Workout
                  </Text>

                  <Text style={[styles.alertMessage, { color: theme.textSecondary }]}>
                    Are you sure you want to delete "{exerciseToDelete.name}" from your workout library?
                  </Text>

                  <View style={styles.alertButtonsRow}>
                    <TouchableOpacity
                      style={[
                        styles.alertBtn,
                        {
                          backgroundColor: isDarkMode ? '#212330' : '#E5E7EB',
                          flex: 1,
                        },
                      ]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setExerciseToDelete(null);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.alertBtnText,
                          {
                            color: theme.textSecondary,
                            fontWeight: '600',
                          },
                        ]}
                      >
                        Cancel
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.alertBtn,
                        {
                          backgroundColor: '#EF444420',
                          flex: 1,
                        },
                      ]}
                      onPress={async () => {
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                        const toDelete = exerciseToDelete;
                        setExerciseToDelete(null);
                        if (toDelete) {
                          await deleteCustomExercise(toDelete.id);
                          if (selectedModalMuscle) {
                            setSortedExerciseList(
                              sortExercisesForMuscle(selectedModalMuscle, undefined, new Set([toDelete.id]))
                            );
                          }
                        }
                      }}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.alertBtnText,
                          {
                            color: '#EF4444',
                            fontWeight: '800',
                          },
                        ]}
                      >
                        Delete
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
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
              <Text style={[styles.addExerciseTitle, { color: theme.textPrimary }]}>ADD WORKOUT</Text>
              <Text style={[styles.addExerciseSubtitle, { color: theme.textSecondary }]}>
                {selectedModalMuscle?.toUpperCase()}
              </Text>
              <TextInput
                style={[styles.addExerciseInput, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                placeholder="Workout name"
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
          animationType="fade"
          onRequestClose={() => setRestTimerVisible(false)}
        >
          <View style={styles.timerOverlay}>
            <View style={[styles.timerCard, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
              <TouchableOpacity
                style={[
                  styles.timerCloseBtn,
                  {
                    backgroundColor: isDarkMode ? '#1E1E28' : '#F3F4F6',
                    borderColor: theme.borderColor,
                  },
                ]}
                onPress={() => setRestTimerVisible(false)}
                activeOpacity={0.7}
              >
                <X size={14} color={theme.textSecondary} strokeWidth={2.5} />
              </TouchableOpacity>

              <Text style={[styles.timerDisplay, { color: restTimerRunning ? '#10B981' : theme.textPrimary }]}>
                {formatRestTime(restTimerSeconds > 0 ? restTimerSeconds : restTimerDuration)}
              </Text>

              <View style={styles.timerActions}>
                {restTimerRunning ? (
                  <>
                    <TouchableOpacity
                      style={[
                        styles.timerActionBtn,
                        {
                          backgroundColor: isDarkMode ? 'rgba(239, 68, 68, 0.14)' : '#FEE2E2',
                          borderColor: isDarkMode ? 'rgba(239, 68, 68, 0.28)' : '#FECACA',
                        }
                      ]}
                      onPress={stopRestTimer}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.timerActionText, { color: isDarkMode ? '#F87171' : '#DC2626' }]}>STOP</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.timerActionBtn,
                        {
                          backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.14)' : '#DCFCE7',
                          borderColor: isDarkMode ? 'rgba(16, 185, 129, 0.32)' : '#BBF7D0',
                        }
                      ]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        const newTarget = (restTimerSeconds > 0 ? restTimerSeconds : restTimerDuration) + 30;
                        startRestTimer(newTarget);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.timerActionText, { color: '#10B981' }]}>+30s</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.timerActionBtn,
                        {
                          backgroundColor: isDarkMode ? '#1E1E28' : '#F3F4F6',
                          borderColor: theme.borderColor,
                        }
                      ]}
                      onPress={resetRestTimer}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.timerActionText, { color: theme.textSecondary }]}>RESET</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    paddingVertical: 6,
                    paddingHorizontal: 12,
                    borderRadius: 99,
                    backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.08)' : '#ECFDF5',
                    borderWidth: 1,
                    borderColor: isDarkMode ? 'rgba(16, 185, 129, 0.2)' : '#A7F3D0',
                  }}>
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981' }} />
                    <Text style={{ fontSize: 10, fontWeight: '700', color: '#10B981', letterSpacing: 0.6 }}>
                      TAP TIME TO START
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.timerPresets}>
                {[30, 60, 90, 120, 180, 300].map((sec) => {
                  const isSelected = restTimerDuration === sec;
                  return (
                    <TouchableOpacity
                      key={sec}
                      style={[
                        styles.timerPresetBtn,
                        {
                          backgroundColor: isSelected
                            ? (isDarkMode ? 'rgba(16, 185, 129, 0.18)' : '#DCFCE7')
                            : (isDarkMode ? '#1A1C24' : '#F3F4F6'),
                          borderColor: isSelected ? '#10B981' : theme.borderColor,
                          borderWidth: isSelected ? 1.5 : 1,
                        }
                      ]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setRestTimerVisible(false);
                        setTimeout(() => {
                          setRestTimerDuration(sec);
                          startRestTimer(sec);
                        }, 50);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.timerPresetText,
                          {
                            color: isSelected ? '#10B981' : theme.textPrimary,
                            fontWeight: isSelected ? '800' : '600',
                          },
                        ]}
                      >
                        {sec >= 60 ? `${sec / 60} min` : `${sec}s`}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        </Modal>



        {/* Workout Mode / Workflow Selection Modal */}
        <Modal
          visible={workflowModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => {
            setWorkflowModalVisible(false);
            setHasSeenModeExplanation(true);
            AsyncStorage.setItem('@has_seen_mode_explanation', 'true');
          }}
        >
          <View style={styles.alertOverlay}>
            <View style={[styles.alertCard, { backgroundColor: theme.cardBg, borderColor: theme.borderColor, maxWidth: 360, padding: 20 }]}>
              <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text style={{ fontSize: 14, fontWeight: '900', color: theme.textPrimary, letterSpacing: 0.3 }}>
                  WORKOUT MODE
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setWorkflowModalVisible(false);
                    setHasSeenModeExplanation(true);
                    AsyncStorage.setItem('@has_seen_mode_explanation', 'true');
                  }}
                  activeOpacity={0.7}
                  style={{ padding: 4 }}
                >
                  <X size={18} color={theme.textSecondary} strokeWidth={2.5} />
                </TouchableOpacity>
              </View>

              <Text style={{ fontSize: 12, color: theme.textSecondary, marginBottom: 16, lineHeight: 17, alignSelf: 'flex-start' }}>
                Choose how you prefer to track your workouts:
              </Text>

              <View style={{ width: '100%', flexDirection: 'column', gap: 12 }}>
                {/* Segmented Switcher */}
                <View
                  style={{
                    flexDirection: 'row',
                    backgroundColor: isDarkMode ? '#13141C' : '#F3F4F6',
                    borderRadius: 12,
                    padding: 4,
                    borderWidth: 1,
                    borderColor: theme.borderColor,
                    gap: 4,
                  }}
                >
                  <TouchableOpacity
                    onPress={() => handleSetLoggingMode('post_workout')}
                    activeOpacity={0.7}
                    style={{
                      flex: 1,
                      paddingVertical: 10,
                      paddingHorizontal: 6,
                      borderRadius: 9,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: loggingMode === 'post_workout'
                        ? (isDarkMode ? '#1E2235' : '#FFFFFF')
                        : 'transparent',
                      borderWidth: loggingMode === 'post_workout' ? 1 : 0,
                      borderColor: loggingMode === 'post_workout' ? '#10B981' : 'transparent',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: '800',
                        color: loggingMode === 'post_workout' ? '#10B981' : theme.textSecondary,
                        textAlign: 'center',
                      }}
                    >
                      Focus (Recommended)
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleSetLoggingMode('live')}
                    activeOpacity={0.7}
                    style={{
                      flex: 1,
                      paddingVertical: 10,
                      paddingHorizontal: 6,
                      borderRadius: 9,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: loggingMode === 'live'
                        ? (isDarkMode ? '#1E2235' : '#FFFFFF')
                        : 'transparent',
                      borderWidth: loggingMode === 'live' ? 1 : 0,
                      borderColor: loggingMode === 'live' ? '#10B981' : 'transparent',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: '800',
                        color: loggingMode === 'live' ? '#10B981' : theme.textSecondary,
                        textAlign: 'center',
                      }}
                    >
                      Live Session (In Gym)
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Contextual Description */}
                <View
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                    borderRadius: 10,
                    backgroundColor: isDarkMode ? '#10B98110' : '#10B98108',
                    borderLeftWidth: 3,
                    borderLeftColor: '#10B981',
                  }}
                >
                  <Text style={{ fontSize: 11.5, color: theme.textSecondary, lineHeight: 17 }}>
                    {loggingMode === 'post_workout'
                      ? 'Pick one exercise at a time and enter all your weights and reps completely.'
                      : 'Select multiple exercises first to prepare your whole workout, then go through them.'}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => {
                    setWorkflowModalVisible(false);
                    setHasSeenModeExplanation(true);
                    AsyncStorage.setItem('@has_seen_mode_explanation', 'true');
                  }}
                  activeOpacity={0.8}
                  style={{
                    marginTop: 4,
                    paddingVertical: 11,
                    borderRadius: 10,
                    backgroundColor: '#10B981',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 13 }}>Done</Text>
                </TouchableOpacity>
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

                  let btnBg = btn.bgColor || (isDarkMode ? '#1E1E28' : '#F3F4F6');
                  let textColor = btn.color || theme.textPrimary;

                  if (!btn.bgColor && !btn.color) {
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

                    {selectedHistoryItem.exercises.map((logEx, exIndex) => {
                      const exDetails = exercises.find((e) => e.id === logEx.exerciseId);
                      const isEditing = editingHistoryWorkoutId === selectedHistoryItem.id;
                      const editSets = historyEditSets[logEx.exerciseId];
                      return (
                        <View key={logEx.id || `${logEx.exerciseId}-${exIndex}`} style={styles.detailExerciseGroup}>
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
                                placeholder="Workout note..."
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
                                    allowDecimals={true}
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
                                    allowDecimals={false}
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
                <Text style={styles.prAlertBtnText}>{"LET'S GO!"}</Text>
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
          <View style={[styles.timerOverlay, { padding: 12 }]}>
            <View style={[styles.editWorkoutCard, { backgroundColor: theme.cardBg, borderColor: theme.borderColor, maxHeight: '92%', width: '98%', padding: 20 }]}>
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

              <DragList
                containerStyle={{ maxHeight: 580, flexShrink: 1 }}
                data={activeSessionExercises}
                keyExtractor={(item, index) => item.id || `${item.exerciseId}-${index}`}
                onReordered={(fromIdx, toIdx) => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  const updated = [...activeSessionExercises];
                  const [moved] = updated.splice(fromIdx, 1);
                  updated.splice(toIdx, 0, moved);
                  setActiveSessionExercises(updated);
                  AsyncStorage.setItem('@active_session_exercises', JSON.stringify(updated));
                }}
                style={{ maxHeight: 580, flexShrink: 1 }}
                renderItem={({ item, index, onDragStart, isActive }) => {
                  const details = exercises.find((e) => e.id === item.exerciseId);
                  if (!details) return null;
                  const muscleColor = categoryColors[details.muscleGroup] || '#10B981';
                  return (
                    <TouchableOpacity
                      key={item.id || `${item.exerciseId}-${index}`}
                      style={[styles.editWorkoutItem, { borderBottomColor: theme.borderColor, opacity: isActive ? 0.5 : 1 }]}
                      activeOpacity={0.6}
                      onPress={() => {
                        handleToggleExpand(item.exerciseId);
                        setCameFromEditModal(true);
                        setEditSessionExerciseModalVisible(false);
                      }}
                      onLongPress={onDragStart}
                      delayLongPress={150}
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
                            {item.sets.length} set{item.sets.length > 1 ? 's' : ''}
                          </Text>
                        </View>
                      </View>
                      <ChevronRight size={18} color={theme.textSecondary} opacity={0.4} strokeWidth={2} />
                    </TouchableOpacity>
                  );
                }}
              />
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
          <View style={[styles.exerciseLoggerOverlayContainer, { padding: 12 }]}>
            <Pressable
              style={styles.exerciseLoggerBackdrop}
              onPress={() => {
                if (fromTemplateList) handleTemplateListBackFromLogger(true);
                else handleCloseActiveExerciseLogger(true);
              }}
            />
            <View
              style={[
                styles.exerciseLoggerCard,
                {
                  backgroundColor: theme.cardBg,
                  borderColor: theme.borderColor,
                  maxHeight: '92%',
                  width: '98%',
                  maxWidth: undefined,
                  padding: 20,
                  flexShrink: 1,
                }
              ]}
            >
              {(() => {
                const exItem = expandedExerciseId ? exercises.find((e) => e.id === expandedExerciseId) : null;
                if (!exItem) return null;
                const categoryColor = categoryColors[exItem.muscleGroup] || '#10B981';
                const exerciseList = fromTemplateList ? templateListExercises : activeSessionExercises;
                const currentExIndex = exerciseList.findIndex((le) => le.exerciseId === expandedExerciseId);
                const canGoPrev = exerciseList.length > 1;
                const canGoNext = exerciseList.length > 1;

                const saveCurrentSetsToState = () => {
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
                };

                const switchToExercise = (targetExerciseId: string) => {
                  if (targetExerciseId === expandedExerciseId) return;
                  const list = fromTemplateList ? templateListExercises : activeSessionExercises;
                  const targetEx = list.find((le) => le.exerciseId === targetExerciseId);
                  if (!targetEx) return;

                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  saveCurrentSetsToState();

                  setExpandedExerciseId(targetEx.exerciseId);
                  const nextSets: WorkoutSet[] = targetEx.sets.map((s) => ({
                    id: s.id,
                    weight: s.weight,
                    reps: s.reps,
                    isCompleted: fromTemplateList ? true : s.isCompleted,
                  }));

                  setActiveSets(nextSets);
                  setExerciseNote(targetEx.notes || '');
                  setSameForAll(true);
                };

                const navigateToExercise = (direction: 'prev' | 'next') => {
                  const list = fromTemplateList ? templateListExercises : activeSessionExercises;
                  if (list.length <= 1) return;

                  const curIdx = list.findIndex((le) => le.exerciseId === expandedExerciseId);
                  if (curIdx === -1) return;

                  const nextIndex = direction === 'next'
                    ? (curIdx + 1) % list.length
                    : (curIdx - 1 + list.length) % list.length;
                  const nextEx = list[nextIndex];
                  if (!nextEx) return;

                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  saveCurrentSetsToState();

                  setExpandedExerciseId(nextEx.exerciseId);
                  const nextSets: WorkoutSet[] = nextEx.sets.map((s) => ({
                    id: s.id,
                    weight: s.weight,
                    reps: s.reps,
                    isCompleted: fromTemplateList ? true : s.isCompleted,
                  }));

                  setActiveSets(nextSets);
                  setExerciseNote(nextEx.notes || '');
                  setSameForAll(true);
                };

                const getCompactNavName = (name: string) => {
                  return name
                    .replace(/dumbbell/gi, 'DB')
                    .replace(/barbell/gi, 'BB')
                    .replace(/machine/gi, 'Mach')
                    .replace(/bench press/gi, 'Press')
                    .replace(/overhead/gi, 'OH')
                    .trim();
                };

                return (
                  <View style={{ flexShrink: 1, maxHeight: '100%', width: '100%' }}>
                    {/* Top Workout Navigation Pill Strip */}
                    {exerciseList.length > 1 && (
                      <View style={styles.loggerNavPillWrap}>
                        {exerciseList.map((item, index) => {
                          const isSelected = item.exerciseId === expandedExerciseId;
                          const exDetails = exercises.find((e) => e.id === item.exerciseId);
                          const rawName = exDetails?.name || 'Exercise';
                          const exName = getCompactNavName(rawName);
                          const mColor = exDetails ? categoryColors[exDetails.muscleGroup] || '#10B981' : '#10B981';
                          const hasCompletedSets = item.sets.some((s) => s.isCompleted || (s.weight > 0 && s.reps > 0));

                          return (
                            <TouchableOpacity
                              key={item.id || `${item.exerciseId}-${index}`}
                              activeOpacity={0.7}
                              onPress={() => switchToExercise(item.exerciseId)}
                              style={[
                                styles.loggerNavPill,
                                {
                                  backgroundColor: isSelected
                                    ? (isDarkMode ? `${mColor}25` : `${mColor}18`)
                                    : (isDarkMode ? '#1E1E28' : '#F3F4F6'),
                                  borderColor: isSelected ? mColor : theme.borderColor,
                                  borderWidth: isSelected ? 1.5 : 1,
                                }
                              ]}
                            >
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                {hasCompletedSets ? (
                                  <Check size={11} color={isSelected ? mColor : '#10B981'} strokeWidth={3} />
                                ) : (
                                  <Text style={[styles.loggerNavPillIndex, { color: isSelected ? mColor : theme.textSecondary }]}>
                                    {index + 1}
                                  </Text>
                                )}
                                <Text
                                  numberOfLines={1}
                                  ellipsizeMode="tail"
                                  style={[
                                    styles.loggerNavPillText,
                                    {
                                      color: isSelected ? (isDarkMode ? '#FFFFFF' : theme.textPrimary) : theme.textSecondary,
                                      fontWeight: isSelected ? '700' : '500',
                                    }
                                  ]}
                                >
                                  {exName}
                                </Text>
                              </View>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    )}

                    <SwipeableLoggerCard
                      onGoNext={() => navigateToExercise('next')}
                      onGoPrev={() => navigateToExercise('prev')}
                      canGoNext={canGoNext}
                      canGoPrev={canGoPrev}
                    >
                      <View style={{ flexShrink: 1, maxHeight: '100%' }}>
                        <View style={styles.exerciseLoggerHeader}>
                          <View style={styles.exerciseLoggerTitleCol}>
                            <Text
                              style={[styles.exerciseLoggerName, { color: theme.textPrimary }]}
                              numberOfLines={1}
                              ellipsizeMode="tail"
                            >
                              {exItem.name}
                            </Text>
                            <Text style={[styles.exerciseLoggerMuscle, { color: categoryColor, marginTop: 2 }]}>
                              {exItem.muscleGroup.toUpperCase()}
                            </Text>
                          </View>
                          <TouchableOpacity
                            onPress={() => {
                              if (fromTemplateList) handleTemplateListBackFromLogger();
                              else handleCloseActiveExerciseLogger();
                            }}
                            activeOpacity={0.6}
                            style={styles.exerciseLoggerCloseBtn}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          >
                            <X size={18} color={theme.textSecondary} strokeWidth={2} />
                          </TouchableOpacity>
                        </View>

                    <ScrollView
                      ref={loggerScrollViewRef}
                      style={{ flexShrink: 1, marginVertical: 12 }}
                      contentContainerStyle={{ paddingBottom: keyboardHeight > 0 ? keyboardHeight + 10 : 20 }}
                      showsVerticalScrollIndicator={true}
                      nestedScrollEnabled={true}
                      keyboardShouldPersistTaps="handled"
                    >

                      {(() => {
                        if (!expandedExerciseId) return null;
                        const prFromState = getExercisePR(expandedExerciseId);
                        let pr = prFromState;

                        if (!pr) {
                          let max1RM = 0;
                          let bestWeight = 0;
                          let bestReps = 0;
                          let bestDate = '';
                          for (const session of history) {
                            const logEx = session.exercises.find((e) => e.exerciseId === expandedExerciseId);
                            if (logEx) {
                              for (const set of logEx.sets) {
                                if (set.weight > 0 && set.reps > 0) {
                                  const e1RM = set.weight * (1 + set.reps / 30);
                                  if (e1RM > max1RM) {
                                    max1RM = e1RM;
                                    bestWeight = set.weight;
                                    bestReps = set.reps;
                                    bestDate = session.date;
                                  }
                                }
                              }
                            }
                          }
                          if (bestWeight > 0) {
                            pr = { exerciseId: expandedExerciseId, weight: bestWeight, reps: bestReps, date: bestDate, estimatedOneRM: max1RM };
                          }
                        }

                        if (!pr) return null;

                        const formattedDate = new Date(pr.date).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        });

                        return (
                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.03)' : '#F9FAFB',
                              borderWidth: 1,
                              borderColor: theme.borderColor,
                              borderRadius: 10,
                              paddingHorizontal: 12,
                              paddingVertical: 8,
                              marginTop: 4,
                              marginBottom: 8,
                            }}
                          >
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                              <Trophy size={13} color="#10B981" strokeWidth={2} />
                              <Text style={{ fontSize: 10, fontWeight: '800', color: '#10B981', letterSpacing: 1 }}>
                                BEST
                              </Text>
                              <Text style={{ fontSize: 13, fontWeight: '800', color: theme.textPrimary, marginLeft: 4 }}>
                                {pr.weight} <Text style={{ fontSize: 11, fontWeight: '600', color: theme.textSecondary }}>kg</Text> × {pr.reps} <Text style={{ fontSize: 11, fontWeight: '600', color: theme.textSecondary }}>reps</Text>
                              </Text>
                            </View>
                            <Text style={{ fontSize: 11, fontWeight: '500', color: theme.textSecondary }}>
                              {formattedDate}
                            </Text>
                          </View>
                        );
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
                        <View style={styles.widthActions} />
                      </View>

                      {activeSets.map((set, index) => (
                        <View key={set.id} style={[styles.setRow, { borderBottomColor: theme.borderColor }]}>
                          <Text style={[styles.setText, { color: theme.textPrimary }]}>{index + 1}</Text>
                          <View style={styles.widthWeight}>
                            <IncrementInput
                              value={set.weight}
                              step={2.5}
                              allowDecimals={true}
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
                              allowDecimals={false}
                              onChange={(val) => handleUpdateSet(set.id, { reps: val })}
                              placeholder="reps"
                              accentColor={categoryColor}
                              style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder }}
                              textColor={theme.textPrimary}
                            />
                          </View>
                          <View style={styles.widthActions}>
                            {index === activeSets.length - 1 && activeSets.length > 1 && (
                              <TouchableOpacity
                                style={styles.setDeleteBtn}
                                onPress={() => handleRemoveSet(set.id)}
                                activeOpacity={0.6}
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                              >
                                <Trash2 size={12} color="#EF4444" strokeWidth={2} />
                              </TouchableOpacity>
                            )}
                          </View>
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
                            paddingVertical: 10,
                            color: theme.textPrimary,
                            fontSize: 14,
                            minHeight: 64,
                            textAlignVertical: 'top',
                          }}
                          placeholder="Add an optional workout note..."
                          placeholderTextColor={theme.inputPlaceholder}
                          value={exerciseNote}
                          onChangeText={setExerciseNote}
                          onFocus={() => {
                            setTimeout(() => {
                              loggerScrollViewRef.current?.scrollToEnd({ animated: true });
                            }, 150);
                          }}
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
                  </SwipeableLoggerCard>
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
          <View style={[styles.timerOverlay, { padding: 12 }]}>
            <View style={[styles.editWorkoutCard, { backgroundColor: theme.cardBg, borderColor: theme.borderColor, maxHeight: '92%', width: '98%', padding: 20 }]}>
              <View style={styles.editWorkoutHeader}>
                <View>
                  <Text style={[styles.editWorkoutTitle, { color: theme.textPrimary }]}>
                    {isDeleteMode ? 'Delete Workouts' : `Workouts (${templateListExercises.length})`}
                  </Text>
                  {templateListExercises.length > 1 && !isDeleteMode && (
                    <Text style={{ color: theme.textSecondary, fontSize: 10, fontWeight: '700', marginTop: 3, opacity: 0.8, letterSpacing: 0.2 }}>
                      Drag ⠿ to reorder
                    </Text>
                  )}
                  {isDeleteMode && (
                    <Text style={{ color: '#EF4444', fontSize: 10, fontWeight: '700', marginTop: 3, opacity: 0.8, letterSpacing: 0.2 }}>
                      Select workouts to delete
                    </Text>
                  )}
                </View>
                <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                  {templateListExercises.length > 0 && (
                    <TouchableOpacity
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setIsDeleteMode((prev) => !prev);
                        setSelectedTemplateExerciseIds(new Set());
                      }}
                      activeOpacity={0.6}
                      style={{ padding: 4 }}
                    >
                      <Trash2 size={20} color={isDeleteMode ? '#EF4444' : theme.textPrimary} strokeWidth={2.2} />
                    </TouchableOpacity>
                  )}
                  {!isDeleteMode && (
                    <TouchableOpacity
                      onPress={() => {
                        handleSelectMuscleCard(getMostFrequentMuscleGroup(templateListExercises));
                      }}
                      activeOpacity={0.6}
                      style={{ padding: 4 }}
                    >
                      <Plus size={20} color={theme.textPrimary} strokeWidth={2.5} />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    onPress={() => {
                      setTemplateListVisible(false);
                      setFromTemplateList(false);
                      setTemplateListExercises([]);
                      setActiveTemplateId(null);
                      setIsDeleteMode(false);
                      setEditingTemplateExerciseId(null);
                      setSelectedTemplateExerciseIds(new Set());
                    }}
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
                      handleSelectMuscleCard(getMostFrequentMuscleGroup(templateListExercises));
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
                    <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '800' }}>ADD WORKOUT</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <DragList
                  containerStyle={{ maxHeight: 580, flexShrink: 1 }}
                  data={templateListExercises}
                  keyExtractor={(item, index) => item.id || `${item.exerciseId}-${index}`}
                  onReordered={(fromIdx, toIdx) => {
                    setTemplateListExercises((prev) => {
                      const updated = [...prev];
                      const [moved] = updated.splice(fromIdx, 1);
                      updated.splice(toIdx, 0, moved);
                      return updated;
                    });
                  }}
                  style={{ maxHeight: 580, flexShrink: 1 }}
                  renderItem={({ item, index, onDragStart, isActive }) => {
                    const details = exercises.find((e) => e.id === item.exerciseId);
                    if (!details) return null;
                    const muscleColor = categoryColors[details.muscleGroup] || '#10B981';
                    const isSelectedForDelete = selectedTemplateExerciseIds.has(item.exerciseId);

                    return (
                      <TouchableOpacity
                        activeOpacity={0.65}
                        onPress={() => {
                          if (isDeleteMode) {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            setSelectedTemplateExerciseIds((prev) => {
                              const next = new Set(prev);
                              if (next.has(item.exerciseId)) {
                                next.delete(item.exerciseId);
                              } else {
                                next.add(item.exerciseId);
                              }
                              return next;
                            });
                          } else {
                            handleTemplateExercisePress(item);
                          }
                        }}
                        onLongPress={isDeleteMode ? undefined : onDragStart}
                        delayLongPress={150}
                        style={[
                          styles.replaceOptionItem,
                          {
                            borderBottomColor: theme.borderColor,
                            backgroundColor: isDeleteMode && isSelectedForDelete
                              ? (isDarkMode ? '#EF444415' : '#EF444410')
                              : 'transparent',
                            opacity: isActive ? 0.6 : 1,
                            paddingHorizontal: 4,
                          },
                        ]}
                      >
                        {isDeleteMode && (
                          <View
                            style={{
                              width: 20,
                              height: 20,
                              borderRadius: 10,
                              borderWidth: 1.5,
                              borderColor: isSelectedForDelete ? '#EF4444' : theme.textSecondary,
                              backgroundColor: isSelectedForDelete ? '#EF4444' : 'transparent',
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginRight: 10,
                            }}
                          >
                            {isSelectedForDelete && (
                              <Check size={11} color="#FFFFFF" strokeWidth={3.5} />
                            )}
                          </View>
                        )}

                        {/* Colored Vertical Rounded Rectangle Accent */}
                        <View style={[styles.activeSessionItemAccent, { backgroundColor: muscleColor }]} />

                        {/* Exercise Name */}
                        <View style={{ flex: 1, marginRight: 8 }}>
                          <Text
                            style={[styles.replaceOptionItemName, { color: theme.textPrimary }]}
                            numberOfLines={1}
                          >
                            {details.name}
                          </Text>
                        </View>

                        {/* Muscle / Instrument Badge */}
                        <View
                          style={[
                            styles.activeSessionMuscleBadge,
                            { backgroundColor: `${muscleColor}18` },
                          ]}
                        >
                          <Text
                            style={[
                              styles.activeSessionMuscleBadgeText,
                              { color: muscleColor },
                            ]}
                          >
                            {details.instrument ? details.instrument.toUpperCase() : details.muscleGroup.toUpperCase()}
                          </Text>
                        </View>

                        {/* Sets Count */}
                        <Text style={[styles.activeSessionItemSets, { color: theme.textSecondary, marginLeft: 8 }]}>
                          {item.sets.length} set{item.sets.length > 1 ? 's' : ''}
                        </Text>

                        {/* Chevron */}
                        {!isDeleteMode && (
                          <ChevronRight size={16} color={theme.textSecondary} opacity={0.4} strokeWidth={2} style={{ marginLeft: 6 }} />
                        )}
                      </TouchableOpacity>
                    );
                  }}
                />
              )}
              {isDeleteMode ? (
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
                  <TouchableOpacity
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setIsDeleteMode(false);
                      setSelectedTemplateExerciseIds(new Set());
                    }}
                    activeOpacity={0.7}
                    style={[
                      styles.finishSessionBtn,
                      { flex: 1, borderWidth: 1, borderColor: theme.borderColor, backgroundColor: 'transparent' },
                    ]}
                  >
                    <Text style={[styles.finishSessionBtnText, { color: theme.textSecondary }]}>CANCEL</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    disabled={selectedTemplateExerciseIds.size === 0}
                    onPress={() => {
                      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                      setTemplateListExercises((prev) =>
                        prev.filter((ex) => !selectedTemplateExerciseIds.has(ex.exerciseId))
                      );
                      setIsDeleteMode(false);
                      setSelectedTemplateExerciseIds(new Set());
                    }}
                    activeOpacity={0.8}
                    style={[
                      styles.finishSessionBtn,
                      {
                        flex: 1,
                        backgroundColor: selectedTemplateExerciseIds.size === 0 ? theme.borderColor : '#EF4444',
                        opacity: selectedTemplateExerciseIds.size === 0 ? 0.5 : 1,
                      },
                    ]}
                  >
                    <Text style={[styles.finishSessionBtnText, { color: '#FFFFFF' }]}>
                      DELETE ({selectedTemplateExerciseIds.size})
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
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
                      setEditingTemplateExerciseId(null);
                    }}
                    activeOpacity={0.7}
                    style={[
                      styles.finishSessionBtn,
                      {
                        flex: 1,
                        backgroundColor: 'transparent',
                        borderWidth: 1.5,
                        borderColor: '#10B981',
                      },
                    ]}
                  >
                    <Text style={[styles.finishSessionBtnText, { color: '#10B981' }]}>SAVE</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={async () => {
                      const selectedExercises = templateListExercises.map(e => ({
                        exerciseId: e.exerciseId,
                        sets: e.sets.map(s => ({ ...s, id: generateId(), isCompleted: false })),
                        notes: e.notes,
                      }));
                      if (activeTemplateId) {
                        await incrementTemplateUsage(activeTemplateId);
                      }
                      const now = Date.now();
                      setActiveSessionExercises(selectedExercises);
                      setSessionStartTime(now);
                      setSessionStartedFromTemplate(true);
                      setSessionTemplateId(activeTemplateId);
                      setTemplateListVisible(false);
                      setFromTemplateList(false);
                      setActiveTemplateId(null);
                      setEditingTemplateExerciseId(null);
                      setTemplateListExercises([]);
                      setActiveSegment('log');
                      AsyncStorage.setItem('@active_session_exercises', JSON.stringify(selectedExercises));
                      AsyncStorage.setItem('@session_start_time', String(now));
                      AsyncStorage.setItem('@session_started_from_template', 'true');
                      if (activeTemplateId) {
                        AsyncStorage.setItem('@session_template_id', activeTemplateId);
                      } else {
                        AsyncStorage.removeItem('@session_template_id');
                      }
                      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    }}
                    activeOpacity={0.8}
                    style={[
                      styles.finishSessionBtn,
                      {
                        flex: 1,
                        backgroundColor: '#10B981',
                      },
                    ]}
                  >
                    <Text style={styles.finishSessionBtnText}>START</Text>
                  </TouchableOpacity>
                </View>
              )}
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
          <View style={[styles.timerOverlay, { padding: 12 }]}>
            <View style={[styles.editWorkoutCard, { backgroundColor: theme.cardBg, borderColor: theme.borderColor, maxHeight: '92%', width: '98%', padding: 20 }]}>
              <View style={styles.editWorkoutHeader}>
                <View>
                  <Text style={[styles.editWorkoutTitle, { color: theme.textPrimary }]}>Select Workouts</Text>
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

              <ScrollView style={{ maxHeight: 580 }} showsVerticalScrollIndicator={false}>
                {templateListExercises.map((logEx, exIndex) => {
                  const details = exercises.find((e) => e.id === logEx.exerciseId);
                  if (!details) return null;
                  const muscleColor = categoryColors[details.muscleGroup] || '#10B981';
                  const equipImg = getExerciseImage(details.instrument, exIndex);
                  const isSelected = templateLogSelectedIds.has(logEx.exerciseId);
                  return (
                    <TouchableOpacity
                      key={logEx.id || `${logEx.exerciseId}-${exIndex}`}
                      activeOpacity={0.7}
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
                      style={[
                        styles.replaceOptionItem,
                        { borderBottomColor: theme.borderColor, backgroundColor: 'transparent', paddingHorizontal: 4 },
                      ]}
                    >
                      <View style={{
                        width: 20,
                        height: 20,
                        borderRadius: 10,
                        borderWidth: 1.5,
                        borderColor: isSelected ? '#10B981' : theme.borderColor,
                        backgroundColor: isSelected ? '#10B981' : 'transparent',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 10,
                      }}>
                        {isSelected && <Check size={11} color="#FFFFFF" strokeWidth={3.5} />}
                      </View>
                      
                      {/* Colored Vertical Rounded Rectangle Accent */}
                      <View style={[styles.activeSessionItemAccent, { backgroundColor: muscleColor }]} />

                      <View style={{ flex: 1, marginRight: 8 }}>
                        <Text style={[styles.replaceOptionItemName, { color: isSelected ? theme.textPrimary : theme.textSecondary }]} numberOfLines={1}>
                          {details.name}
                        </Text>
                      </View>

                      <View style={[styles.activeSessionMuscleBadge, { backgroundColor: `${muscleColor}18` }]}>
                        <Text style={[styles.activeSessionMuscleBadgeText, { color: muscleColor }]}>
                          {details.instrument ? details.instrument.toUpperCase() : details.muscleGroup.toUpperCase()}
                        </Text>
                      </View>
                      <Text style={[styles.activeSessionItemSets, { color: theme.textSecondary, marginLeft: 8 }]}>
                        {logEx.sets.length} set{logEx.sets.length > 1 ? 's' : ''}
                      </Text>
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
                    setSessionStartedFromTemplate(true);
                    setSessionTemplateId(activeTemplateId);
                    setTemplateLogSelectVisible(false);
                    setTemplateListVisible(false);
                    setFromTemplateList(false);
                    setActiveTemplateId(null);
                    setTemplateListExercises([]);
                    setActiveSegment('log');
                    AsyncStorage.setItem('@active_session_exercises', JSON.stringify(selectedExercises));
                    AsyncStorage.setItem('@session_start_time', String(now));
                    AsyncStorage.setItem('@session_started_from_template', 'true');
                    if (activeTemplateId) {
                      AsyncStorage.setItem('@session_template_id', activeTemplateId);
                    } else {
                      AsyncStorage.removeItem('@session_template_id');
                    }
                  }}
                  activeOpacity={0.8}
                  disabled={templateLogSelectedIds.size === 0}
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    backgroundColor: templateLogSelectedIds.size > 0 ? '#10B981' : theme.borderColor,
                    paddingVertical: 16,
                    borderRadius: 14,
                  }}
                >
                  <Play size={14} color={templateLogSelectedIds.size > 0 ? '#000000' : theme.textSecondary} fill={templateLogSelectedIds.size > 0 ? '#000000' : theme.textSecondary} />
                  <Text style={{ color: templateLogSelectedIds.size > 0 ? '#000000' : theme.textSecondary, fontSize: 14, fontWeight: '800', letterSpacing: 0.5 }}>
                    START ({templateLogSelectedIds.size})
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Consistency / Rest Day Modal */}
        <Modal
          visible={consistencyModalVisible}
          transparent={true}
          animationType="none"
          onRequestClose={() => setConsistencyModalVisible(false)}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <View
              style={{
                backgroundColor: theme.cardBg,
                borderColor: theme.borderColor,
                width: '94%',
                paddingVertical: 28,
                paddingHorizontal: 24,
                borderRadius: 24,
                borderWidth: 1.5,
                alignItems: 'center',
              }}
            >
              {/* Header */}
              <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Flame size={18} color="#EF4444" fill="#EF4444" />
                  <Text style={{ fontSize: 13, fontWeight: '900', color: theme.textPrimary, letterSpacing: 0.3 }}>
                    REST DAYS & STREAK
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setConsistencyModalVisible(false)}
                  activeOpacity={0.7}
                  style={{ padding: 4 }}
                >
                  <X size={18} color={theme.textSecondary} strokeWidth={2.5} />
                </TouchableOpacity>
              </View>

              {/* Day Streak & Workout Days Summary */}
              <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-around', backgroundColor: theme.background, borderRadius: 10, paddingVertical: 14, paddingHorizontal: 6, marginBottom: 24 }}>
                <View style={{ flex: 1, alignItems: 'center' }}>
                  <Text style={{ fontSize: 16, fontWeight: '900', color: theme.textPrimary }}>
                    {overallStats.currentStreak}
                  </Text>
                  <Text style={{ fontSize: 8.5, fontWeight: '800', color: theme.textSecondary, marginTop: 2 }}>
                    ACTIVE STREAK
                  </Text>
                </View>
                <View style={{ width: 1, backgroundColor: theme.borderColor }} />
                <View style={{ flex: 1, alignItems: 'center' }}>
                  <Text style={{ fontSize: 16, fontWeight: '900', color: theme.textPrimary }}>
                    {overallStats.longestStreak}
                  </Text>
                  <Text style={{ fontSize: 8.5, fontWeight: '800', color: theme.textSecondary, marginTop: 2 }}>
                    LONGEST STREAK
                  </Text>
                </View>
                <View style={{ width: 1, backgroundColor: theme.borderColor }} />
                <View style={{ flex: 1, alignItems: 'center' }}>
                  <Text style={{ fontSize: 16, fontWeight: '900', color: theme.textPrimary }}>
                    {totalWorkoutDays}
                  </Text>
                  <Text style={{ fontSize: 8.5, fontWeight: '800', color: theme.textSecondary, marginTop: 2 }}>
                    WORKOUT DAYS
                  </Text>
                </View>
              </View>

              {/* Sub-label */}
              <Text style={{ fontSize: 11, fontWeight: '800', color: theme.textSecondary, alignSelf: 'flex-start', marginBottom: 10 }}>
                SELECT YOUR RECURRING REST DAYS:
              </Text>

              {/* Days of the week row */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 24 }}>
                {[
                  { label: 'M', value: 1 },
                  { label: 'T', value: 2 },
                  { label: 'W', value: 3 },
                  { label: 'T', value: 4 },
                  { label: 'F', value: 5 },
                  { label: 'S', value: 6 },
                  { label: 'S', value: 0 },
                ].map((day) => {
                  const isSelected = restDaysOfWeek.includes(day.value);
                  return (
                    <TouchableOpacity
                      key={day.value}
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 15,
                        backgroundColor: isSelected ? '#10B981' : 'transparent',
                        borderWidth: isSelected ? 0 : 1.2,
                        borderColor: theme.borderColor,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      onPress={async () => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        await toggleRestDayOfWeek(day.value);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={{ fontSize: 10, fontWeight: '900', color: isSelected ? '#FFFFFF' : theme.textSecondary }}>
                        {day.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Quote Block */}
              <View style={{ width: '100%', borderTopWidth: 1, borderTopColor: theme.borderColor, marginTop: 20, paddingTop: 20, alignItems: 'center' }}>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '600',
                    fontStyle: 'italic',
                    color: theme.textPrimary,
                    textAlign: 'center',
                    lineHeight: 18,
                    paddingHorizontal: 8,
                  }}
                >
                  {`"${currentQuote}"`}
                </Text>
              </View>
            </View>
          </View>
        </Modal>

        {/* Profile Full Screen */}
        <Modal
          visible={profileModalVisible}
          transparent={true}
          animationType="none"
          statusBarTranslucent={true}
          onRequestClose={() => handleCloseProfile()}
        >
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'transparent' }]}>
            <Animated.View
              style={{
                flex: 1,
                backgroundColor: theme.background,
                width: '100%',
                height: '100%',
                transform: [{ translateX: profileSlideAnim }],
              }}
            >
              <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{
                  paddingTop: Math.max(insets.top, 24) + 8,
                  paddingBottom: Math.max(insets.bottom, 20) + 32,
                }}
                showsVerticalScrollIndicator={false}
              >
                {/* Header */}
                <View style={styles.profileFullHeader}>
                  <TouchableOpacity
                    onPress={() => handleCloseProfile()}
                    activeOpacity={0.7}
                    style={styles.profileFullBack}
                  >
                    <ChevronLeft size={22} color={theme.textPrimary} strokeWidth={2.5} />
                    <Text style={[styles.profileFullBackText, { color: theme.textSecondary }]}>Back</Text>
                  </TouchableOpacity>
                </View>

                {/* Profile Section */}
                <View style={styles.profileFullTop}>
                <View style={[styles.profileAvatar, { backgroundColor: userEmail || auth.currentUser ? '#111827' : '#212330' }]}>
                  <Text style={styles.profileAvatarText}>
                    {getInitials(userDisplayName || userProfile?.name || null, userEmail)}
                  </Text>
                </View>

                <Text style={[styles.profileName, { color: theme.textPrimary }]}>
                  {userProfile?.name || userDisplayName || 'Guest'}
                </Text>
                {userEmail ? (
                  <Text style={[styles.profileEmail, { color: theme.textSecondary, marginTop: 2 }]}>{userEmail}</Text>
                ) : null}
              </View>

              {/* Highlight Stats */}
              <View style={styles.profileStatsRow}>
                <View style={[styles.profileStatCard, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
                  <Text style={[styles.profileStatNumber, { color: theme.textPrimary }]}>{overallStats.totalWorkouts}</Text>
                  <Text style={[styles.profileStatLabel, { color: theme.textSecondary }]}>Workouts</Text>
                </View>
                <TouchableOpacity
                  style={[styles.profileStatCard, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}
                  onPress={() => {
                    handleCloseProfile(() => {
                      setTimeout(() => {
                        handleOpenConsistency();
                      }, 100);
                    });
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.profileStatNumber, { color: '#FACC15' }]}>{overallStats.currentStreak}</Text>
                  <Text style={[styles.profileStatLabel, { color: theme.textSecondary }]}>Day Streak</Text>
                </TouchableOpacity>
                <View style={[styles.profileStatCard, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
                  <Text style={[styles.profileStatNumber, { color: theme.textPrimary }]}>{achievements.filter(a => a.isUnlocked).length}</Text>
                  <Text style={[styles.profileStatLabel, { color: theme.textSecondary }]}>Unlocked</Text>
                </View>
              </View>

              {/* Fitness Details (Height • Weight • Goal) */}
              <View style={styles.profileFullSection}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <Text style={[styles.profileFullSectionTitle, { color: theme.textPrimary }]}>YOUR FITNESS PROFILE</Text>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    {isEditingProfile ? (
                      <>
                        <TouchableOpacity
                          onPress={handleCancelEditProfile}
                          activeOpacity={0.7}
                          style={{ paddingVertical: 4, paddingHorizontal: 10, borderRadius: 8, backgroundColor: '#EF444415' }}
                        >
                          <Text style={{ fontSize: 11, fontWeight: '800', color: '#EF4444', letterSpacing: 0.5 }}>CANCEL</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={handleSaveProfile}
                          activeOpacity={0.7}
                          style={{ paddingVertical: 4, paddingHorizontal: 10, borderRadius: 8, backgroundColor: '#10B98115' }}
                        >
                          <Text style={{ fontSize: 11, fontWeight: '800', color: '#10B981', letterSpacing: 0.5 }}>SAVE</Text>
                        </TouchableOpacity>
                      </>
                    ) : (
                      <TouchableOpacity
                        onPress={handleStartEditProfile}
                        activeOpacity={0.7}
                        style={{ paddingVertical: 4, paddingHorizontal: 12, borderRadius: 8, backgroundColor: '#10B98115' }}
                      >
                        <Text style={{ fontSize: 11, fontWeight: '800', color: '#10B981', letterSpacing: 0.5 }}>EDIT</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                <View style={[styles.profileFitnessCard, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
                  {isEditingProfile ? (
                    <View style={{ gap: 14 }}>
                      {/* Name Edit */}
                      <View style={{ gap: 4 }}>
                        <Text style={[styles.profileFitnessLabel, { color: theme.textSecondary, fontSize: 12 }]}>Name</Text>
                        <TextInput
                          value={editName}
                          onChangeText={setEditName}
                          style={[
                            styles.profileEditInput,
                            {
                              color: theme.textPrimary,
                              borderColor: theme.borderColor,
                              backgroundColor: theme.background
                            }
                          ]}
                          placeholder="e.g. Alex"
                          placeholderTextColor="#9CA3AF"
                          returnKeyType="done"
                        />
                      </View>

                      {/* Height Edit */}
                      <View style={{ gap: 4 }}>
                        <Text style={[styles.profileFitnessLabel, { color: theme.textSecondary, fontSize: 12 }]}>Height (cm)</Text>
                        <TextInput
                          value={editHeight}
                          onChangeText={(val) => setEditHeight(val.replace(/[^\d]/g, ''))}
                          keyboardType="numeric"
                          style={[
                            styles.profileEditInput,
                            {
                              color: theme.textPrimary,
                              borderColor: theme.borderColor,
                              backgroundColor: theme.background
                            }
                          ]}
                          placeholder="e.g. 175"
                          placeholderTextColor="#9CA3AF"
                          returnKeyType="done"
                        />
                      </View>

                      {/* Weight Edit */}
                      <View style={{ gap: 4 }}>
                        <Text style={[styles.profileFitnessLabel, { color: theme.textSecondary, fontSize: 12 }]}>Weight (kg)</Text>
                        <TextInput
                          value={editWeight}
                          onChangeText={(val) => setEditWeight(val.replace(/[^\d.]/g, ''))}
                          keyboardType="numeric"
                          style={[
                            styles.profileEditInput,
                            {
                              color: theme.textPrimary,
                              borderColor: theme.borderColor,
                              backgroundColor: theme.background
                            }
                          ]}
                          placeholder="e.g. 75"
                          placeholderTextColor="#9CA3AF"
                          returnKeyType="done"
                        />
                      </View>

                      {/* Goal Edit */}
                      <View style={{ gap: 6 }}>
                        <Text style={[styles.profileFitnessLabel, { color: theme.textSecondary, fontSize: 12 }]}>Fitness Goal</Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 2 }}>
                          {([
                            'Lean & Aesthetic',
                            'Strong & Powerful',
                            'Slim & Toned',
                            'Improve Overall Health'
                          ] as FitnessGoal[]).map((g) => {
                            const isSel = editGoal === g;
                            return (
                              <TouchableOpacity
                                key={g}
                                activeOpacity={0.7}
                                onPress={() => setEditGoal(g)}
                                style={{
                                  paddingVertical: 6,
                                  paddingHorizontal: 12,
                                  borderRadius: 20,
                                  borderWidth: 1,
                                  borderColor: isSel ? '#10B981' : theme.borderColor,
                                  backgroundColor: isSel ? '#10B98115' : theme.background,
                                }}
                              >
                                <Text style={{ fontSize: 11, fontWeight: '700', color: isSel ? '#10B981' : theme.textSecondary }}>
                                  {g}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      </View>
                    </View>
                  ) : (
                    <>
                      {/* Height */}
                      <View style={styles.profileFitnessRow}>
                        <Text style={[styles.profileFitnessLabel, { color: theme.textSecondary }]}>Height</Text>
                        <View style={{ flex: 1, alignItems: 'flex-end' }}>
                          <Text style={{ color: theme.textPrimary, fontWeight: '900', fontSize: 14, textAlign: 'right' }}>
                            {userProfile?.heightCm ? `${Math.round(userProfile.heightCm)} cm` : '—'}
                          </Text>
                        </View>
                      </View>

                      <View style={[styles.profileFitnessDivider, { backgroundColor: theme.borderColor }]} />

                      {/* Weight */}
                      <View style={styles.profileFitnessRow}>
                        <Text style={[styles.profileFitnessLabel, { color: theme.textSecondary }]}>Weight</Text>
                        <View style={{ flex: 1, alignItems: 'flex-end' }}>
                          <Text style={{ color: theme.textPrimary, fontWeight: '900', fontSize: 14, textAlign: 'right' }}>
                            {userProfile?.weightKg ? `${Math.round(userProfile.weightKg)} kg` : '—'}
                          </Text>
                        </View>
                      </View>

                      <View style={[styles.profileFitnessDivider, { backgroundColor: theme.borderColor }]} />

                      {/* Goal */}
                      <View style={styles.profileFitnessRow}>
                        <Text style={[styles.profileFitnessLabel, { color: theme.textSecondary }]}>Fitness Goal</Text>
                        <View style={{ flex: 1, alignItems: 'flex-end' }}>
                          <Text style={{ color: theme.textPrimary, fontWeight: '900', fontSize: 14, textAlign: 'right' }}>
                            {userProfile?.goal || '—'}
                          </Text>
                        </View>
                      </View>
                    </>
                  )}
                </View>
              </View>

              {/* Logging Workflow Mode */}
              <View style={styles.profileFullSection}>
                <Text style={[styles.profileFullSectionTitle, { color: theme.textPrimary }]}>LOGGING WORKFLOW</Text>
                <View style={[styles.profileFitnessCard, { backgroundColor: theme.cardBg, borderColor: theme.borderColor, padding: 12 }]}>
                  {/* Segmented Switcher */}
                  <View
                    style={{
                      flexDirection: 'row',
                      backgroundColor: isDarkMode ? '#13141C' : '#F3F4F6',
                      borderRadius: 12,
                      padding: 4,
                      borderWidth: 1,
                      borderColor: theme.borderColor,
                      gap: 4,
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => handleSetLoggingMode('post_workout')}
                      activeOpacity={0.7}
                      style={{
                        flex: 1,
                        paddingVertical: 10,
                        paddingHorizontal: 6,
                        borderRadius: 9,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: loggingMode === 'post_workout'
                          ? (isDarkMode ? '#1E2235' : '#FFFFFF')
                          : 'transparent',
                        borderWidth: loggingMode === 'post_workout' ? 1 : 0,
                        borderColor: loggingMode === 'post_workout' ? '#10B981' : 'transparent',
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: '800',
                          color: loggingMode === 'post_workout' ? '#10B981' : theme.textSecondary,
                          textAlign: 'center',
                        }}
                      >
                        Focus (Recommended)
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleSetLoggingMode('live')}
                      activeOpacity={0.7}
                      style={{
                        flex: 1,
                        paddingVertical: 10,
                        paddingHorizontal: 6,
                        borderRadius: 9,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: loggingMode === 'live'
                          ? (isDarkMode ? '#1E2235' : '#FFFFFF')
                          : 'transparent',
                        borderWidth: loggingMode === 'live' ? 1 : 0,
                        borderColor: loggingMode === 'live' ? '#10B981' : 'transparent',
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: '800',
                          color: loggingMode === 'live' ? '#10B981' : theme.textSecondary,
                          textAlign: 'center',
                        }}
                      >
                        Live Session (In Gym)
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Contextual Description */}
                  <View
                    style={{
                      marginTop: 10,
                      paddingVertical: 10,
                      paddingHorizontal: 12,
                      borderRadius: 10,
                      backgroundColor: isDarkMode ? '#10B98110' : '#10B98108',
                      borderLeftWidth: 3,
                      borderLeftColor: '#10B981',
                    }}
                  >
                    <Text style={{ fontSize: 11.5, color: theme.textSecondary, lineHeight: 17 }}>
                      {loggingMode === 'post_workout'
                        ? 'Pick one exercise at a time and enter all your weights and reps completely.'
                        : 'Select multiple exercises first to prepare your whole workout, then go through them.'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Achievements */}
              <View style={styles.profileFullSection}>
                <Text style={[styles.profileFullSectionTitle, { color: theme.textPrimary }]}>ACHIEVEMENTS</Text>
                <View style={[styles.profileAchievementSummary, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
                  <View style={styles.profileAchievementSummaryRow}>
                    <Text style={[styles.profileAchievementSummaryText, { color: theme.textPrimary }]}>
                      {achievements.filter(a => a.isUnlocked).length} of {achievements.length} Unlocked
                    </Text>
                    <Text style={[styles.profileAchievementSummaryPct, { color: theme.textSecondary }]}>
                      {achievements.length > 0 ? Math.round((achievements.filter(a => a.isUnlocked).length / achievements.length) * 100) : 0}%
                    </Text>
                  </View>
                  <View style={styles.profileAchievementTrack}>
                    <View style={[styles.profileAchievementBar, { width: `${achievements.length > 0 ? Math.round((achievements.filter(a => a.isUnlocked).length / achievements.length) * 100) : 0}%` }]} />
                  </View>
                </View>

                {achievements.filter(a => a.isUnlocked).length > 0 ? (
                  <>
                    <Text style={[styles.profileMilestoneLabel, { color: theme.textSecondary }]}>UNLOCKED</Text>
                    {achievements.filter(a => a.isUnlocked).slice(0, 5).map((a) => (
                      <View key={a.id} style={[styles.profileAchievementCard, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
                        <View style={styles.profileAchievementCardLeft}>
                          <Award size={18} color="#10B981" strokeWidth={2.5} />
                          <View style={{ marginLeft: 10 }}>
                            <Text style={[styles.profileAchievementTitle, { color: theme.textPrimary }]}>{a.title}</Text>
                            <Text style={[styles.profileAchievementDesc, { color: theme.textSecondary }]}>{a.description}</Text>
                          </View>
                        </View>
                        <CheckCircle size={16} color="#10B981" strokeWidth={2.5} fill="#10B981" />
                      </View>
                    ))}
                  </>
                ) : null}

                <Text style={[styles.profileMilestoneLabel, { color: theme.textSecondary }]}>NEXT MILESTONES</Text>
                {achievements.filter(a => !a.isUnlocked).sort((a, b) => b.progress - a.progress).slice(0, 3).map((a) => (
                  <View key={a.id} style={[styles.profileAchievementCard, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
                    <View style={{ flex: 1 }}>
                      <View style={styles.profileAchievementCardRow}>
                        <Text style={[styles.profileAchievementTitle, { color: theme.textPrimary }]}>{a.title}</Text>
                        <Text style={{ fontSize: 11, fontWeight: '700', color: '#9CA3AF' }}>{a.targetLabel}</Text>
                      </View>
                      <Text style={[styles.profileAchievementDesc, { color: theme.textSecondary }]}>{a.description}</Text>
                      <View style={styles.profileAchievementMiniTrack}>
                        <View style={[styles.profileAchievementMiniBar, { width: `${a.progress}%` }]} />
                      </View>
                    </View>
                  </View>
                ))}
              </View>

              {/* Personal Records */}
              {prs.length > 0 ? (
                <View style={styles.profileFullSection}>
                  <Text style={[styles.profileFullSectionTitle, { color: theme.textPrimary }]}>PERSONAL RECORDS</Text>
                  {prs.slice(0, 5).map((pr, idx) => (
                    <View key={idx} style={[styles.profilePrCard, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.profilePrExerciseName, { color: theme.textPrimary }]}>{pr.exerciseName}</Text>
                        <Text style={[styles.profilePrDetails, { color: theme.textSecondary }]}>{pr.weight} kg × {pr.reps} reps</Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ fontSize: 11, fontWeight: '700', color: '#9CA3AF' }}>{pr.date}</Text>
                        <Text style={{ fontSize: 11, fontWeight: '700', color: '#10B981' }}>e1RM: {pr.estimatedOneRM} kg</Text>
                      </View>
                    </View>
                  ))}
                </View>
              ) : null}

                {/* Bottom: Sign Out / Sign In */}
                <View style={[styles.profileFullSection, { marginTop: 12 }]}>
                  {userEmail || auth.currentUser ? (
                    <TouchableOpacity
                      style={styles.profileSignOutBtn}
                      onPress={handleLogout}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.profileSignOutText}>Sign out</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={[styles.profileSignInBtn, isProfileSigningIn && { opacity: 0.7 }]}
                      onPress={handleProfileSignIn}
                      disabled={isProfileSigningIn}
                      activeOpacity={0.7}
                    >
                      {isProfileSigningIn ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <>
                          <User size={16} color="#FFFFFF" strokeWidth={2.5} />
                          <Text style={styles.profileSignInText}>Sign in with Google</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              </ScrollView>
            </Animated.View>
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
  weekStartToggle: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#10B98140',
    padding: 2,
    alignItems: 'center',
    marginRight: 4,
    backgroundColor: '#10B98108',
  },
  weekStartToggleOption: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weekStartToggleText: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.3,
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
    width: '14%',
    textAlign: 'left',
    color: '#FFFFFF',
    fontWeight: '800',
  },
  widthWeight: {
    width: '37%',
    alignItems: 'center',
  },
  widthReps: {
    width: '37%',
    alignItems: 'center',
  },
  widthActions: {
    width: '12%',
    alignItems: 'center',
    justifyContent: 'center',
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
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EF444415',
    alignItems: 'center',
    justifyContent: 'center',
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
  exerciseNavBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loggerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    gap: 12,
  },
  removeSetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 42,
    paddingHorizontal: 12,
    borderRadius: 99,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#EF444450',
    backgroundColor: '#EF44440D',
    gap: 6,
  },
  removeSetBtnText: {
    fontSize: 11,
    color: '#EF4444',
    fontWeight: '800',
    letterSpacing: 0.5,
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
    flex: 1,
    flexShrink: 1,
    gap: 3,
    marginRight: 8,
  },
  historySessionName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
    flexShrink: 1,
  },
  historyDate: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  deleteLogBtn: {
    padding: 6,
    flexShrink: 0,
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
    flexDirection: 'column',
    alignItems: 'stretch',
    marginBottom: 12,
  },
  detailTitleCol: {
    marginRight: 32, // Leave room for floating close button
    gap: 3,
    marginBottom: 10,
  },
  detailSessionName: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
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
    borderWidth: 1.5,
    borderColor: '#10B981',
    backgroundColor: 'transparent',
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: 99,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  templateStartBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#10B981',
    letterSpacing: 0.6,
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
  modalHeaderMinimal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
    minHeight: 64,
  },
  modalHeaderTitleCol: {
    flex: 1,
    marginRight: 12,
    justifyContent: 'center',
  },
  modalHeaderTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  modalHeaderSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
    letterSpacing: 0.1,
  },
  modalAddExercisePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: '#10B98140',
    backgroundColor: '#10B98110',
  },
  modalAddExercisePillText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  modalCloseIconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
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
    position: 'relative',
    marginTop: 14,
    marginBottom: 4,
    height: 34,
    justifyContent: 'center',
  },
  modalSwitcherScroll: {
    gap: 8,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  switcherLeftFade: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 28,
    zIndex: 10,
  },
  switcherRightFade: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 28,
    zIndex: 10,
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
    gap: 8,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerActionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 99,
    borderWidth: 1,
  },
  timerActionText: {
    fontSize: 12,
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
  activeSwipeActionBackground: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    gap: 8,
  },
  activeSwipeActionText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  loggerSwipeBackdrop: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    gap: 6,
    zIndex: 0,
  },
  loggerSwipeText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  loggerSwipeHintTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 99,
    borderWidth: 1,
    marginLeft: 2,
  },
  loggerSwipeHintText: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
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
  replaceOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  replaceOptionItemName: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  cancelReplaceBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 8,
  },
  cancelReplaceBtnText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
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
    alignItems: 'center',
    marginBottom: 12,
    width: '100%',
  },
  loggerNavPillWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginBottom: 10,
    width: '100%',
  },
  loggerNavPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loggerNavPillIndex: {
    fontSize: 10,
    fontWeight: '700',
  },
  loggerNavPillText: {
    fontSize: 11,
    maxWidth: 90,
    letterSpacing: -0.2,
  },
  exerciseLoggerTitleCol: {
    flex: 1,
    paddingRight: 12,
    justifyContent: 'center',
  },
  exerciseLoggerName: {
    fontSize: 16,
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
  modalDeleteOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    zIndex: 999,
    elevation: 20,
  },
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
  modalSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 8,
    gap: 10,
  },
  modalSectionHeaderText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  modalSectionHeaderLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    opacity: 0.5,
  },
  modalExerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  modalExerciseMainClick: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  modalExerciseName: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  modalExerciseActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 6,
  },
  modalExerciseActionBtn: {
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalExerciseCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
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
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#10B98140',
    backgroundColor: '#10B98105',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  addExerciseBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#10B981',
    letterSpacing: 0.5,
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
  // Profile styles
  profileBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  profileBadgeInitials: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  profileFull: {
    flex: 1,
    paddingTop: 50,
  },
  profileFullHeader: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  profileFullBack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileFullBackText: {
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 4,
  },
  profileFullTop: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  profileAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileAvatarText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  profileStatsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 24,
  },
  profileStatCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  profileStatNumber: {
    fontSize: 22,
    fontWeight: '900',
  },
  profileStatLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  profileFullSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  profileFullSectionTitle: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  profileAchievementSummary: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  profileAchievementSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  profileAchievementSummaryText: {
    fontSize: 14,
    fontWeight: '700',
  },
  profileAchievementSummaryPct: {
    fontSize: 13,
    fontWeight: '800',
  },
  profileAchievementTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#212330',
    overflow: 'hidden',
  },
  profileAchievementBar: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  profileMilestoneLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 4,
  },
  profileAchievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 8,
  },
  profileAchievementCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileAchievementTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  profileAchievementDesc: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  profileAchievementCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileAchievementMiniTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#212330',
    marginTop: 8,
    overflow: 'hidden',
  },
  profileAchievementMiniBar: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: '#10B981',
  },
  profilePrCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 8,
  },
  profilePrExerciseName: {
    fontSize: 13,
    fontWeight: '700',
  },
  profilePrDetails: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  profileFitnessCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
  },
  profileFitnessRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  profileFitnessLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  profileFitnessValue: {
    fontSize: 16,
    fontWeight: '900',
  },
  profileFitnessDivider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 2,
  },
  profileFullBottom: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#212330',
  },
  profileSignOutBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF444415',
  },
  profileSignOutText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#EF4444',
  },
  profileSignInBtn: {
    width: '100%',
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    gap: 8,
  },
  profileSignInText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  profileEditInput: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
    fontWeight: '700',
  },
});
