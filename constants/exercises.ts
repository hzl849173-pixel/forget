export type MuscleGroup = 'Chest' | 'Triceps' | 'Biceps' | 'Back' | 'Legs' | 'Abs & Shoulders';

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

export const SHOULDER_EXERCISE_IDS = new Set([
  'bb-overhead-press',
  'bb-upright-row',
  'db-shoulder-press',
  'arnold-press',
  'db-lateral-raise',
  'db-front-raise',
  'db-rear-delt-fly',
  'cable-lateral-raise',
  'face-pull',
  'reverse-pec-deck',
]);

export const DEFAULT_EXERCISES: ExerciseSeed[] = [
  // Chest (30 Exercises)
  // -- Barbell --
  { id: 'bb-bench-press', name: 'Barbell Bench Press', muscleGroup: 'Chest', instrument: 'Barbell', isCustom: false, isFavorite: true },
  { id: 'bb-incline-press', name: 'Incline Barbell Press', muscleGroup: 'Chest', instrument: 'Barbell', isCustom: false, isFavorite: false },
  { id: 'bb-decline-press', name: 'Decline Barbell Press', muscleGroup: 'Chest', instrument: 'Barbell', isCustom: false, isFavorite: false },
  { id: 'floor-press', name: 'Barbell Floor Press', muscleGroup: 'Chest', instrument: 'Barbell', isCustom: false, isFavorite: false },
  { id: 'landmine-press', name: 'Landmine Press', muscleGroup: 'Chest', instrument: 'Barbell', isCustom: false, isFavorite: false },
  { id: 'reverse-grip-bench', name: 'Reverse Grip Bench Press', muscleGroup: 'Chest', instrument: 'Barbell', isCustom: false, isFavorite: false },
  { id: 'guillotine-press', name: 'Guillotine Press', muscleGroup: 'Chest', instrument: 'Barbell', isCustom: false, isFavorite: false },

  // -- Dumbbell --
  { id: 'db-bench-press', name: 'Dumbbell Bench Press', muscleGroup: 'Chest', instrument: 'Dumbbell', isCustom: false, isFavorite: false },
  { id: 'db-incline-press', name: 'Incline Dumbbell Press', muscleGroup: 'Chest', instrument: 'Dumbbell', isCustom: false, isFavorite: false },
  { id: 'db-decline-press', name: 'Decline Dumbbell Press', muscleGroup: 'Chest', instrument: 'Dumbbell', isCustom: false, isFavorite: false },
  { id: 'db-flyes', name: 'Flat Dumbbell Flyes', muscleGroup: 'Chest', instrument: 'Dumbbell', isCustom: false, isFavorite: false },
  { id: 'db-incline-flyes', name: 'Incline Dumbbell Flyes', muscleGroup: 'Chest', instrument: 'Dumbbell', isCustom: false, isFavorite: false },
  { id: 'db-pullover', name: 'Dumbbell Pullover', muscleGroup: 'Chest', instrument: 'Dumbbell', isCustom: false, isFavorite: false },
  { id: 'db-hex-press', name: 'Dumbbell Hex Press', muscleGroup: 'Chest', instrument: 'Dumbbell', isCustom: false, isFavorite: false },

  // -- Cable --
  { id: 'cable-crossover', name: 'Cable Crossover', muscleGroup: 'Chest', instrument: 'Cable', isCustom: false, isFavorite: false },
  { id: 'low-to-high-cable', name: 'Low-to-High Cable Flyes', muscleGroup: 'Chest', instrument: 'Cable', isCustom: false, isFavorite: false },
  { id: 'single-arm-cable-press', name: 'Single-Arm Cable Chest Press', muscleGroup: 'Chest', instrument: 'Cable', isCustom: false, isFavorite: false },
  { id: 'leaning-cable-fly', name: 'Leaning Cable Fly', muscleGroup: 'Chest', instrument: 'Cable', isCustom: false, isFavorite: false },
  { id: 'cable-pullover', name: 'Cable Pullover', muscleGroup: 'Chest', instrument: 'Cable', isCustom: false, isFavorite: false },

  // -- Machine --
  { id: 'chest-press-machine', name: 'Chest Press Machine', muscleGroup: 'Chest', instrument: 'Machine', isCustom: false, isFavorite: false },
  { id: 'hammer-strength-press', name: 'Hammer Strength Chest Press', muscleGroup: 'Chest', instrument: 'Machine', isCustom: false, isFavorite: false },
  { id: 'pec-deck', name: 'Pec Deck Flyes', muscleGroup: 'Chest', instrument: 'Machine', isCustom: false, isFavorite: false },
  { id: 'machine-decline-press', name: 'Machine Decline Press', muscleGroup: 'Chest', instrument: 'Machine', isCustom: false, isFavorite: false },

  // -- Bodyweight --
  { id: 'push-ups', name: 'Push-ups', muscleGroup: 'Chest', instrument: 'Bodyweight', isCustom: false, isFavorite: false },
  { id: 'weighted-pushups', name: 'Weighted Push-ups', muscleGroup: 'Chest', instrument: 'Bodyweight', isCustom: false, isFavorite: false },
  { id: 'chest-dips', name: 'Parallel Bar Chest Dips', muscleGroup: 'Chest', instrument: 'Bodyweight', isCustom: false, isFavorite: false },
  { id: 'incline-pushup', name: 'Incline Push-up', muscleGroup: 'Chest', instrument: 'Bodyweight', isCustom: false, isFavorite: false },

  // -- Other --
  { id: 'svend-press', name: 'Svend Press', muscleGroup: 'Chest', instrument: 'Other', isCustom: false, isFavorite: false },
  { id: 'banded-pushups', name: 'Banded Push-ups', muscleGroup: 'Chest', instrument: 'Other', isCustom: false, isFavorite: false },

  // Triceps (30 Exercises)
  // -- Cable --
  { id: 'tricep-pushdown', name: 'Cable Triceps Rope Pushdown', muscleGroup: 'Triceps', instrument: 'Cable', isCustom: false, isFavorite: true },
  { id: 'cable-vbar-pushdown', name: 'Cable V-Bar Pushdown', muscleGroup: 'Triceps', instrument: 'Cable', isCustom: false, isFavorite: false },
  { id: 'rev-grip-pushdown', name: 'Reverse Grip Tricep Pushdown', muscleGroup: 'Triceps', instrument: 'Cable', isCustom: false, isFavorite: false },
  { id: 'cable-overhead-ext', name: 'Single-Arm Cable Overhead Extension', muscleGroup: 'Triceps', instrument: 'Cable', isCustom: false, isFavorite: false },
  { id: 'cable-rope-overhead', name: 'Cable Overhead Rope Extension', muscleGroup: 'Triceps', instrument: 'Cable', isCustom: false, isFavorite: false },
  { id: 'bench-cable-ext', name: 'Bench Cable Extension', muscleGroup: 'Triceps', instrument: 'Cable', isCustom: false, isFavorite: false },
  { id: 'cable-kickbacks', name: 'Cable One-Arm Kickback', muscleGroup: 'Triceps', instrument: 'Cable', isCustom: false, isFavorite: false },
  { id: 'rev-grip-cable-pushdown', name: 'Reverse Grip Cable Pushdown', muscleGroup: 'Triceps', instrument: 'Cable', isCustom: false, isFavorite: false },
  { id: 'straight-bar-pushdown', name: 'Straight Bar Cable Pushdown', muscleGroup: 'Triceps', instrument: 'Cable', isCustom: false, isFavorite: false },

  // -- Barbell --
  { id: 'skull-crushers', name: 'EZ Bar Skull Crushers', muscleGroup: 'Triceps', instrument: 'Barbell', isCustom: false, isFavorite: false },
  { id: 'bb-overhead-ext', name: 'Barbell Overhead Extension', muscleGroup: 'Triceps', instrument: 'Barbell', isCustom: false, isFavorite: false },
  { id: 'close-grip-bench', name: 'Close-Grip Barbell Bench Press', muscleGroup: 'Triceps', instrument: 'Barbell', isCustom: false, isFavorite: false },
  { id: 'jm-press', name: 'JM Press', muscleGroup: 'Triceps', instrument: 'Barbell', isCustom: false, isFavorite: false },
  { id: 'ez-french-press', name: 'EZ Bar French Press', muscleGroup: 'Triceps', instrument: 'Barbell', isCustom: false, isFavorite: false },

  // -- Dumbbell --
  { id: 'db-skull-crushers', name: 'Dumbbell Skull Crushers', muscleGroup: 'Triceps', instrument: 'Dumbbell', isCustom: false, isFavorite: false },
  { id: 'lying-db-ext', name: 'Lying Dumbbell Extension', muscleGroup: 'Triceps', instrument: 'Dumbbell', isCustom: false, isFavorite: false },
  { id: 'overhead-db-extension', name: 'Overhead Dumbbell Extension', muscleGroup: 'Triceps', instrument: 'Dumbbell', isCustom: false, isFavorite: false },
  { id: 'tate-press', name: 'Dumbbell Tate Press', muscleGroup: 'Triceps', instrument: 'Dumbbell', isCustom: false, isFavorite: false },
  { id: 'db-kickbacks', name: 'Dumbbell Kickbacks', muscleGroup: 'Triceps', instrument: 'Dumbbell', isCustom: false, isFavorite: false },
  { id: 'two-arm-db-overhead-ext', name: 'Two-Arm Overhead DB Extension', muscleGroup: 'Triceps', instrument: 'Dumbbell', isCustom: false, isFavorite: false },

  // -- Bodyweight --
  { id: 'bench-dips', name: 'Bench Dips', muscleGroup: 'Triceps', instrument: 'Bodyweight', isCustom: false, isFavorite: false },
  { id: 'weighted-dips', name: 'Weighted Dips', muscleGroup: 'Triceps', instrument: 'Bodyweight', isCustom: false, isFavorite: false },
  { id: 'close-grip-pushups', name: 'Close-Grip Push-ups', muscleGroup: 'Triceps', instrument: 'Bodyweight', isCustom: false, isFavorite: false },
  { id: 'diamond-pushups', name: 'Diamond Push-ups', muscleGroup: 'Triceps', instrument: 'Bodyweight', isCustom: false, isFavorite: false },
  { id: 'bodyweight-tricep-ext', name: 'Bodyweight Tricep Extension', muscleGroup: 'Triceps', instrument: 'Bodyweight', isCustom: false, isFavorite: false },

  // -- Kettlebell --
  { id: 'kb-tricep-press', name: 'Kettlebell Tricep Press', muscleGroup: 'Triceps', instrument: 'Kettlebell', isCustom: false, isFavorite: false },

  // -- Machine --
  { id: 'tricep-dip-machine', name: 'Tricep Dip Machine', muscleGroup: 'Triceps', instrument: 'Machine', isCustom: false, isFavorite: false },
  { id: 'single-arm-machine-ext', name: 'Single-Arm Machine Extension', muscleGroup: 'Triceps', instrument: 'Machine', isCustom: false, isFavorite: false },

  // -- Other --
  { id: 'band-tricep-pushdown', name: 'Band Tricep Pushdown', muscleGroup: 'Triceps', instrument: 'Other', isCustom: false, isFavorite: false },

  // Biceps (30 Exercises)
  // -- Dumbbell --
  { id: 'db-bicep-curl', name: 'Dumbbell Bicep Curl', muscleGroup: 'Biceps', instrument: 'Dumbbell', isCustom: false, isFavorite: true },
  { id: 'incline-db-curl', name: 'Incline Dumbbell Curl', muscleGroup: 'Biceps', instrument: 'Dumbbell', isCustom: false, isFavorite: false },
  { id: 'concentration-curl', name: 'Concentration Curl', muscleGroup: 'Biceps', instrument: 'Dumbbell', isCustom: false, isFavorite: false },
  { id: 'spider-curl', name: 'Dumbbell Spider Curl', muscleGroup: 'Biceps', instrument: 'Dumbbell', isCustom: false, isFavorite: false },
  { id: 'db-drag-curl', name: 'Dumbbell Drag Curl', muscleGroup: 'Biceps', instrument: 'Dumbbell', isCustom: false, isFavorite: false },
  { id: 'db-hammer-curl', name: 'Dumbbell Hammer Curl', muscleGroup: 'Biceps', instrument: 'Dumbbell', isCustom: false, isFavorite: false },
  { id: 'crossbody-hammer', name: 'Cross-Body Hammer Curl', muscleGroup: 'Biceps', instrument: 'Dumbbell', isCustom: false, isFavorite: false },
  { id: 'db-preacher-curl', name: 'Dumbbell Preacher Curl', muscleGroup: 'Biceps', instrument: 'Dumbbell', isCustom: false, isFavorite: false },
  { id: 'zottman-curl', name: 'Zottman Curl', muscleGroup: 'Biceps', instrument: 'Dumbbell', isCustom: false, isFavorite: false },
  { id: 'incline-hammer-curl', name: 'Incline Hammer Curl', muscleGroup: 'Biceps', instrument: 'Dumbbell', isCustom: false, isFavorite: false },
  { id: 'rev-db-curl', name: 'Reverse Dumbbell Curl', muscleGroup: 'Biceps', instrument: 'Dumbbell', isCustom: false, isFavorite: false },
  { id: 'waiter-curl', name: 'Waiter Curl', muscleGroup: 'Biceps', instrument: 'Dumbbell', isCustom: false, isFavorite: false },

  // -- Barbell --
  { id: 'bb-curl', name: 'Barbell Curl', muscleGroup: 'Biceps', instrument: 'Barbell', isCustom: false, isFavorite: false },
  { id: 'ez-bar-curl', name: 'EZ Bar Bicep Curl', muscleGroup: 'Biceps', instrument: 'Barbell', isCustom: false, isFavorite: false },
  { id: 'preacher-curl', name: 'EZ Bar Preacher Curl', muscleGroup: 'Biceps', instrument: 'Barbell', isCustom: false, isFavorite: false },
  { id: 'rev-bb-curl', name: 'Reverse Barbell Curl', muscleGroup: 'Biceps', instrument: 'Barbell', isCustom: false, isFavorite: false },
  { id: '21s-bicep-curl', name: '21s Bicep Curl', muscleGroup: 'Biceps', instrument: 'Barbell', isCustom: false, isFavorite: false },
  { id: 'ez-wide-curl', name: 'EZ Bar Wide Curl', muscleGroup: 'Biceps', instrument: 'Barbell', isCustom: false, isFavorite: false },

  // -- Cable --
  { id: 'cable-bicep-curl', name: 'Cable Bicep Curl', muscleGroup: 'Biceps', instrument: 'Cable', isCustom: false, isFavorite: false },
  { id: 'overhead-cable-curl', name: 'Cable Overhead Bicep Curl', muscleGroup: 'Biceps', instrument: 'Cable', isCustom: false, isFavorite: false },
  { id: 'cable-hammer-curl', name: 'Cable Hammer Curl', muscleGroup: 'Biceps', instrument: 'Cable', isCustom: false, isFavorite: false },
  { id: 'cable-preacher-curl', name: 'Single-Arm Cable Preacher Curl', muscleGroup: 'Biceps', instrument: 'Cable', isCustom: false, isFavorite: false },
  { id: 'dual-cable-curl', name: 'Dual Cable Bicep Curl', muscleGroup: 'Biceps', instrument: 'Cable', isCustom: false, isFavorite: false },
  { id: 'cable-rope-curl', name: 'Cable Rope Curl', muscleGroup: 'Biceps', instrument: 'Cable', isCustom: false, isFavorite: false },
  { id: 'bayesian-cable-curl', name: 'Bayesian Cable Curl', muscleGroup: 'Biceps', instrument: 'Cable', isCustom: false, isFavorite: false },

  // -- Kettlebell --
  { id: 'kb-bicep-curl', name: 'Kettlebell Bicep Curl', muscleGroup: 'Biceps', instrument: 'Kettlebell', isCustom: false, isFavorite: false },

  // -- Bodyweight --
  { id: 'chin-ups', name: 'Chin-ups', muscleGroup: 'Biceps', instrument: 'Bodyweight', isCustom: false, isFavorite: false },

  // -- Machine --
  { id: 'machine-bicep-curl', name: 'Machine Bicep Curl', muscleGroup: 'Biceps', instrument: 'Machine', isCustom: false, isFavorite: false },
  { id: 'single-arm-machine-preacher', name: 'Single-Arm Machine Preacher Curl', muscleGroup: 'Biceps', instrument: 'Machine', isCustom: false, isFavorite: false },

  // -- Other --
  { id: 'band-curl', name: 'Band Curl', muscleGroup: 'Biceps', instrument: 'Other', isCustom: false, isFavorite: false },

  // Back (30 Exercises)
  // -- Barbell --
  { id: 'bb-row', name: 'Barbell Bent Over Row', muscleGroup: 'Back', instrument: 'Barbell', isCustom: false, isFavorite: false },
  { id: 'tbar-row', name: 'T-Bar Row', muscleGroup: 'Back', instrument: 'Barbell', isCustom: false, isFavorite: false },
  { id: 'meadows-row', name: 'Meadows Row', muscleGroup: 'Back', instrument: 'Barbell', isCustom: false, isFavorite: false },
  { id: 'deadlift', name: 'Barbell Deadlift', muscleGroup: 'Back', instrument: 'Barbell', isCustom: false, isFavorite: false },
  { id: 'rack-pulls', name: 'Rack Pulls', muscleGroup: 'Back', instrument: 'Barbell', isCustom: false, isFavorite: false },
  { id: 'bb-shrugs', name: 'Barbell Shrugs', muscleGroup: 'Back', instrument: 'Barbell', isCustom: false, isFavorite: false },
  { id: 'pendlay-row', name: 'Pendlay Row', muscleGroup: 'Back', instrument: 'Barbell', isCustom: false, isFavorite: false },
  { id: 'trap-bar-deadlift', name: 'Trap Bar Deadlift', muscleGroup: 'Back', instrument: 'Barbell', isCustom: false, isFavorite: false },
  { id: 'good-morning', name: 'Good Morning', muscleGroup: 'Back', instrument: 'Barbell', isCustom: false, isFavorite: false },

  // -- Dumbbell --
  { id: 'db-row', name: 'Single-Arm Dumbbell Row', muscleGroup: 'Back', instrument: 'Dumbbell', isCustom: false, isFavorite: false },
  { id: 'db-shrugs', name: 'Dumbbell Shrugs', muscleGroup: 'Back', instrument: 'Dumbbell', isCustom: false, isFavorite: false },
  { id: 'back-db-pullover', name: 'Dumbbell Back Pullover', muscleGroup: 'Back', instrument: 'Dumbbell', isCustom: false, isFavorite: false },
  { id: 'db-renegade-row', name: 'Dumbbell Renegade Row', muscleGroup: 'Back', instrument: 'Dumbbell', isCustom: false, isFavorite: false },

  // -- Cable --
  { id: 'cable-row', name: 'Seated Cable Row', muscleGroup: 'Back', instrument: 'Cable', isCustom: false, isFavorite: false },
  { id: 'lat-pulldown', name: 'Wide-Grip Lat Pulldown', muscleGroup: 'Back', instrument: 'Cable', isCustom: false, isFavorite: false },
  { id: 'underhand-pulldown', name: 'Underhand Lat Pulldown', muscleGroup: 'Back', instrument: 'Cable', isCustom: false, isFavorite: false },
  { id: 'single-arm-pulldown', name: 'Single-Arm Lat Pulldown', muscleGroup: 'Back', instrument: 'Cable', isCustom: false, isFavorite: false },
  { id: 'lat-pushdowns', name: 'Cable Lat Pushdowns', muscleGroup: 'Back', instrument: 'Cable', isCustom: false, isFavorite: false },
  { id: 'cable-pullthroughs', name: 'Cable Pull-Throughs', muscleGroup: 'Back', instrument: 'Cable', isCustom: false, isFavorite: false },
  { id: 'face-pulls', name: 'Face Pulls', muscleGroup: 'Back', instrument: 'Cable', isCustom: false, isFavorite: false },
  { id: 'straight-arm-pulldown', name: 'Cable Straight-Arm Pulldown', muscleGroup: 'Back', instrument: 'Cable', isCustom: false, isFavorite: false },
  { id: 'single-arm-cable-row', name: 'Single-Arm Cable Row', muscleGroup: 'Back', instrument: 'Cable', isCustom: false, isFavorite: false },

  // -- Machine --
  { id: 'chest-supported-row', name: 'Chest-Supported Row', muscleGroup: 'Back', instrument: 'Machine', isCustom: false, isFavorite: false },
  { id: 'machine-row', name: 'Machine Row', muscleGroup: 'Back', instrument: 'Machine', isCustom: false, isFavorite: false },
  { id: 'assisted-pullup', name: 'Assisted Pull-up Machine', muscleGroup: 'Back', instrument: 'Machine', isCustom: false, isFavorite: false },

  // -- Bodyweight --
  { id: 'pull-ups', name: 'Pull-ups', muscleGroup: 'Back', instrument: 'Bodyweight', isCustom: false, isFavorite: true },
  { id: 'inverted-row', name: 'Inverted Row', muscleGroup: 'Back', instrument: 'Bodyweight', isCustom: false, isFavorite: false },
  { id: 'hyperextensions', name: 'Back Hyperextensions', muscleGroup: 'Back', instrument: 'Bodyweight', isCustom: false, isFavorite: false },

  // -- Other --
  { id: 'band-pull-apart', name: 'Band Pull-Apart', muscleGroup: 'Back', instrument: 'Other', isCustom: false, isFavorite: false },

  // Legs (30 Exercises)
  // -- Barbell --
  { id: 'bb-squat', name: 'Barbell Back Squat', muscleGroup: 'Legs', instrument: 'Barbell', isCustom: false, isFavorite: true },
  { id: 'front-squat', name: 'Barbell Front Squat', muscleGroup: 'Legs', instrument: 'Barbell', isCustom: false, isFavorite: false },
  { id: 'box-squats', name: 'Barbell Box Squat', muscleGroup: 'Legs', instrument: 'Barbell', isCustom: false, isFavorite: false },
  { id: 'rdl', name: 'Romanian Deadlift', muscleGroup: 'Legs', instrument: 'Barbell', isCustom: false, isFavorite: false },
  { id: 'sumo-deadlift', name: 'Sumo Deadlift', muscleGroup: 'Legs', instrument: 'Barbell', isCustom: false, isFavorite: false },
  { id: 'hip-thrust', name: 'Barbell Hip Thrust', muscleGroup: 'Legs', instrument: 'Barbell', isCustom: false, isFavorite: false },
  { id: 'bb-walking-lunge', name: 'Barbell Walking Lunge', muscleGroup: 'Legs', instrument: 'Barbell', isCustom: false, isFavorite: false },
  { id: 'snatch-grip-deadlift', name: 'Snatch-Grip Deadlift', muscleGroup: 'Legs', instrument: 'Barbell', isCustom: false, isFavorite: false },

  // -- Dumbbell --
  { id: 'goblet-squat', name: 'Goblet Squat', muscleGroup: 'Legs', instrument: 'Dumbbell', isCustom: false, isFavorite: false },
  { id: 'bulgarian-split-squat', name: 'Bulgarian Split Squat', muscleGroup: 'Legs', instrument: 'Dumbbell', isCustom: false, isFavorite: false },
  { id: 'db-walking-lunges', name: 'Dumbbell Walking Lunges', muscleGroup: 'Legs', instrument: 'Dumbbell', isCustom: false, isFavorite: false },
  { id: 'db-stepups', name: 'Dumbbell Step-ups', muscleGroup: 'Legs', instrument: 'Dumbbell', isCustom: false, isFavorite: false },
  { id: 'rev-lunge', name: 'Reverse Lunge', muscleGroup: 'Legs', instrument: 'Dumbbell', isCustom: false, isFavorite: false },

  // -- Machine --
  { id: 'hack-squat', name: 'Hack Squat Machine', muscleGroup: 'Legs', instrument: 'Machine', isCustom: false, isFavorite: false },
  { id: 'leg-press', name: 'Leg Press', muscleGroup: 'Legs', instrument: 'Machine', isCustom: false, isFavorite: false },
  { id: 'leg-extensions', name: 'Leg Extension Machine', muscleGroup: 'Legs', instrument: 'Machine', isCustom: false, isFavorite: false },
  { id: 'seated-leg-curls', name: 'Seated Leg Curl Machine', muscleGroup: 'Legs', instrument: 'Machine', isCustom: false, isFavorite: false },
  { id: 'lying-leg-curls', name: 'Lying Leg Curl Machine', muscleGroup: 'Legs', instrument: 'Machine', isCustom: false, isFavorite: false },
  { id: 'standing-calf-raises', name: 'Standing Calf Raise', muscleGroup: 'Legs', instrument: 'Machine', isCustom: false, isFavorite: false },
  { id: 'seated-calf-raises', name: 'Seated Calf Raise', muscleGroup: 'Legs', instrument: 'Machine', isCustom: false, isFavorite: false },
  { id: 'calf-press-legpress', name: 'Leg Press Calf Press', muscleGroup: 'Legs', instrument: 'Machine', isCustom: false, isFavorite: false },
  { id: 'belt-squat', name: 'Belt Squat', muscleGroup: 'Legs', instrument: 'Machine', isCustom: false, isFavorite: false },
  { id: 'adductor-machine', name: 'Adductor Machine', muscleGroup: 'Legs', instrument: 'Machine', isCustom: false, isFavorite: false },
  { id: 'abductor-machine', name: 'Abductor Machine', muscleGroup: 'Legs', instrument: 'Machine', isCustom: false, isFavorite: false },
  { id: 'reverse-hyper', name: 'Reverse Hyperextension', muscleGroup: 'Legs', instrument: 'Machine', isCustom: false, isFavorite: false },
  { id: 'donkey-calf-raise', name: 'Donkey Calf Raise', muscleGroup: 'Legs', instrument: 'Machine', isCustom: false, isFavorite: false },

  // -- Bodyweight --
  { id: 'glute-ham-raise', name: 'Glute Ham Raise', muscleGroup: 'Legs', instrument: 'Bodyweight', isCustom: false, isFavorite: false },
  { id: 'sissy-squat', name: 'Sissy Squat', muscleGroup: 'Legs', instrument: 'Bodyweight', isCustom: false, isFavorite: false },
  { id: 'nordic-hamstring-curl', name: 'Nordic Hamstring Curl', muscleGroup: 'Legs', instrument: 'Bodyweight', isCustom: false, isFavorite: false },

  // -- Kettlebell --
  { id: 'kb-swings', name: 'Kettlebell Swings', muscleGroup: 'Legs', instrument: 'Kettlebell', isCustom: false, isFavorite: false },

  // Abs & Shoulders (20 Exercises)
  // -- Barbell --
  { id: 'bb-overhead-press', name: 'Barbell Overhead Press', muscleGroup: 'Abs & Shoulders', instrument: 'Barbell', isCustom: false, isFavorite: true },
  { id: 'bb-upright-row', name: 'Barbell Upright Row', muscleGroup: 'Abs & Shoulders', instrument: 'Barbell', isCustom: false, isFavorite: false },

  // -- Dumbbell --
  { id: 'db-shoulder-press', name: 'Dumbbell Shoulder Press', muscleGroup: 'Abs & Shoulders', instrument: 'Dumbbell', isCustom: false, isFavorite: false },
  { id: 'arnold-press', name: 'Arnold Press', muscleGroup: 'Abs & Shoulders', instrument: 'Dumbbell', isCustom: false, isFavorite: false },
  { id: 'db-lateral-raise', name: 'Dumbbell Lateral Raise', muscleGroup: 'Abs & Shoulders', instrument: 'Dumbbell', isCustom: false, isFavorite: false },
  { id: 'db-front-raise', name: 'Dumbbell Front Raise', muscleGroup: 'Abs & Shoulders', instrument: 'Dumbbell', isCustom: false, isFavorite: false },
  { id: 'db-rear-delt-fly', name: 'Dumbbell Rear Delt Fly', muscleGroup: 'Abs & Shoulders', instrument: 'Dumbbell', isCustom: false, isFavorite: false },

  // -- Cable --
  { id: 'cable-lateral-raise', name: 'Cable Lateral Raise', muscleGroup: 'Abs & Shoulders', instrument: 'Cable', isCustom: false, isFavorite: false },
  { id: 'face-pull', name: 'Cable Face Pull', muscleGroup: 'Abs & Shoulders', instrument: 'Cable', isCustom: false, isFavorite: false },
  { id: 'cable-crunch', name: 'Cable Crunch', muscleGroup: 'Abs & Shoulders', instrument: 'Cable', isCustom: false, isFavorite: false },

  // -- Machine --
  { id: 'reverse-pec-deck', name: 'Reverse Pec Deck Fly', muscleGroup: 'Abs & Shoulders', instrument: 'Machine', isCustom: false, isFavorite: false },

  // -- Bodyweight --
  { id: 'ab-crunch', name: 'Abdominal Crunch', muscleGroup: 'Abs & Shoulders', instrument: 'Bodyweight', isCustom: false, isFavorite: true },
  { id: 'decline-situp', name: 'Decline Bench Sit-up', muscleGroup: 'Abs & Shoulders', instrument: 'Bodyweight', isCustom: false, isFavorite: false },
  { id: 'bicycle-crunches', name: 'Bicycle Crunches', muscleGroup: 'Abs & Shoulders', instrument: 'Bodyweight', isCustom: false, isFavorite: false },
  { id: 'russian-twist', name: 'Russian Twist', muscleGroup: 'Abs & Shoulders', instrument: 'Bodyweight', isCustom: false, isFavorite: false },
  { id: 'plank', name: 'Forearm Plank', muscleGroup: 'Abs & Shoulders', instrument: 'Bodyweight', isCustom: false, isFavorite: false },
  { id: 'lying-leg-raises', name: 'Lying Leg Raises', muscleGroup: 'Abs & Shoulders', instrument: 'Bodyweight', isCustom: false, isFavorite: false },
  { id: 'hanging-leg-raise', name: 'Hanging Leg Raise', muscleGroup: 'Abs & Shoulders', instrument: 'Bodyweight', isCustom: false, isFavorite: false },
  { id: 'captains-chair-raises', name: "Captain's Chair Knee Raise", muscleGroup: 'Abs & Shoulders', instrument: 'Bodyweight', isCustom: false, isFavorite: false },

  // -- Other --
  { id: 'ab-wheel', name: 'Ab Wheel Rollout', muscleGroup: 'Abs & Shoulders', instrument: 'Other', isCustom: false, isFavorite: false },
];

export const MUSCLE_GROUPS: MuscleGroup[] = ['Chest', 'Triceps', 'Abs & Shoulders', 'Back', 'Biceps', 'Legs'];
