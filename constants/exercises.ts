export type MuscleGroup = 'Chest' | 'Triceps' | 'Biceps' | 'Back' | 'Shoulders' | 'Legs' | 'Abs' | 'Abs & Shoulders' | 'Back & Shoulders';

export type Instrument = 'Barbell' | 'Dumbbell' | 'Cable' | 'Machine' | 'Bodyweight' | 'Kettlebell' | 'Other';

export interface ExerciseSeed {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  instrument: Instrument;
  isCustom: boolean;
  isFavorite: boolean;
}

export const INSTRUMENT_ORDER: Instrument[] = [
  'Barbell',
  'Dumbbell',
  'Cable',
  'Machine',
  'Bodyweight',
  'Kettlebell',
  'Other',
];

export const INSTRUMENT_COLORS: Record<Instrument, string> = {
  Dumbbell: '#3B82F6',    // Electric Blue
  Barbell: '#EF4444',     // Crimson Red
  Cable: '#8B5CF6',       // Vivid Purple
  Machine: '#10B981',     // Emerald Green
  Bodyweight: '#F59E0B',  // Warm Amber
  Kettlebell: '#EC4899',  // Vibrant Pink
  Other: '#6B7280',       // Slate Gray
};

export const SHOULDER_EXERCISE_IDS = new Set([
  'bb-overhead-press',
  'bb-upright-row',
  'db-shoulder-press',
  'arnold-press',
  'db-lateral-raise',
  'db-front-raise',
  'db-rear-delt-fly',
  'incline-db-rear-delt',
  'cable-lateral-raise',
  'face-pull',
  'reverse-pec-deck',
  'machine-shoulder-press',
  'smith-shoulder-press',
]);

