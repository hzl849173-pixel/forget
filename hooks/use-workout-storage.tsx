import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_EXERCISES, MuscleGroup, ExerciseSeed } from '../constants/exercises';

export interface WorkoutSet {
  id: string;
  weight: number;
  reps: number;
  isCompleted: boolean;
}

export interface LoggedExercise {
  exerciseId: string;
  sets: WorkoutSet[];
  notes?: string;
}

export interface WorkoutSession {
  id: string;
  date: string; // ISO String
  name: string;
  duration: number; // in minutes
  exercises: LoggedExercise[];
}

export interface Exercise extends ExerciseSeed {}

interface WorkoutContextType {
  exercises: Exercise[];
  history: WorkoutSession[];
  isLoading: boolean;
  favoriteOrder: string[];
  addCompletedWorkout: (name: string, loggedExercises: LoggedExercise[], durationMinutes: number) => Promise<void>;
  createCustomExercise: (name: string, muscleGroup: MuscleGroup) => Promise<Exercise>;
  toggleFavoriteExercise: (exerciseId: string) => Promise<void>;
  deleteWorkout: (id: string) => Promise<void>;
  getPreviousWorkoutForExercise: (exerciseId: string) => LoggedExercise | null;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

const STORAGE_KEYS = {
  EXERCISES: '@workout_journal_exercises_v2',
  HISTORY: '@workout_journal_history_v2',
  FAVORITE_ORDER: '@workout_journal_favorite_order',
};

const generateId = () => Date.now().toString() + Math.random().toString(36).substring(2, 9);

export const WorkoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [history, setHistory] = useState<WorkoutSession[]>([]);
  const [favoriteOrder, setFavoriteOrder] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    async function loadData() {
      try {
        const [storedExercises, storedHistory, storedFavoriteOrder] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.EXERCISES),
          AsyncStorage.getItem(STORAGE_KEYS.HISTORY),
          AsyncStorage.getItem(STORAGE_KEYS.FAVORITE_ORDER),
        ]);

        if (storedExercises) {
          setExercises(JSON.parse(storedExercises));
        } else {
          setExercises(DEFAULT_EXERCISES);
          await AsyncStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(DEFAULT_EXERCISES));
        }

        if (storedFavoriteOrder) {
          setFavoriteOrder(JSON.parse(storedFavoriteOrder));
        } else {
          const defaultFavs = DEFAULT_EXERCISES.filter((e) => e.isFavorite).map((e) => e.id);
          setFavoriteOrder(defaultFavs);
          await AsyncStorage.setItem(STORAGE_KEYS.FAVORITE_ORDER, JSON.stringify(defaultFavs));
        }

        if (storedHistory) {
          setHistory(JSON.parse(storedHistory));
        }
      } catch (error) {
        console.error('Failed to load local storage workout data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const saveExercises = async (newExercises: Exercise[]) => {
    setExercises(newExercises);
    await AsyncStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(newExercises));
  };

  const saveFavoriteOrder = async (newOrder: string[]) => {
    setFavoriteOrder(newOrder);
    await AsyncStorage.setItem(STORAGE_KEYS.FAVORITE_ORDER, JSON.stringify(newOrder));
  };

  const saveHistory = async (newHistory: WorkoutSession[]) => {
    setHistory(newHistory);
    await AsyncStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(newHistory));
  };

  const addCompletedWorkout = async (name: string, loggedExercises: LoggedExercise[], durationMinutes: number) => {
    const completedSession: WorkoutSession = {
      id: generateId(),
      date: new Date().toISOString(),
      name,
      duration: durationMinutes,
      exercises: loggedExercises,
    };

    const newHistory = [completedSession, ...history];
    await saveHistory(newHistory);
  };

  const getPreviousWorkoutForExercise = (exerciseId: string): LoggedExercise | null => {
    for (const session of history) {
      const exerciseLog = session.exercises.find((e) => e.exerciseId === exerciseId);
      if (exerciseLog && exerciseLog.sets.length > 0) {
        return exerciseLog;
      }
    }
    return null;
  };

  const createCustomExercise = async (name: string, muscleGroup: MuscleGroup): Promise<Exercise> => {
    const newExercise: Exercise = {
      id: generateId(),
      name: name.trim(),
      muscleGroup,
      isCustom: true,
      isFavorite: false,
    };
    const newExercises = [...exercises, newExercise];
    await saveExercises(newExercises);
    return newExercise;
  };

  const toggleFavoriteExercise = async (exerciseId: string) => {
    const target = exercises.find((e) => e.id === exerciseId);
    if (!target) return;
    const willBeFav = !target.isFavorite;

    const newExercises = exercises.map((e) =>
      e.id === exerciseId ? { ...e, isFavorite: willBeFav } : e
    );

    let newOrder: string[];
    if (willBeFav) {
      newOrder = [...favoriteOrder.filter((id) => id !== exerciseId), exerciseId];
    } else {
      newOrder = favoriteOrder.filter((id) => id !== exerciseId);
    }

    await Promise.all([
      saveExercises(newExercises),
      saveFavoriteOrder(newOrder),
    ]);
  };

  const deleteWorkout = async (id: string) => {
    const newHistory = history.filter((w) => w.id !== id);
    await saveHistory(newHistory);
  };

  return (
    <WorkoutContext.Provider
      value={{
        exercises,
        history,
        isLoading,
        favoriteOrder,
        addCompletedWorkout,
        createCustomExercise,
        toggleFavoriteExercise,
        deleteWorkout,
        getPreviousWorkoutForExercise,
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
};

export const useWorkout = () => {
  const context = useContext(WorkoutContext);
  if (context === undefined) {
    throw new Error('useWorkout must be used within a WorkoutProvider');
  }
  return context;
};
