import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_EXERCISES, MuscleGroup, ExerciseSeed, Instrument } from '../constants/exercises';

export interface WorkoutSet {
  id: string;
  weight: number;
  reps: number;
  isCompleted: boolean;
}

export interface LoggedExercise {
  id?: string;
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

export interface PersonalRecord {
  exerciseId: string;
  weight: number;
  reps: number;
  date: string;
  estimatedOneRM: number;
}

export interface Exercise extends ExerciseSeed {}

export interface WorkoutInsights {
  mostTrainedMuscle: { muscle: string; count: number } | null;
  mostPerformedExercise: { exerciseId: string; name: string; count: number } | null;
  totalWorkoutsThisMonth: number;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  exercises: LoggedExercise[];
  createdAt: string;
  usageCount?: number;
}

export const DEFAULT_TEMPLATES: WorkoutTemplate[] = [
  {
    id: 'tmpl-push',
    name: 'Push Day',
    createdAt: '2026-07-30T00:00:00.000Z',
    exercises: [
      {
        exerciseId: 'bb-bench-press',
        sets: [
          { id: 'bb-bench-press-1', weight: 0, reps: 0, isCompleted: false },
          { id: 'bb-bench-press-2', weight: 0, reps: 0, isCompleted: false },
          { id: 'bb-bench-press-3', weight: 0, reps: 0, isCompleted: false },
        ],
      },
      {
        exerciseId: 'db-shoulder-press',
        sets: [
          { id: 'db-shoulder-press-1', weight: 0, reps: 0, isCompleted: false },
          { id: 'db-shoulder-press-2', weight: 0, reps: 0, isCompleted: false },
          { id: 'db-shoulder-press-3', weight: 0, reps: 0, isCompleted: false },
        ],
      },
      {
        exerciseId: 'bb-incline-press',
        sets: [
          { id: 'bb-incline-press-1', weight: 0, reps: 0, isCompleted: false },
          { id: 'bb-incline-press-2', weight: 0, reps: 0, isCompleted: false },
          { id: 'bb-incline-press-3', weight: 0, reps: 0, isCompleted: false },
        ],
      },
      {
        exerciseId: 'db-lateral-raise',
        sets: [
          { id: 'db-lateral-raise-1', weight: 0, reps: 0, isCompleted: false },
          { id: 'db-lateral-raise-2', weight: 0, reps: 0, isCompleted: false },
          { id: 'db-lateral-raise-3', weight: 0, reps: 0, isCompleted: false },
        ],
      },
      {
        exerciseId: 'tricep-pushdown',
        sets: [
          { id: 'tricep-pushdown-1', weight: 0, reps: 0, isCompleted: false },
          { id: 'tricep-pushdown-2', weight: 0, reps: 0, isCompleted: false },
          { id: 'tricep-pushdown-3', weight: 0, reps: 0, isCompleted: false },
        ],
      },
    ],
  },
  {
    id: 'tmpl-pull',
    name: 'Pull Day',
    createdAt: '2026-07-30T00:00:00.000Z',
    exercises: [
      {
        exerciseId: 'pull-ups',
        sets: [
          { id: 'pull-ups-1', weight: 0, reps: 0, isCompleted: false },
          { id: 'pull-ups-2', weight: 0, reps: 0, isCompleted: false },
          { id: 'pull-ups-3', weight: 0, reps: 0, isCompleted: false },
        ],
      },
      {
        exerciseId: 'lat-pulldown',
        sets: [
          { id: 'lat-pulldown-1', weight: 0, reps: 0, isCompleted: false },
          { id: 'lat-pulldown-2', weight: 0, reps: 0, isCompleted: false },
          { id: 'lat-pulldown-3', weight: 0, reps: 0, isCompleted: false },
        ],
      },
      {
        exerciseId: 'cable-row',
        sets: [
          { id: 'cable-row-1', weight: 0, reps: 0, isCompleted: false },
          { id: 'cable-row-2', weight: 0, reps: 0, isCompleted: false },
          { id: 'cable-row-3', weight: 0, reps: 0, isCompleted: false },
        ],
      },
      {
        exerciseId: 'db-bicep-curl',
        sets: [
          { id: 'db-bicep-curl-1', weight: 0, reps: 0, isCompleted: false },
          { id: 'db-bicep-curl-2', weight: 0, reps: 0, isCompleted: false },
          { id: 'db-bicep-curl-3', weight: 0, reps: 0, isCompleted: false },
        ],
      },
      {
        exerciseId: 'db-hammer-curl',
        sets: [
          { id: 'db-hammer-curl-1', weight: 0, reps: 0, isCompleted: false },
          { id: 'db-hammer-curl-2', weight: 0, reps: 0, isCompleted: false },
          { id: 'db-hammer-curl-3', weight: 0, reps: 0, isCompleted: false },
        ],
      },
    ],
  },
  {
    id: 'tmpl-legs',
    name: 'Leg Day',
    createdAt: '2026-07-30T00:00:00.000Z',
    exercises: [
      {
        exerciseId: 'bb-squat',
        sets: [
          { id: 'bb-squat-1', weight: 0, reps: 0, isCompleted: false },
          { id: 'bb-squat-2', weight: 0, reps: 0, isCompleted: false },
          { id: 'bb-squat-3', weight: 0, reps: 0, isCompleted: false },
        ],
      },
      {
        exerciseId: 'rdl',
        sets: [
          { id: 'rdl-1', weight: 0, reps: 0, isCompleted: false },
          { id: 'rdl-2', weight: 0, reps: 0, isCompleted: false },
          { id: 'rdl-3', weight: 0, reps: 0, isCompleted: false },
        ],
      },
      {
        exerciseId: 'leg-press',
        sets: [
          { id: 'leg-press-1', weight: 0, reps: 0, isCompleted: false },
          { id: 'leg-press-2', weight: 0, reps: 0, isCompleted: false },
          { id: 'leg-press-3', weight: 0, reps: 0, isCompleted: false },
        ],
      },
      {
        exerciseId: 'leg-extensions',
        sets: [
          { id: 'leg-extensions-1', weight: 0, reps: 0, isCompleted: false },
          { id: 'leg-extensions-2', weight: 0, reps: 0, isCompleted: false },
          { id: 'leg-extensions-3', weight: 0, reps: 0, isCompleted: false },
        ],
      },
      {
        exerciseId: 'seated-leg-curls',
        sets: [
          { id: 'seated-leg-curls-1', weight: 0, reps: 0, isCompleted: false },
          { id: 'seated-leg-curls-2', weight: 0, reps: 0, isCompleted: false },
          { id: 'seated-leg-curls-3', weight: 0, reps: 0, isCompleted: false },
        ],
      },
    ],
  },
  {
    id: 'tmpl-upper',
    name: 'Upper Body',
    createdAt: '2026-07-30T00:00:00.000Z',
    exercises: [
      {
        exerciseId: 'bb-bench-press',
        sets: [
          { id: 'bb-upper-bench-1', weight: 0, reps: 0, isCompleted: false },
          { id: 'bb-upper-bench-2', weight: 0, reps: 0, isCompleted: false },
          { id: 'bb-upper-bench-3', weight: 0, reps: 0, isCompleted: false },
        ],
      },
      {
        exerciseId: 'lat-pulldown',
        sets: [
          { id: 'lat-upper-pulldown-1', weight: 0, reps: 0, isCompleted: false },
          { id: 'lat-upper-pulldown-2', weight: 0, reps: 0, isCompleted: false },
          { id: 'lat-upper-pulldown-3', weight: 0, reps: 0, isCompleted: false },
        ],
      },
      {
        exerciseId: 'db-shoulder-press',
        sets: [
          { id: 'db-upper-press-1', weight: 0, reps: 0, isCompleted: false },
          { id: 'db-upper-press-2', weight: 0, reps: 0, isCompleted: false },
          { id: 'db-upper-press-3', weight: 0, reps: 0, isCompleted: false },
        ],
      },
      {
        exerciseId: 'cable-row',
        sets: [
          { id: 'cable-upper-row-1', weight: 0, reps: 0, isCompleted: false },
          { id: 'cable-upper-row-2', weight: 0, reps: 0, isCompleted: false },
          { id: 'cable-upper-row-3', weight: 0, reps: 0, isCompleted: false },
        ],
      },
      {
        exerciseId: 'db-bicep-curl',
        sets: [
          { id: 'db-upper-curl-1', weight: 0, reps: 0, isCompleted: false },
          { id: 'db-upper-curl-2', weight: 0, reps: 0, isCompleted: false },
        ],
      },
      {
        exerciseId: 'tricep-pushdown',
        sets: [
          { id: 'tricep-upper-pushdown-1', weight: 0, reps: 0, isCompleted: false },
          { id: 'tricep-upper-pushdown-2', weight: 0, reps: 0, isCompleted: false },
        ],
      },
    ],
  },
  {
    id: 'tmpl-full',
    name: 'Full Body',
    createdAt: '2026-07-30T00:00:00.000Z',
    exercises: [
      {
        exerciseId: 'bb-squat',
        sets: [
          { id: 'bb-full-squat-1', weight: 0, reps: 0, isCompleted: false },
          { id: 'bb-full-squat-2', weight: 0, reps: 0, isCompleted: false },
          { id: 'bb-full-squat-3', weight: 0, reps: 0, isCompleted: false },
        ],
      },
      {
        exerciseId: 'bb-bench-press',
        sets: [
          { id: 'bb-full-bench-1', weight: 0, reps: 0, isCompleted: false },
          { id: 'bb-full-bench-2', weight: 0, reps: 0, isCompleted: false },
          { id: 'bb-full-bench-3', weight: 0, reps: 0, isCompleted: false },
        ],
      },
      {
        exerciseId: 'pull-ups',
        sets: [
          { id: 'pull-full-ups-1', weight: 0, reps: 0, isCompleted: false },
          { id: 'pull-full-ups-2', weight: 0, reps: 0, isCompleted: false },
          { id: 'pull-full-ups-3', weight: 0, reps: 0, isCompleted: false },
        ],
      },
      {
        exerciseId: 'db-shoulder-press',
        sets: [
          { id: 'db-full-press-1', weight: 0, reps: 0, isCompleted: false },
          { id: 'db-full-press-2', weight: 0, reps: 0, isCompleted: false },
        ],
      },
      {
        exerciseId: 'rdl',
        sets: [
          { id: 'rdl-full-1', weight: 0, reps: 0, isCompleted: false },
          { id: 'rdl-full-2', weight: 0, reps: 0, isCompleted: false },
        ],
      },
    ],
  },
];

interface WorkoutContextType {
  exercises: Exercise[];
  history: WorkoutSession[];
  isLoading: boolean;
  favoriteOrder: string[];
  prs: PersonalRecord[];
  templates: WorkoutTemplate[];
  weekStartDay: number;
  setWeekStartDay: (day: number) => Promise<void>;
  addCompletedWorkout: (name: string, loggedExercises: LoggedExercise[], durationMinutes: number) => Promise<PersonalRecord[]>;
  createCustomExercise: (name: string, muscleGroup: MuscleGroup, instrument?: Instrument) => Promise<Exercise>;
  toggleFavoriteExercise: (exerciseId: string) => Promise<void>;
  deleteCustomExercise: (exerciseId: string) => Promise<void>;
  deleteWorkout: (id: string) => Promise<void>;
  updateWorkout: (id: string, updates: Partial<Pick<WorkoutSession, 'name' | 'exercises'>>) => Promise<void>;
  getPreviousWorkoutForExercise: (exerciseId: string) => LoggedExercise | null;
  getPreviousSessionForExercise: (exerciseId: string) => { session: WorkoutSession; log: LoggedExercise } | null;
  getExercisePR: (exerciseId: string) => PersonalRecord | undefined;
  getWorkoutInsights: () => WorkoutInsights;
  saveTemplate: (name: string, exercises: LoggedExercise[]) => Promise<WorkoutTemplate>;
  updateTemplate: (id: string, exercises: LoggedExercise[]) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  incrementTemplateUsage: (id: string) => Promise<void>;
  restDaysOfWeek: number[];
  toggleRestDayOfWeek: (day: number) => Promise<void>;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

const STORAGE_KEYS = {
  EXERCISES: '@workout_journal_exercises_v2',
  HISTORY: '@workout_journal_history_v2',
  FAVORITE_ORDER: '@workout_journal_favorite_order',
  PRS: '@workout_journal_prs_v1',
  TEMPLATES: '@workout_journal_templates_v1',
  WEEK_START_DAY: '@workout_journal_week_start_day',
  REST_DAYS_OF_WEEK: '@workout_journal_rest_days_of_week',
};

const generateId = () => Date.now().toString() + Math.random().toString(36).substring(2, 9);

export const WorkoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [history, setHistory] = useState<WorkoutSession[]>([]);
  const [favoriteOrder, setFavoriteOrder] = useState<string[]>([]);
  const [prs, setPrs] = useState<PersonalRecord[]>([]);
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [weekStartDay, setWeekStartDayState] = useState(0);
  const [restDaysOfWeek, setRestDaysOfWeek] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    async function loadData() {
      try {
        const [storedExercises, storedHistory, storedFavoriteOrder, storedPrs, storedTemplates] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.EXERCISES),
          AsyncStorage.getItem(STORAGE_KEYS.HISTORY),
          AsyncStorage.getItem(STORAGE_KEYS.FAVORITE_ORDER),
          AsyncStorage.getItem(STORAGE_KEYS.PRS),
          AsyncStorage.getItem(STORAGE_KEYS.TEMPLATES),
        ]);