export const DEFAULT_EXERCISES: ExerciseSeed[] = [
  // ==========================
  // CHEST
  // ==========================
  // -- Barbell --
  { id: 'bb-bench-press', name: 'Barbell Bench Press', muscleGroup: 'Chest', instrument: 'Barbell', isCustom: false, isFavorite: true },
  { id: 'bb-incline-press', name: 'Incline Barbell Bench Press', muscleGroup: 'Chest', instrument: 'Barbell', isCustom: false, isFavorite: false },
  { id: 'bb-decline-press', name: 'Decline Barbell Press', muscleGroup: 'Chest', instrument: 'Barbell', isCustom: false, isFavorite: false },

  // -- Dumbbell --
  { id: 'db-bench-press', name: 'Flat Dumbbell Press', muscleGroup: 'Chest', instrument: 'Dumbbell', isCustom: false, isFavorite: false },
  { id: 'db-incline-press', name: 'Incline Dumbbell Press', muscleGroup: 'Chest', instrument: 'Dumbbell', isCustom: false, isFavorite: false },
  { id: 'db-decline-press', name: 'Decline Dumbbell Press', muscleGroup: 'Chest', instrument: 'Dumbbell', isCustom: false, isFavorite: false },
  { id: 'db-flyes', name: 'Flat Dumbbell Flyes', muscleGroup: 'Chest', instrument: 'Dumbbell', isCustom: false, isFavorite: false },
  { id: 'db-incline-flyes', name: 'Incline Dumbbell Flyes', muscleGroup: 'Chest', instrument: 'Dumbbell', isCustom: false, isFavorite: false },
  { id: 'db-pullover', name: 'Dumbbell Pullover', muscleGroup: 'Chest', instrument: 'Dumbbell', isCustom: false, isFavorite: false },

  // -- Cable --
  { id: 'cable-crossover', name: 'Cable Crossover', muscleGroup: 'Chest', instrument: 'Cable', isCustom: false, isFavorite: false },
  { id: 'high-to-low-cable', name: 'High to Low Cable Fly', muscleGroup: 'Chest', instrument: 'Cable', isCustom: false, isFavorite: false },
  { id: 'low-to-high-cable', name: 'Low to High Cable Fly', muscleGroup: 'Chest', instrument: 'Cable', isCustom: false, isFavorite: false },
  { id: 'cable-pullover', name: 'Cable Pullover', muscleGroup: 'Chest', instrument: 'Cable', isCustom: false, isFavorite: false },

  // -- Machine --
  { id: 'chest-press-machine', name: 'Chest Press Machine', muscleGroup: 'Chest', instrument: 'Machine', isCustom: false, isFavorite: false },
  { id: 'hammer-strength-press', name: 'Hammer Strength Chest Press', muscleGroup: 'Chest', instrument: 'Machine', isCustom: false, isFavorite: false },
  { id: 'pec-deck', name: 'Pec Deck Fly', muscleGroup: 'Chest', instrument: 'Machine', isCustom: false, isFavorite: false },
  { id: 'machine-decline-press', name: 'Machine Decline Press', muscleGroup: 'Chest', instrument: 'Machine', isCustom: false, isFavorite: false },
  { id: 'smith-bench-press', name: 'Smith Machine Bench Press', muscleGroup: 'Chest', instrument: 'Machine', isCustom: false, isFavorite: false },
  { id: 'smith-incline-press', name: 'Smith Machine Incline Press', muscleGroup: 'Chest', instrument: 'Machine', isCustom: false, isFavorite: false },

  // -- Bodyweight --
  { id: 'push-ups', name: 'Push-up', muscleGroup: 'Chest', instrument: 'Bodyweight', isCustom: false, isFavorite: false },
  { id: 'weighted-pushups', name: 'Weighted Push-ups', muscleGroup: 'Chest', instrument: 'Bodyweight', isCustom: false, isFavorite: false },
  { id: 'chest-dips', name: 'Parallel Bar Chest Dips', muscleGroup: 'Chest', instrument: 'Bodyweight', isCustom: false, isFavorite: false },
  { id: 'incline-pushup', name: 'Incline Push-up', muscleGroup: 'Chest', instrument: 'Bodyweight', isCustom: false, isFavorite: false },

  // ==========================
  // TRICEPS
  // ==========================
  // -- Cable --
  { id: 'tricep-pushdown', name: 'Tricep Pushdown', muscleGroup: 'Triceps', instrument: 'Cable', isCustom: false, isFavorite: true },
  { id: 'rope-pushdown', name: 'Rope Pushdown', muscleGroup: 'Triceps', instrument: 'Cable', isCustom: false, isFavorite: false },
  { id: 'cable-vbar-pushdown', name: 'Cable V-Bar Pushdown', muscleGroup: 'Triceps', instrument: 'Cable', isCustom: false, isFavorite: false },
  { id: 'straight-bar-pushdown', name: 'Straight Bar Cable Pushdown', muscleGroup: 'Triceps', instrument: 'Cable', isCustom: false, isFavorite: false },
  { id: 'single-arm-pushdown', name: 'Single Arm Pushdown', muscleGroup: 'Triceps', instrument: 'Cable', isCustom: false, isFavorite: false },
  { id: 'rev-grip-pushdown', name: 'Reverse Grip Tricep Pushdown', muscleGroup: 'Triceps', instrument: 'Cable', isCustom: false, isFavorite: false },
  { id: 'cable-overhead-ext', name: 'Overhead Cable Extension', muscleGroup: 'Triceps', instrument: 'Cable', isCustom: false, isFavorite: false },
  { id: 'cable-rope-overhead', name: 'Cable Overhead Rope Extension', muscleGroup: 'Triceps', instrument: 'Cable', isCustom: false, isFavorite: false },

  // -- Barbell --
  { id: 'skull-crushers', name: 'Skull Crusher', muscleGroup: 'Triceps', instrument: 'Barbell', isCustom: false, isFavorite: false },
  { id: 'bb-overhead-ext', name: 'Barbell Overhead Extension', muscleGroup: 'Triceps', instrument: 'Barbell', isCustom: false, isFavorite: false },
  { id: 'close-grip-bench', name: 'Close Grip Bench Press', muscleGroup: 'Triceps', instrument: 'Barbell', isCustom: false, isFavorite: false },

  // -- Dumbbell --
  { id: 'db-skull-crushers', name: 'Dumbbell Skull Crushers', muscleGroup: 'Triceps', instrument: 'Dumbbell', isCustom: false, isFavorite: false },
  { id: 'lying-db-ext', name: 'Lying Dumbbell Extension', muscleGroup: 'Triceps', instrument: 'Dumbbell', isCustom: false, isFavorite: false },
  { id: 'overhead-db-extension', name: 'Overhead Dumbbell Extension', muscleGroup: 'Triceps', instrument: 'Dumbbell', isCustom: false, isFavorite: false },
  { id: 'db-kickbacks', name: 'Dumbbell Kickbacks', muscleGroup: 'Triceps', instrument: 'Dumbbell', isCustom: false, isFavorite: false },
  { id: 'two-arm-db-overhead-ext', name: 'Two-Arm Overhead DB Extension', muscleGroup: 'Triceps', instrument: 'Dumbbell', isCustom: false, isFavorite: false },

  // -- Bodyweight --
  { id: 'bench-dips', name: 'Tricep Dips', muscleGroup: 'Triceps', instrument: 'Bodyweight', isCustom: false, isFavorite: false },
  { id: 'weighted-dips', name: 'Weighted Dips', muscleGroup: 'Triceps', instrument: 'Bodyweight', isCustom: false, isFavorite: false },
  { id: 'close-grip-pushups', name: 'Close-Grip Push-ups', muscleGroup: 'Triceps', instrument: 'Bodyweight', isCustom: false, isFavorite: false },
  { id: 'diamond-pushups', name: 'Diamond Push-ups', muscleGroup: 'Triceps', instrument: 'Bodyweight', isCustom: false, isFavorite: false },

  // -- Machine --
  { id: 'tricep-dip-machine', name: 'Tricep Dip Machine', muscleGroup: 'Triceps', instrument: 'Machine', isCustom: false, isFavorite: false },

  // ==========================
  // BICEPS
  // ==========================
  // -- Dumbbell --
  { id: 'db-bicep-curl', name: 'Dumbbell Curl', muscleGroup: 'Biceps', instrument: 'Dumbbell', isCustom: false, isFavorite: true },
  { id: 'incline-db-curl', name: 'Incline Dumbbell Curl', muscleGroup: 'Biceps', instrument: 'Dumbbell', isCustom: false, isFavorite: false },
  { id: 'concentration-curl', name: 'Concentration Curl', muscleGroup: 'Biceps', instrument: 'Dumbbell', isCustom: false, isFavorite: false },
  { id: 'spider-curl', name: 'Dumbbell Spider Curl', muscleGroup: 'Biceps', instrument: 'Dumbbell', isCustom: false, isFavorite: false },
  { id: 'db-hammer-curl', name: 'Hammer Curl', muscleGroup: 'Biceps', instrument: 'Dumbbell', isCustom: false, isFavorite: false },
  { id: 'crossbody-hammer', name: 'Cross-Body Hammer Curl', muscleGroup: 'Biceps', instrument: 'Dumbbell', isCustom: false, isFavorite: false },
  { id: 'db-preacher-curl', name: 'Dumbbell Preacher Curl', muscleGroup: 'Biceps', instrument: 'Dumbbell', isCustom: false, isFavorite: false },
  { id: 'incline-hammer-curl', name: 'Incline Hammer Curl', muscleGroup: 'Biceps', instrument: 'Dumbbell', isCustom: false, isFavorite: false },
  { id: 'zottman-curl', name: 'Zottman Curl', muscleGroup: 'Biceps', instrument: 'Dumbbell', isCustom: false, isFavorite: false },
  { id: 'rev-db-curl', name: 'Reverse Dumbbell Curl', muscleGroup: 'Biceps', instrument: 'Dumbbell', isCustom: false, isFavorite: false },

  // -- Barbell --
  { id: 'bb-curl', name: 'Barbell Curl', muscleGroup: 'Biceps', instrument: 'Barbell', isCustom: false, isFavorite: false },
  { id: 'ez-bar-curl', name: 'EZ Bar Curl', muscleGroup: 'Biceps', instrument: 'Barbell', isCustom: false, isFavorite: false },
  { id: 'ez-wide-curl', name: 'EZ Bar Wide Curl', muscleGroup: 'Biceps', instrument: 'Barbell', isCustom: false, isFavorite: false },
  { id: 'preacher-curl', name: 'Preacher Curl', muscleGroup: 'Biceps', instrument: 'Barbell', isCustom: false, isFavorite: false },
  { id: 'rev-bb-curl', name: 'Reverse Barbell Curl', muscleGroup: 'Biceps', instrument: 'Barbell', isCustom: false, isFavorite: false },

  // -- Cable --
  { id: 'cable-bicep-curl', name: 'Cable Curl', muscleGroup: 'Biceps', instrument: 'Cable', isCustom: false, isFavorite: false },
  { id: 'cable-hammer-curl', name: 'Cable Rope Hammer Curl', muscleGroup: 'Biceps', instrument: 'Cable', isCustom: false, isFavorite: false },
  { id: 'cable-rope-curl', name: 'Cable Rope Curl', muscleGroup: 'Biceps', instrument: 'Cable', isCustom: false, isFavorite: false },
  { id: 'cable-preacher-curl', name: 'Single-Arm Cable Preacher Curl', muscleGroup: 'Biceps', instrument: 'Cable', isCustom: false, isFavorite: false },
  { id: 'bayesian-cable-curl', name: 'Bayesian Cable Curl', muscleGroup: 'Biceps', instrument: 'Cable', isCustom: false, isFavorite: false },

  // -- Bodyweight --
  { id: 'chin-ups', name: 'Chin-ups', muscleGroup: 'Biceps', instrument: 'Bodyweight', isCustom: false, isFavorite: false },

  // -- Machine --
  { id: 'machine-bicep-curl', name: 'Machine Bicep Curl', muscleGroup: 'Biceps', instrument: 'Machine', isCustom: false, isFavorite: false },
  { id: 'machine-preacher-curl', name: 'Machine Preacher Curl', muscleGroup: 'Biceps', instrument: 'Machine', isCustom: false, isFavorite: false },

  // ==========================
  // BACK
  // ==========================
  // -- Barbell --
  { id: 'bb-row', name: 'Barbell Bent Over Row', muscleGroup: 'Back', instrument: 'Barbell', isCustom: false, isFavorite: false },
  { id: 'pendlay-row', name: 'Pendlay Row', muscleGroup: 'Back', instrument: 'Barbell', isCustom: false, isFavorite: false },
  { id: 'tbar-row', name: 'T-Bar Row', muscleGroup: 'Back', instrument: 'Barbell', isCustom: false, isFavorite: false },
  { id: 'deadlift', name: 'Deadlift', muscleGroup: 'Back', instrument: 'Barbell', isCustom: false, isFavorite: false },
  { id: 'trap-bar-deadlift', name: 'Trap Bar Deadlift', muscleGroup: 'Back', instrument: 'Barbell', isCustom: false, isFavorite: false },
  { id: 'rack-pulls', name: 'Rack Pulls', muscleGroup: 'Back', instrument: 'Barbell', isCustom: false, isFavorite: false },
  { id: 'bb-shrugs', name: 'Barbell Shrugs', muscleGroup: 'Back', instrument: 'Barbell', isCustom: false, isFavorite: false },
  { id: 'good-morning', name: 'Good Morning', muscleGroup: 'Back', instrument: 'Barbell', isCustom: false, isFavorite: false },

  // -- Dumbbell --
  { id: 'db-row', name: 'Dumbbell Row', muscleGroup: 'Back', instrument: 'Dumbbell', isCustom: false, isFavorite: false },
  { id: 'db-shrugs', name: 'Dumbbell Shrugs', muscleGroup: 'Back', instrument: 'Dumbbell', isCustom: false, isFavorite: false },

  // -- Cable --
  { id: 'cable-row', name: 'Seated Cable Row', muscleGroup: 'Back', instrument: 'Cable', isCustom: false, isFavorite: false },
  { id: 'single-arm-cable-row', name: 'Single-Arm Cable Row', muscleGroup: 'Back', instrument: 'Cable', isCustom: false, isFavorite: false },
  { id: 'lat-pulldown', name: 'Lat Pulldown', muscleGroup: 'Back', instrument: 'Cable', isCustom: false, isFavorite: false },
  { id: 'underhand-pulldown', name: 'Underhand Lat Pulldown', muscleGroup: 'Back', instrument: 'Cable', isCustom: false, isFavorite: false },
  { id: 'close-grip-pulldown', name: 'Close Grip Lat Pulldown', muscleGroup: 'Back', instrument: 'Cable', isCustom: false, isFavorite: false },
  { id: 'single-arm-pulldown', name: 'Single-Arm Lat Pulldown', muscleGroup: 'Back', instrument: 'Cable', isCustom: false, isFavorite: false },
  { id: 'lat-pushdowns', name: 'Cable Lat Pushdown', muscleGroup: 'Back', instrument: 'Cable', isCustom: false, isFavorite: false },
  { id: 'straight-arm-pulldown', name: 'Straight Arm Pulldown', muscleGroup: 'Back', instrument: 'Cable', isCustom: false, isFavorite: false },
  { id: 'cable-pullthroughs', name: 'Cable Pull-Throughs', muscleGroup: 'Back', instrument: 'Cable', isCustom: false, isFavorite: false },

  // -- Machine --
  { id: 'tbar-chest-supported', name: 'Chest-Supported T-Bar Row', muscleGroup: 'Back', instrument: 'Machine', isCustom: false, isFavorite: false },
  { id: 'chest-supported-row', name: 'Chest Supported Row', muscleGroup: 'Back', instrument: 'Machine', isCustom: false, isFavorite: false },
  { id: 'machine-row', name: 'Machine Row', muscleGroup: 'Back', instrument: 'Machine', isCustom: false, isFavorite: false },
  { id: 'assisted-pullup', name: 'Assisted Pull-up Machine', muscleGroup: 'Back', instrument: 'Machine', isCustom: false, isFavorite: false },
  { id: 'smith-shrugs', name: 'Smith Machine Shrugs', muscleGroup: 'Back', instrument: 'Machine', isCustom: false, isFavorite: false },

  // -- Bodyweight --
  { id: 'pull-ups', name: 'Pull-up', muscleGroup: 'Back', instrument: 'Bodyweight', isCustom: false, isFavorite: true },
  { id: 'hyperextensions', name: 'Back Hyperextensions', muscleGroup: 'Back', instrument: 'Bodyweight', isCustom: false, isFavorite: false },

  // ==========================
  // SHOULDERS
  // ==========================
  // -- Barbell --
  { id: 'bb-overhead-press', name: 'Overhead Press', muscleGroup: 'Shoulders', instrument: 'Barbell', isCustom: false, isFavorite: true },
  { id: 'bb-upright-row', name: 'Barbell Upright Row', muscleGroup: 'Shoulders', instrument: 'Barbell', isCustom: false, isFavorite: false },

  // -- Dumbbell --
  { id: 'db-shoulder-press', name: 'Dumbbell Shoulder Press', muscleGroup: 'Shoulders', instrument: 'Dumbbell', isCustom: false, isFavorite: false },
  { id: 'arnold-press', name: 'Arnold Press', muscleGroup: 'Shoulders', instrument: 'Dumbbell', isCustom: false, isFavorite: false },
  { id: 'db-lateral-raise', name: 'Lateral Raise', muscleGroup: 'Shoulders', instrument: 'Dumbbell', isCustom: false, isFavorite: false },
  { id: 'db-front-raise', name: 'Dumbbell Front Raise', muscleGroup: 'Shoulders', instrument: 'Dumbbell', isCustom: false, isFavorite: false },
  { id: 'db-rear-delt-fly', name: 'Rear Delt Fly', muscleGroup: 'Shoulders', instrument: 'Dumbbell', isCustom: false, isFavorite: false },
  { id: 'incline-db-rear-delt', name: 'Incline Dumbbell Rear Delt Fly', muscleGroup: 'Shoulders', instrument: 'Dumbbell', isCustom: false, isFavorite: false },

  // -- Cable --
  { id: 'cable-lateral-raise', name: 'Cable Lateral Raise', muscleGroup: 'Shoulders', instrument: 'Cable', isCustom: false, isFavorite: false },
  { id: 'face-pull', name: 'Face Pull', muscleGroup: 'Shoulders', instrument: 'Cable', isCustom: false, isFavorite: false },

  // -- Machine --
  { id: 'machine-shoulder-press', name: 'Machine Shoulder Press', muscleGroup: 'Shoulders', instrument: 'Machine', isCustom: false, isFavorite: false },
  { id: 'smith-shoulder-press', name: 'Smith Machine Shoulder Press', muscleGroup: 'Shoulders', instrument: 'Machine', isCustom: false, isFavorite: false },
  { id: 'reverse-pec-deck', name: 'Reverse Pec Deck', muscleGroup: 'Shoulders', instrument: 'Machine', isCustom: false, isFavorite: false },

  // ==========================
  // LEGS
  // ==========================
  // -- Barbell --
  { id: 'bb-squat', name: 'Back Squat', muscleGroup: 'Legs', instrument: 'Barbell', isCustom: false, isFavorite: true },
  { id: 'front-squat', name: 'Barbell Front Squat', muscleGroup: 'Legs', instrument: 'Barbell', isCustom: false, isFavorite: false },
  { id: 'rdl', name: 'Romanian Deadlift', muscleGroup: 'Legs', instrument: 'Barbell', isCustom: false, isFavorite: false },
  { id: 'sumo-deadlift', name: 'Sumo Deadlift', muscleGroup: 'Legs', instrument: 'Barbell', isCustom: false, isFavorite: false },
  { id: 'hip-thrust', name: 'Barbell Hip Thrust', muscleGroup: 'Legs', instrument: 'Barbell', isCustom: false, isFavorite: false },
  { id: 'bb-walking-lunge', name: 'Barbell Walking Lunge', muscleGroup: 'Legs', instrument: 'Barbell', isCustom: false, isFavorite: false },

  // -- Dumbbell --
  { id: 'goblet-squat', name: 'Goblet Squat', muscleGroup: 'Legs', instrument: 'Dumbbell', isCustom: false, isFavorite: false },
  { id: 'bulgarian-split-squat', name: 'Bulgarian Split Squat', muscleGroup: 'Legs', instrument: 'Dumbbell', isCustom: false, isFavorite: false },
  { id: 'db-walking-lunges', name: 'Walking Lunges', muscleGroup: 'Legs', instrument: 'Dumbbell', isCustom: false, isFavorite: false },
  { id: 'rev-lunge', name: 'Reverse Lunge', muscleGroup: 'Legs', instrument: 'Dumbbell', isCustom: false, isFavorite: false },
  { id: 'db-stepups', name: 'Dumbbell Step-ups', muscleGroup: 'Legs', instrument: 'Dumbbell', isCustom: false, isFavorite: false },
  { id: 'db-rdl', name: 'Dumbbell Romanian Deadlift', muscleGroup: 'Legs', instrument: 'Dumbbell', isCustom: false, isFavorite: false },

  // -- Machine --
  { id: 'leg-press', name: 'Leg Press', muscleGroup: 'Legs', instrument: 'Machine', isCustom: false, isFavorite: false },
  { id: 'hack-squat', name: 'Hack Squat Machine', muscleGroup: 'Legs', instrument: 'Machine', isCustom: false, isFavorite: false },
  { id: 'smith-squat', name: 'Smith Machine Squat', muscleGroup: 'Legs', instrument: 'Machine', isCustom: false, isFavorite: false },
  { id: 'smith-rdl', name: 'Smith Machine Romanian Deadlift', muscleGroup: 'Legs', instrument: 'Machine', isCustom: false, isFavorite: false },
  { id: 'leg-extensions', name: 'Leg Extension', muscleGroup: 'Legs', instrument: 'Machine', isCustom: false, isFavorite: false },
  { id: 'lying-leg-curls', name: 'Lying Leg Curl', muscleGroup: 'Legs', instrument: 'Machine', isCustom: false, isFavorite: false },
  { id: 'seated-leg-curls', name: 'Seated Leg Curl', muscleGroup: 'Legs', instrument: 'Machine', isCustom: false, isFavorite: false },
  { id: 'standing-calf-raises', name: 'Standing Calf Raise', muscleGroup: 'Legs', instrument: 'Machine', isCustom: false, isFavorite: false },
  { id: 'seated-calf-raises', name: 'Seated Calf Raise', muscleGroup: 'Legs', instrument: 'Machine', isCustom: false, isFavorite: false },
  { id: 'calf-press-legpress', name: 'Leg Press Calf Press', muscleGroup: 'Legs', instrument: 'Machine', isCustom: false, isFavorite: false },
  { id: 'adductor-machine', name: 'Adductor Machine', muscleGroup: 'Legs', instrument: 'Machine', isCustom: false, isFavorite: false },
  { id: 'abductor-machine', name: 'Abductor Machine', muscleGroup: 'Legs', instrument: 'Machine', isCustom: false, isFavorite: false },

  // -- Bodyweight --
  { id: 'glute-ham-raise', name: 'Glute Ham Raise', muscleGroup: 'Legs', instrument: 'Bodyweight', isCustom: false, isFavorite: false },
  { id: 'nordic-hamstring-curl', name: 'Nordic Hamstring Curl', muscleGroup: 'Legs', instrument: 'Bodyweight', isCustom: false, isFavorite: false },

  // -- Kettlebell --
  { id: 'kb-swings', name: 'Kettlebell Swings', muscleGroup: 'Legs', instrument: 'Kettlebell', isCustom: false, isFavorite: false },

  // ==========================
  // ABS
  // ==========================
  { id: 'cable-crunch', name: 'Cable Crunch', muscleGroup: 'Abs', instrument: 'Cable', isCustom: false, isFavorite: false },
  { id: 'ab-crunch', name: 'Abdominal Crunch', muscleGroup: 'Abs', instrument: 'Bodyweight', isCustom: false, isFavorite: true },
  { id: 'decline-situp', name: 'Decline Bench Sit-up', muscleGroup: 'Abs', instrument: 'Bodyweight', isCustom: false, isFavorite: false },
  { id: 'bicycle-crunches', name: 'Bicycle Crunches', muscleGroup: 'Abs', instrument: 'Bodyweight', isCustom: false, isFavorite: false },
  { id: 'russian-twist', name: 'Russian Twist', muscleGroup: 'Abs', instrument: 'Bodyweight', isCustom: false, isFavorite: false },
  { id: 'plank', name: 'Plank', muscleGroup: 'Abs', instrument: 'Bodyweight', isCustom: false, isFavorite: false },
  { id: 'lying-leg-raises', name: 'Lying Leg Raises', muscleGroup: 'Abs', instrument: 'Bodyweight', isCustom: false, isFavorite: false },
  { id: 'hanging-leg-raise', name: 'Hanging Leg Raise', muscleGroup: 'Abs', instrument: 'Bodyweight', isCustom: false, isFavorite: false },
  { id: 'captains-chair-raises', name: "Captain's Chair Knee Raise", muscleGroup: 'Abs', instrument: 'Bodyweight', isCustom: false, isFavorite: false },
  { id: 'ab-wheel', name: 'Ab Wheel Rollout', muscleGroup: 'Abs', instrument: 'Other', isCustom: false, isFavorite: false },
];

export const HOME_MUSCLE_GROUPS: MuscleGroup[] = ['Chest', 'Triceps', 'Shoulders', 'Back', 'Biceps', 'Legs'];
export const ALL_MUSCLE_GROUPS: MuscleGroup[] = ['Chest', 'Triceps', 'Biceps', 'Back', 'Shoulders', 'Legs', 'Abs'];
export const MUSCLE_GROUPS: MuscleGroup[] = ['Chest', 'Triceps', 'Shoulders', 'Back', 'Biceps', 'Legs'];

export const POPULAR_EXERCISE_IDS = [
  // Chest
  'bb-bench-press',
  'bb-incline-press',
  'db-bench-press',
  'db-incline-press',
  'smith-incline-press',
  'pec-deck',
  'high-to-low-cable',
  'low-to-high-cable',
  'push-ups',

  // Back
  'pull-ups',
  'lat-pulldown',
  'cable-row',
  'chest-supported-row',
  'tbar-row',
  'straight-arm-pulldown',
  'db-row',
  'deadlift',
  'bb-shrugs',
  'db-shrugs',

  // Shoulders
  'bb-overhead-press',
  'db-shoulder-press',
  'machine-shoulder-press',
  'db-lateral-raise',
  'cable-lateral-raise',
  'db-rear-delt-fly',
  'face-pull',
  'reverse-pec-deck',

  // Biceps
  'bb-curl',
  'ez-bar-curl',
  'db-bicep-curl',
  'db-hammer-curl',
  'incline-db-curl',
  'preacher-curl',
  'cable-bicep-curl',

  // Triceps
  'tricep-pushdown',
  'rope-pushdown',
  'cable-overhead-ext',
  'skull-crushers',
  'close-grip-bench',
  'bench-dips',
  'single-arm-pushdown',

  // Legs
  'bb-squat',
  'rdl',
  'leg-press',
  'hack-squat',
  'leg-extensions',
  'lying-leg-curls',
  'seated-leg-curls',
  'bulgarian-split-squat',
  'db-walking-lunges',
  'standing-calf-raises',

  // Abs
  'cable-crunch',
  'hanging-leg-raise',
  'plank'
];