        if (storedExercises) {
          const parsed: Exercise[] = JSON.parse(storedExercises);
          const storedIds = new Set(parsed.map((e) => e.id));
          const defaultMap = new Map(DEFAULT_EXERCISES.map((e) => [e.id, e]));
          const missingDefaults = DEFAULT_EXERCISES.filter((e) => !storedIds.has(e.id));
          
          let changed = false;
          const updated = parsed.map((e) => {
            const def = defaultMap.get(e.id);
            if (def && !e.isCustom) {
              if (e.name !== def.name || e.instrument !== def.instrument || e.muscleGroup !== def.muscleGroup) {
                changed = true;
                return {
                  ...e,
                  name: def.name,
                  instrument: def.instrument,
                  muscleGroup: def.muscleGroup,
                };
              }
            }
            if (!e.instrument) {
              changed = true;
              return {
                ...e,
                instrument: 'Other' as const,
              };
            }
            return e;
          });

          if (changed || missingDefaults.length > 0) {
            const migrated = [
              ...updated,
              ...missingDefaults,
            ];
            setExercises(migrated);
            await AsyncStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(migrated));
          } else {
            setExercises(updated);
          }
        } else {
          setExercises(DEFAULT_EXERCISES);
          await AsyncStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(DEFAULT_EXERCISES));
        }

        if (storedFavoriteOrder) {
          const parsedOrder: string[] = JSON.parse(storedFavoriteOrder);
          const defaultFavIds = new Set(DEFAULT_EXERCISES.filter((e) => e.isFavorite).map((e) => e.id));
          const missingFavs = [...defaultFavIds].filter((id) => !parsedOrder.includes(id));
          if (missingFavs.length > 0) {
            const mergedOrder = [...parsedOrder, ...missingFavs];
            setFavoriteOrder(mergedOrder);
            await AsyncStorage.setItem(STORAGE_KEYS.FAVORITE_ORDER, JSON.stringify(mergedOrder));
          } else {
            setFavoriteOrder(parsedOrder);
          }
        } else {
          const defaultFavs = DEFAULT_EXERCISES.filter((e) => e.isFavorite).map((e) => e.id);
          setFavoriteOrder(defaultFavs);
          await AsyncStorage.setItem(STORAGE_KEYS.FAVORITE_ORDER, JSON.stringify(defaultFavs));
        }

        if (storedHistory) {
          setHistory(JSON.parse(storedHistory));
        }

        if (storedPrs) {
          setPrs(JSON.parse(storedPrs));
        }

        let parsedTemplates: WorkoutTemplate[] = [];
        if (storedTemplates) {
          parsedTemplates = JSON.parse(storedTemplates);
        }

        const storedTemplateIds = new Set(parsedTemplates.map((t) => t.id));
        const missingDefaultTemplates = DEFAULT_TEMPLATES.filter((t) => !storedTemplateIds.has(t.id));

        if (missingDefaultTemplates.length > 0) {
          const mergedTemplates = [...parsedTemplates, ...missingDefaultTemplates];
          setTemplates(mergedTemplates);
          await AsyncStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(mergedTemplates));
        } else {
          setTemplates(parsedTemplates);
        }

        const storedWeekStart = await AsyncStorage.getItem(STORAGE_KEYS.WEEK_START_DAY);
        if (storedWeekStart !== null) {
          setWeekStartDayState(Number(storedWeekStart));
        }

        const storedRestDays = await AsyncStorage.getItem(STORAGE_KEYS.REST_DAYS_OF_WEEK);
        if (storedRestDays !== null) {
          setRestDaysOfWeek(JSON.parse(storedRestDays));
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

  const savePrs = async (newPrs: PersonalRecord[]) => {
    setPrs(newPrs);
    await AsyncStorage.setItem(STORAGE_KEYS.PRS, JSON.stringify(newPrs));
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

    // Detect PRs
    const newPrs = [...prs];
    const detectedPrs: PersonalRecord[] = [];
    for (const logEx of loggedExercises) {
      for (const set of logEx.sets) {
        if (set.weight <= 0 || set.reps <= 0) continue;
        const estimatedOneRM = Math.round(set.weight * (1 + set.reps / 30));
        const existing = newPrs.find((p) => p.exerciseId === logEx.exerciseId);
        if (!existing || estimatedOneRM > existing.estimatedOneRM) {
          const pr: PersonalRecord = {
            exerciseId: logEx.exerciseId,
            weight: set.weight,
            reps: set.reps,
            date: completedSession.date,
            estimatedOneRM,
          };
          if (existing) {
            const idx = newPrs.findIndex((p) => p.exerciseId === logEx.exerciseId);
            newPrs[idx] = pr;
          } else {
            newPrs.push(pr);
          }
          detectedPrs.push(pr);
        }
      }
    }
    if (detectedPrs.length > 0) {
      await savePrs(newPrs);
    }
    return detectedPrs;
  };

  const updateWorkout = async (id: string, updates: Partial<Pick<WorkoutSession, 'name' | 'exercises'>>) => {
    const newHistory = history.map((w) =>
      w.id === id ? { ...w, ...updates } : w
    );
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

  const getPreviousSessionForExercise = (exerciseId: string): { session: WorkoutSession; log: LoggedExercise } | null => {
    for (const session of history) {
      const exerciseLog = session.exercises.find((e) => e.exerciseId === exerciseId);
      if (exerciseLog && exerciseLog.sets.length > 0) {
        return { session, log: exerciseLog };
      }
    }
    return null;
  };

  const getExercisePR = (exerciseId: string): PersonalRecord | undefined => {
    return prs.find((p) => p.exerciseId === exerciseId);
  };

  const getWorkoutInsights = (): WorkoutInsights => {
    const now = new Date();
    const thisMonth = history.filter((s) => {
      const d = new Date(s.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });

    // Most trained muscle
    const muscleCounts: Record<string, number> = {};
    let mostPerformedExercise: { exerciseId: string; name: string; count: number } | null = null;
    const exerciseCounts: Record<string, number> = {};

    for (const session of history) {
      for (const logEx of session.exercises) {
        const ex = exercises.find((e) => e.id === logEx.exerciseId);
        if (ex) {
          muscleCounts[ex.muscleGroup] = (muscleCounts[ex.muscleGroup] || 0) + logEx.sets.length;
          exerciseCounts[logEx.exerciseId] = (exerciseCounts[logEx.exerciseId] || 0) + logEx.sets.length;
        }
      }
    }

    for (const [exerciseId, count] of Object.entries(exerciseCounts)) {
      const ex = exercises.find((e) => e.id === exerciseId);
      if (!mostPerformedExercise || count > mostPerformedExercise.count) {
        mostPerformedExercise = {
          exerciseId,
          name: ex?.name || 'Unknown',
          count,
        };
      }
    }

    const mostTrainedMuscleEntries = Object.entries(muscleCounts).sort(([, a], [, b]) => b - a);
    const mostTrainedMuscle = mostTrainedMuscleEntries.length > 0
      ? { muscle: mostTrainedMuscleEntries[0][0], count: mostTrainedMuscleEntries[0][1] }
      : null;

    return {
      mostTrainedMuscle,
      mostPerformedExercise,
      totalWorkoutsThisMonth: thisMonth.length,
    };
  };

  const createCustomExercise = async (name: string, muscleGroup: MuscleGroup, instrument: Instrument = 'Other'): Promise<Exercise> => {
    const newExercise: Exercise = {
      id: generateId(),
      name: name.trim(),
      muscleGroup,
      instrument,
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

  const saveTemplate = async (name: string, templateExercises: LoggedExercise[]) => {
    const newTemplate: WorkoutTemplate = {
      id: generateId(),
      name: name.trim(),
      exercises: templateExercises,
      createdAt: new Date().toISOString(),
    };
    const newTemplates = [...templates, newTemplate];
    setTemplates(newTemplates);
    await AsyncStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(newTemplates));
    return newTemplate;
  };

  const deleteTemplate = async (id: string) => {
    const newTemplates = templates.filter((t) => t.id !== id);
    setTemplates(newTemplates);
    await AsyncStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(newTemplates));
  };

  const updateTemplate = async (id: string, updatedExercises: LoggedExercise[]) => {
    const newTemplates = templates.map((t) =>
      t.id === id ? { ...t, exercises: updatedExercises } : t
    );
    setTemplates(newTemplates);
    await AsyncStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(newTemplates));
  };

  const incrementTemplateUsage = async (id: string) => {
    const newTemplates = templates.map((t) =>
      t.id === id ? { ...t, usageCount: (t.usageCount || 0) + 1 } : t
    );
    setTemplates(newTemplates);
    await AsyncStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(newTemplates));
  };

  const setWeekStartDay = async (day: number) => {
    setWeekStartDayState(day);
    await AsyncStorage.setItem(STORAGE_KEYS.WEEK_START_DAY, String(day));
  };

  const deleteCustomExercise = async (exerciseId: string) => {
    const newExercises = exercises.filter((e) => e.id !== exerciseId);
    await saveExercises(newExercises);
    const newOrder = favoriteOrder.filter((id) => id !== exerciseId);
    await saveFavoriteOrder(newOrder);
  };

  const toggleRestDayOfWeek = async (day: number) => {
    const exists = restDaysOfWeek.includes(day);
    let newDays: number[];
    if (exists) {
      newDays = restDaysOfWeek.filter((d) => d !== day);
    } else {
      newDays = [...restDaysOfWeek, day];
    }
    setRestDaysOfWeek(newDays);
    await AsyncStorage.setItem(STORAGE_KEYS.REST_DAYS_OF_WEEK, JSON.stringify(newDays));
  };

  return (
    <WorkoutContext.Provider
      value={{
        exercises,
        history,
        isLoading,
        favoriteOrder,
        prs,
        templates,
        weekStartDay,
        setWeekStartDay,
        addCompletedWorkout,
        createCustomExercise,
        toggleFavoriteExercise,
        deleteCustomExercise,
        deleteWorkout,
        updateWorkout,
        getPreviousWorkoutForExercise,
        getPreviousSessionForExercise,
        getExercisePR,
        getWorkoutInsights,
        saveTemplate,
        updateTemplate,
        deleteTemplate,
        incrementTemplateUsage,
        restDaysOfWeek,
        toggleRestDayOfWeek,
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