export const MOVEMENT_PATTERN_GROUPS: string[][] = [
  // ==========================
  // CHEST VARIATION FAMILIES
  // ==========================
  // Flat Heavy Presses
  ['bb-bench-press', 'db-bench-press', 'chest-press-machine', 'hammer-strength-press', 'smith-bench-press'],
  // Incline Presses (Upper Chest)
  ['bb-incline-press', 'db-incline-press', 'smith-incline-press'],
  // Decline / Lower Chest Presses
  ['bb-decline-press', 'db-decline-press', 'machine-decline-press', 'chest-dips'],
  // Chest Flyes (Isolation)
  ['pec-deck', 'cable-crossover', 'high-to-low-cable', 'low-to-high-cable', 'db-flyes', 'db-incline-flyes'],
  // Bodyweight Push-ups
  ['push-ups', 'weighted-pushups', 'incline-pushup'],
  // Pullovers
  ['db-pullover', 'cable-pullover'],

  // ==========================
  // BACK VARIATION FAMILIES
  // ==========================
  // Vertical Pulldowns & Pullups (Lat Width)
  ['lat-pulldown', 'pull-ups', 'chin-ups', 'underhand-pulldown', 'close-grip-pulldown', 'single-arm-pulldown', 'assisted-pullup'],
  // Horizontal Rows (Upper Back / Mid Back)
  ['bb-row', 'pendlay-row', 'cable-row', 'single-arm-cable-row', 'tbar-row', 'tbar-chest-supported', 'chest-supported-row', 'machine-row', 'db-row'],
  // Lat Isolation / Straight Arm Pullovers
  ['lat-pushdowns', 'straight-arm-pulldown', 'cable-pullover'],
  // Posterior Chain / Deadlifts & Hinges
  ['deadlift', 'trap-bar-deadlift', 'rack-pulls', 'hyperextensions', 'good-morning'],
  // Traps / Shrugs
  ['bb-shrugs', 'db-shrugs', 'smith-shrugs'],

  // ==========================
  // SHOULDERS VARIATION FAMILIES
  // ==========================
  // Overhead Presses
  ['bb-overhead-press', 'db-shoulder-press', 'machine-shoulder-press', 'smith-shoulder-press', 'arnold-press'],
  // Lateral Raises (Side Delts)
  ['db-lateral-raise', 'cable-lateral-raise'],
  // Rear Delts (Posterior Delts)
  ['reverse-pec-deck', 'face-pull', 'face-pulls', 'db-rear-delt-fly', 'incline-db-rear-delt'],
  // Front Delts / Upright Pulls
  ['bb-upright-row', 'db-front-raise'],

  // ==========================
  // TRICEPS VARIATION FAMILIES
  // ==========================
  // Pushdowns (Lateral/Medial Head)
  ['tricep-pushdown', 'rope-pushdown', 'cable-vbar-pushdown', 'straight-bar-pushdown', 'single-arm-pushdown', 'rev-grip-pushdown'],
  // Overhead Extensions (Long Head)
  ['cable-overhead-ext', 'cable-rope-overhead', 'overhead-db-extension', 'two-arm-db-overhead-ext', 'bb-overhead-ext'],
  // Lying Extensions (Skull Crushers)
  ['skull-crushers', 'db-skull-crushers', 'lying-db-ext'],
  // Compound Presses & Dips
  ['close-grip-bench', 'bench-dips', 'weighted-dips', 'tricep-dip-machine', 'close-grip-pushups', 'diamond-pushups'],

  // ==========================
  // BICEPS VARIATION FAMILIES
  // ==========================
  // Standard Supinated Curls
  ['db-bicep-curl', 'bb-curl', 'ez-bar-curl', 'ez-wide-curl', 'cable-bicep-curl', 'incline-db-curl', 'bayesian-cable-curl'],
  // Hammer Curls (Brachialis / Forearms)
  ['db-hammer-curl', 'crossbody-hammer', 'incline-hammer-curl', 'cable-hammer-curl', 'cable-rope-curl'],
  // Preacher & Peak Curls
  ['preacher-curl', 'machine-preacher-curl', 'db-preacher-curl', 'cable-preacher-curl', 'concentration-curl', 'spider-curl'],
  // Reverse Curls & Forearms
  ['rev-db-curl', 'rev-bb-curl', 'zottman-curl'],

  // ==========================
  // LEGS VARIATION FAMILIES
  // ==========================
  // Squats & Leg Press (Quads)
  ['bb-squat', 'front-squat', 'hack-squat', 'leg-press', 'smith-squat', 'goblet-squat'],
  // Lunges & Unilateral
  ['bulgarian-split-squat', 'bb-walking-lunge', 'db-walking-lunges', 'rev-lunge', 'db-stepups'],
  // Hamstring Curls (Knee Flexion)
  ['lying-leg-curls', 'seated-leg-curls', 'nordic-hamstring-curl', 'glute-ham-raise'],
  // Hip Hinges & Glutes
  ['rdl', 'smith-rdl', 'sumo-deadlift', 'hip-thrust', 'cable-pullthroughs', 'kb-swings'],
  // Quad Isolation
  ['leg-extensions'],
  // Calves
  ['standing-calf-raises', 'seated-calf-raises', 'calf-press-legpress'],
  // Adductor / Abductor
  ['adductor-machine', 'abductor-machine'],

  // ==========================
  // ABS VARIATION FAMILIES
  // ==========================
  // Crunches
  ['cable-crunch', 'ab-crunch', 'decline-situp', 'bicycle-crunches'],
  // Leg & Knee Raises
  ['hanging-leg-raise', 'captains-chair-raises', 'lying-leg-raises'],
  // Stability & Core
  ['plank', 'ab-wheel', 'russian-twist'],
];

export const STAPLE_REPLACEMENT_MAP: Record<string, string[]> = {
  // ==========================
  // 1. BICEPS
  // ==========================
  'db-bicep-curl': [
    'incline-db-curl',
    'db-hammer-curl',
    'bb-curl',
    'ez-bar-curl',
    'cable-bicep-curl',
    'preacher-curl',
  ],
  'db-hammer-curl': [
    'cable-hammer-curl',
    'incline-hammer-curl',
    'db-bicep-curl',
    'rev-bb-curl',
  ],
  'bb-curl': [
    'ez-bar-curl',
    'db-bicep-curl',
    'cable-bicep-curl',
    'preacher-curl',
  ],
  'ez-bar-curl': [
    'bb-curl',
    'db-bicep-curl',
    'cable-bicep-curl',
    'preacher-curl',
  ],
  'preacher-curl': [
    'machine-preacher-curl',
    'db-preacher-curl',
    'ez-bar-curl',
    'cable-bicep-curl',
  ],
  'machine-preacher-curl': [
    'db-preacher-curl',
    'preacher-curl',
    'ez-bar-curl',
    'cable-bicep-curl',
  ],
  'db-preacher-curl': [
    'machine-preacher-curl',
    'preacher-curl',
    'ez-bar-curl',
    'cable-bicep-curl',
  ],

  // ==========================
  // 2. CHEST
  // ==========================
  'bb-bench-press': [
    'db-bench-press',
    'bb-incline-press',
    'db-incline-press',
    'chest-press-machine',
    'smith-bench-press',
  ],
  'bb-incline-press': [
    'db-incline-press',
    'smith-incline-press',
    'bb-bench-press',
    'db-bench-press',
  ],
  'db-bench-press': [
    'bb-bench-press',
    'db-incline-press',
    'chest-press-machine',
    'smith-bench-press',
  ],
  'pec-deck': [
    'cable-crossover',
    'high-to-low-cable',
    'low-to-high-cable',
    'db-flyes',
    'db-incline-flyes',
  ],

  // ==========================
  // 3. BACK
  // ==========================
  'lat-pulldown': [
    'pull-ups',
    'chin-ups',
    'close-grip-pulldown',
    'single-arm-pulldown',
    'underhand-pulldown',
  ],
  'bb-row': [
    'cable-row',
    'tbar-chest-supported',
    'machine-row',
    'db-row',
  ],
  'cable-row': [
    'bb-row',
    'db-row',
    'tbar-chest-supported',
    'machine-row',
  ],
  'deadlift': [
    'trap-bar-deadlift',
    'rdl',
    'rack-pulls',
    'hyperextensions',
  ],

  // ==========================
  // 4. SHOULDERS
  // ==========================
  'bb-overhead-press': [
    'db-shoulder-press',
    'machine-shoulder-press',
    'smith-shoulder-press',
    'arnold-press',
  ],
  'db-lateral-raise': [
    'cable-lateral-raise',
    'face-pull',
    'db-front-raise',
  ],
  'face-pull': [
    'reverse-pec-deck',
    'db-rear-delt-fly',
    'incline-db-rear-delt',
  ],
  'db-rear-delt-fly': [
    'reverse-pec-deck',
    'face-pull',
    'incline-db-rear-delt',
  ],
  'reverse-pec-deck': [
    'face-pull',
    'db-rear-delt-fly',
    'incline-db-rear-delt',
  ],

  // ==========================
  // 5. TRICEPS
  // ==========================
  'tricep-pushdown': [
    'rope-pushdown',
    'cable-rope-overhead',
    'skull-crushers',
    'close-grip-bench',
    'bench-dips',
  ],
  'cable-overhead-ext': [
    'overhead-db-extension',
    'rope-pushdown',
    'skull-crushers',
    'close-grip-bench',
  ],
  'cable-rope-overhead': [
    'overhead-db-extension',
    'rope-pushdown',
    'skull-crushers',
    'close-grip-bench',
  ],
  'skull-crushers': [
    'db-skull-crushers',
    'cable-rope-overhead',
    'rope-pushdown',
    'close-grip-bench',
  ],

  // ==========================
  // 6. LEGS
  // ==========================
  'bb-squat': [
    'leg-press',
    'hack-squat',
    'smith-squat',
    'front-squat',
    'goblet-squat',
  ],
  'rdl': [
    'db-rdl',
    'smith-rdl',
    'seated-leg-curls',
    'lying-leg-curls',
    'hip-thrust',
  ],
  'lying-leg-curls': [
    'seated-leg-curls',
    'rdl',
  ],
  'seated-leg-curls': [
    'lying-leg-curls',
    'rdl',
  ],
  'standing-calf-raises': [
    'seated-calf-raises',
    'calf-press-legpress',
  ],
  'seated-calf-raises': [
    'standing-calf-raises',
    'calf-press-legpress',
  ],
};

export const getMovementPatternGroup = (exerciseId: string, muscleGroup: MuscleGroup, allExercises: ExerciseSeed[]): ExerciseSeed[] => {
  // 1. Context-aware staple replacements (strict priority matching)
  const stapleTargets = STAPLE_REPLACEMENT_MAP[exerciseId];
  if (stapleTargets) {
    const list = stapleTargets
      .map((id) => allExercises.find((e) => e.id === id))
      .filter((e): e is ExerciseSeed => e !== undefined);
    if (list.length > 0) return list;
  }

  // 2. Explicit variation families
  const explicitGroup = MOVEMENT_PATTERN_GROUPS.find((group) => group.includes(exerciseId));
  if (explicitGroup) {
    const list = explicitGroup
      .map((id) => allExercises.find((e) => e.id === id))
      .filter((e): e is ExerciseSeed => e !== undefined);
    if (list.length > 0) return list;
  }

  const currentEx = allExercises.find((e) => e.id === exerciseId);
  if (!currentEx) return [];

  // 3. Fallback for custom exercises: match by common exercise keywords within same muscle group
  const sameMuscle = allExercises.filter((e) => e.muscleGroup === muscleGroup);
  const words = currentEx.name
    .toLowerCase()
    .split(' ')
    .filter((w) => w.length > 3 && !['barbell', 'dumbbell', 'cable', 'machine', 'smith'].includes(w));

  if (words.length > 0) {
    const matchingByName = sameMuscle.filter((e) => words.some((w) => e.name.toLowerCase().includes(w)));
    if (matchingByName.length > 1) return matchingByName;
  }

  return [];
};
