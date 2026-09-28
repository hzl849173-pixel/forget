export type MuscleGroup = 'Chest' | 'Triceps' | 'Biceps' | 'Back' | 'Shoulders' | 'Legs' | 'Abs' | 'Abs & Shoulders' | 'Back & Shoulders';

export type Instrument = 'Barbell' | 'Dumbbell' | 'Cable' | 'Machine' | 'Bodyweight' | 'Kettlebell' | 'Other';

export interface ExerciseSeed {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  instrument: Instrument;
  target?: string;
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
  'seated-bb-shoulder-press',
  'bb-upright-row',
  'ez-bar-upright-row',
  'db-shoulder-press',
  'arnold-press',
  'db-lateral-raise',
  'leaning-db-lateral-raise',
  'db-front-raise',
  'db-rear-delt-fly',
  'db-upright-row',
  'cable-lateral-raise',
  'cable-front-raise',
  'cable-rear-delt-fly',
  'cable-upright-row',
  'face-pull',
  'machine-shoulder-press',
  'smith-shoulder-press',
  'machine-lateral-raise',
  'reverse-pec-deck',
  'machine-rear-delt-fly',
  'plate-front-raise',
]);

export const DEFAULT_EXERCISES: ExerciseSeed[] = [
  // ==========================
  // CHEST (Preserved)
  // ==========================
  // -- Barbell --
  { id: 'bb-bench-press', name: 'Barbell Bench Press', muscleGroup: 'Chest', instrument: 'Barbell', target: 'Mid Chest', isCustom: false, isFavorite: true },
  { id: 'bb-incline-press', name: 'Incline Barbell Bench Press', muscleGroup: 'Chest', instrument: 'Barbell', target: 'Upper Chest', isCustom: false, isFavorite: false },
  { id: 'bb-decline-press', name: 'Decline Barbell Press', muscleGroup: 'Chest', instrument: 'Barbell', target: 'Lower Chest', isCustom: false, isFavorite: false },
  { id: 'landmine-press', name: 'Landmine Press', muscleGroup: 'Chest', instrument: 'Barbell', target: 'Upper Chest & Front Delts', isCustom: false, isFavorite: false },

  // -- Dumbbell --
  { id: 'db-bench-press', name: 'Flat Dumbbell Press', muscleGroup: 'Chest', instrument: 'Dumbbell', target: 'Mid Chest', isCustom: false, isFavorite: false },
  { id: 'db-incline-press', name: 'Incline Dumbbell Press', muscleGroup: 'Chest', instrument: 'Dumbbell', target: 'Upper Chest', isCustom: false, isFavorite: false },
  { id: 'db-decline-press', name: 'Decline Dumbbell Press', muscleGroup: 'Chest', instrument: 'Dumbbell', target: 'Lower Chest', isCustom: false, isFavorite: false },
  { id: 'db-flyes', name: 'Flat Dumbbell Flyes', muscleGroup: 'Chest', instrument: 'Dumbbell', target: 'Mid & Outer Chest', isCustom: false, isFavorite: false },
  { id: 'db-incline-flyes', name: 'Incline Dumbbell Flyes', muscleGroup: 'Chest', instrument: 'Dumbbell', target: 'Upper Chest', isCustom: false, isFavorite: false },
  { id: 'db-pullover', name: 'Dumbbell Pullover', muscleGroup: 'Chest', instrument: 'Dumbbell', target: 'Upper Chest & Serratus', isCustom: false, isFavorite: false },

  // -- Cable --
  { id: 'cable-crossover', name: 'Cable Crossover', muscleGroup: 'Chest', instrument: 'Cable', target: 'Inner & Lower Chest', isCustom: false, isFavorite: false },
  { id: 'high-to-low-cable', name: 'High to Low Cable Fly', muscleGroup: 'Chest', instrument: 'Cable', target: 'Lower Chest', isCustom: false, isFavorite: false },
  { id: 'low-to-high-cable', name: 'Low to High Cable Fly', muscleGroup: 'Chest', instrument: 'Cable', target: 'Upper Chest', isCustom: false, isFavorite: false },
  { id: 'cable-pullover', name: 'Cable Pullover', muscleGroup: 'Chest', instrument: 'Cable', target: 'Upper Chest & Serratus', isCustom: false, isFavorite: false },

  // -- Machine --
  { id: 'chest-press-machine', name: 'Chest Press Machine', muscleGroup: 'Chest', instrument: 'Machine', target: 'Mid Chest', isCustom: false, isFavorite: false },
  { id: 'incline-machine-chest-press', name: 'Incline Machine Chest Press', muscleGroup: 'Chest', instrument: 'Machine', target: 'Upper Chest', isCustom: false, isFavorite: false },
  { id: 'hammer-strength-press', name: 'Hammer Strength Chest Press', muscleGroup: 'Chest', instrument: 'Machine', target: 'Mid Chest', isCustom: false, isFavorite: false },
  { id: 'pec-deck', name: 'Pec Deck Fly', muscleGroup: 'Chest', instrument: 'Machine', target: 'Inner Chest', isCustom: false, isFavorite: false },
  { id: 'machine-fly', name: 'Machine Fly', muscleGroup: 'Chest', instrument: 'Machine', target: 'Inner Chest', isCustom: false, isFavorite: false },
  { id: 'machine-decline-press', name: 'Machine Decline Press', muscleGroup: 'Chest', instrument: 'Machine', target: 'Lower Chest', isCustom: false, isFavorite: false },
  { id: 'smith-bench-press', name: 'Smith Machine Bench Press', muscleGroup: 'Chest', instrument: 'Machine', target: 'Mid Chest', isCustom: false, isFavorite: false },
  { id: 'smith-incline-press', name: 'Smith Machine Incline Bench Press', muscleGroup: 'Chest', instrument: 'Machine', target: 'Upper Chest', isCustom: false, isFavorite: false },
  { id: 'chest-dip-machine', name: 'Chest Dip Machine', muscleGroup: 'Chest', instrument: 'Machine', target: 'Lower Chest', isCustom: false, isFavorite: false },

  // -- Bodyweight --
  { id: 'push-ups', name: 'Push-up', muscleGroup: 'Chest', instrument: 'Bodyweight', target: 'Mid Chest & Core', isCustom: false, isFavorite: false },
  { id: 'weighted-pushups', name: 'Weighted Push-ups', muscleGroup: 'Chest', instrument: 'Bodyweight', target: 'Mid Chest', isCustom: false, isFavorite: false },
  { id: 'incline-pushup', name: 'Incline Push-up', muscleGroup: 'Chest', instrument: 'Bodyweight', target: 'Lower Chest', isCustom: false, isFavorite: false },
  { id: 'decline-pushup', name: 'Decline Push-up', muscleGroup: 'Chest', instrument: 'Bodyweight', target: 'Upper Chest', isCustom: false, isFavorite: false },
  { id: 'chest-dips', name: 'Parallel Bar Chest Dips', muscleGroup: 'Chest', instrument: 'Bodyweight', target: 'Lower Chest', isCustom: false, isFavorite: false },

  // ==========================
  // TRICEPS (Preserved)
  // ==========================
  // -- Cable --
  { id: 'tricep-pushdown', name: 'Tricep Pushdown', muscleGroup: 'Triceps', instrument: 'Cable', target: 'Lateral & Medial Heads', isCustom: false, isFavorite: true },
  { id: 'rope-pushdown', name: 'Rope Pushdown', muscleGroup: 'Triceps', instrument: 'Cable', target: 'Lateral Head', isCustom: false, isFavorite: false },
  { id: 'cable-vbar-pushdown', name: 'Cable V-Bar Pushdown', muscleGroup: 'Triceps', instrument: 'Cable', target: 'Lateral & Medial Heads', isCustom: false, isFavorite: false },
  { id: 'straight-bar-pushdown', name: 'Straight Bar Cable Pushdown', muscleGroup: 'Triceps', instrument: 'Cable', target: 'Lateral & Medial Heads', isCustom: false, isFavorite: false },
  { id: 'single-arm-pushdown', name: 'Single Arm Pushdown', muscleGroup: 'Triceps', instrument: 'Cable', target: 'Lateral Head', isCustom: false, isFavorite: false },
  { id: 'rev-grip-pushdown', name: 'Reverse Grip Tricep Pushdown', muscleGroup: 'Triceps', instrument: 'Cable', target: 'Medial Head', isCustom: false, isFavorite: false },
  { id: 'cable-overhead-ext', name: 'Overhead Cable Extension', muscleGroup: 'Triceps', instrument: 'Cable', target: 'Long Head', isCustom: false, isFavorite: false },
  { id: 'cable-rope-overhead', name: 'Cable Overhead Rope Extension', muscleGroup: 'Triceps', instrument: 'Cable', target: 'Long Head', isCustom: false, isFavorite: false },
  { id: 'cable-one-arm-kickback', name: 'Cable One-Arm Kickback', muscleGroup: 'Triceps', instrument: 'Cable', target: 'Lateral Head', isCustom: false, isFavorite: false },
  { id: 'cable-kickback', name: 'Cable Kickback', muscleGroup: 'Triceps', instrument: 'Cable', target: 'Lateral Head', isCustom: false, isFavorite: false },

  // -- Barbell --
  { id: 'skull-crushers', name: 'Skull Crusher', muscleGroup: 'Triceps', instrument: 'Barbell', target: 'Long & Lateral Heads', isCustom: false, isFavorite: false },
  { id: 'ez-bar-skull-crusher', name: 'EZ-Bar Skull Crusher', muscleGroup: 'Triceps', instrument: 'Barbell', target: 'Long & Lateral Heads', isCustom: false, isFavorite: false },
  { id: 'bb-overhead-ext', name: 'Barbell Overhead Extension', muscleGroup: 'Triceps', instrument: 'Barbell', target: 'Long Head', isCustom: false, isFavorite: false },
  { id: 'ez-bar-french-press', name: 'EZ-Bar French Press', muscleGroup: 'Triceps', instrument: 'Barbell', target: 'Long Head', isCustom: false, isFavorite: false },
  { id: 'close-grip-bench', name: 'Close Grip Bench Press', muscleGroup: 'Triceps', instrument: 'Barbell', target: 'All 3 Heads', isCustom: false, isFavorite: false },

  // -- Dumbbell --
  { id: 'db-skull-crushers', name: 'Dumbbell Skull Crushers', muscleGroup: 'Triceps', instrument: 'Dumbbell', target: 'Long & Lateral Heads', isCustom: false, isFavorite: false },
  { id: 'lying-db-ext', name: 'Lying Dumbbell Extension', muscleGroup: 'Triceps', instrument: 'Dumbbell', target: 'Long Head', isCustom: false, isFavorite: false },
  { id: 'overhead-db-extension', name: 'Overhead Dumbbell Extension', muscleGroup: 'Triceps', instrument: 'Dumbbell', target: 'Long Head', isCustom: false, isFavorite: false },
  { id: 'db-kickbacks', name: 'Dumbbell Kickbacks', muscleGroup: 'Triceps', instrument: 'Dumbbell', target: 'Lateral Head', isCustom: false, isFavorite: false },
  { id: 'two-arm-db-overhead-ext', name: 'Two-Arm Overhead DB Extension', muscleGroup: 'Triceps', instrument: 'Dumbbell', target: 'Long Head', isCustom: false, isFavorite: false },

  // -- Bodyweight --
  { id: 'bench-dips', name: 'Tricep Dips', muscleGroup: 'Triceps', instrument: 'Bodyweight', target: 'All 3 Heads', isCustom: false, isFavorite: false },
  { id: 'weighted-dips', name: 'Weighted Dips', muscleGroup: 'Triceps', instrument: 'Bodyweight', target: 'All 3 Heads', isCustom: false, isFavorite: false },
  { id: 'close-grip-pushups', name: 'Close-Grip Push-ups', muscleGroup: 'Triceps', instrument: 'Bodyweight', target: 'All 3 Heads', isCustom: false, isFavorite: false },
  { id: 'diamond-pushups', name: 'Diamond Push-ups', muscleGroup: 'Triceps', instrument: 'Bodyweight', target: 'All 3 Heads', isCustom: false, isFavorite: false },

  // -- Machine --
  { id: 'tricep-dip-machine', name: 'Tricep Dip Machine', muscleGroup: 'Triceps', instrument: 'Machine', target: 'All 3 Heads', isCustom: false, isFavorite: false },

  // ==========================
  // BICEPS
  // ==========================
  // -- Dumbbell --
  { id: 'db-bicep-curl', name: 'Dumbbell Curl', muscleGroup: 'Biceps', instrument: 'Dumbbell', target: 'Overall Biceps', isCustom: false, isFavorite: true },
  { id: 'incline-db-curl', name: 'Incline Dumbbell Curl', muscleGroup: 'Biceps', instrument: 'Dumbbell', target: 'Long Head (Bicep Peak)', isCustom: false, isFavorite: false },
  { id: 'concentration-curl', name: 'Concentration Curl', muscleGroup: 'Biceps', instrument: 'Dumbbell', target: 'Short Head (Peak)', isCustom: false, isFavorite: false },
  { id: 'spider-curl', name: 'Dumbbell Spider Curl', muscleGroup: 'Biceps', instrument: 'Dumbbell', target: 'Short Head (Peak)', isCustom: false, isFavorite: false },
  { id: 'db-hammer-curl', name: 'Hammer Curl', muscleGroup: 'Biceps', instrument: 'Dumbbell', target: 'Brachialis & Forearms', isCustom: false, isFavorite: false },
  { id: 'crossbody-hammer', name: 'Cross-Body Hammer Curl', muscleGroup: 'Biceps', instrument: 'Dumbbell', target: 'Brachialis & Forearms', isCustom: false, isFavorite: false },
  { id: 'db-preacher-curl', name: 'Dumbbell Preacher Curl', muscleGroup: 'Biceps', instrument: 'Dumbbell', target: 'Short Head (Inner Bicep)', isCustom: false, isFavorite: false },
  { id: 'incline-hammer-curl', name: 'Incline Hammer Curl', muscleGroup: 'Biceps', instrument: 'Dumbbell', target: 'Brachialis & Long Head', isCustom: false, isFavorite: false },
  { id: 'rev-db-curl', name: 'Reverse Dumbbell Curl', muscleGroup: 'Biceps', instrument: 'Dumbbell', target: 'Brachioradialis & Forearms', isCustom: false, isFavorite: false },

  // -- Barbell --
  { id: 'bb-curl', name: 'Barbell Curl', muscleGroup: 'Biceps', instrument: 'Barbell', target: 'Overall Biceps', isCustom: false, isFavorite: false },
  { id: 'ez-bar-curl', name: 'EZ Bar Curl', muscleGroup: 'Biceps', instrument: 'Barbell', target: 'Overall Biceps', isCustom: false, isFavorite: false },
  { id: 'ez-bar-preacher-curl', name: 'EZ-Bar Preacher Curl', muscleGroup: 'Biceps', instrument: 'Barbell', target: 'Short Head (Inner Bicep)', isCustom: false, isFavorite: false },
  { id: 'spider-curl-bb', name: 'Spider Curl', muscleGroup: 'Biceps', instrument: 'Barbell', target: 'Short Head (Peak)', isCustom: false, isFavorite: false },
  { id: 'rev-bb-curl', name: 'Reverse Barbell Curl', muscleGroup: 'Biceps', instrument: 'Barbell', target: 'Brachioradialis & Forearms', isCustom: false, isFavorite: false },
  { id: 'rev-ez-bar-curl', name: 'Reverse EZ-Bar Curl', muscleGroup: 'Biceps', instrument: 'Barbell', target: 'Brachioradialis & Forearms', isCustom: false, isFavorite: false },

  // -- Cable --
  { id: 'cable-bicep-curl', name: 'Cable Curl', muscleGroup: 'Biceps', instrument: 'Cable', target: 'Overall Biceps', isCustom: false, isFavorite: false },
  { id: 'dual-cable-bicep-curl', name: 'Dual Cable Bicep Curl', muscleGroup: 'Biceps', instrument: 'Cable', target: 'Short Head (Peak)', isCustom: false, isFavorite: false },
  { id: 'cable-hammer-curl', name: 'Cable Hammer Curl', muscleGroup: 'Biceps', instrument: 'Cable', target: 'Brachialis & Forearms', isCustom: false, isFavorite: false },
  { id: 'cable-rope-curl', name: 'Cable Rope Curl', muscleGroup: 'Biceps', instrument: 'Cable', target: 'Brachialis & Forearms', isCustom: false, isFavorite: false },
  { id: 'bayesian-cable-curl', name: 'Bayesian Cable Curl', muscleGroup: 'Biceps', instrument: 'Cable', target: 'Long Head (Bicep Peak)', isCustom: false, isFavorite: false },
  { id: 'cable-reverse-curl', name: 'Cable Reverse Curl', muscleGroup: 'Biceps', instrument: 'Cable', target: 'Brachioradialis & Forearms', isCustom: false, isFavorite: false },

  // -- Machine --
  { id: 'machine-preacher-curl', name: 'Machine Preacher Curl', muscleGroup: 'Biceps', instrument: 'Machine', target: 'Short Head (Inner Bicep)', isCustom: false, isFavorite: false },

  // ==========================
  // BACK
  // ==========================
  // -- Barbell --
  { id: 'bb-row', name: 'Barbell Bent Over Row', muscleGroup: 'Back', instrument: 'Barbell', target: 'Upper Back & Scapula', isCustom: false, isFavorite: false },
  { id: 'pendlay-row', name: 'Pendlay Row', muscleGroup: 'Back', instrument: 'Barbell', target: 'Upper Back & Scapula', isCustom: false, isFavorite: false },
  { id: 'tbar-row', name: 'T-Bar Row', muscleGroup: 'Back', instrument: 'Barbell', target: 'Mid Back (Thickness)', isCustom: false, isFavorite: false },
  { id: 'deadlift', name: 'Deadlift', muscleGroup: 'Back', instrument: 'Barbell', target: 'Lower Back & Posterior Chain', isCustom: false, isFavorite: false },
  { id: 'trap-bar-deadlift', name: 'Trap Bar Deadlift', muscleGroup: 'Back', instrument: 'Barbell', target: 'Lower Back & Glutes', isCustom: false, isFavorite: false },
  { id: 'rack-pulls', name: 'Rack Pulls', muscleGroup: 'Back', instrument: 'Barbell', target: 'Upper Back & Traps', isCustom: false, isFavorite: false },
  { id: 'bb-shrugs', name: 'Barbell Shrugs', muscleGroup: 'Back', instrument: 'Barbell', target: 'Traps', isCustom: false, isFavorite: false },

  // -- Dumbbell --
  { id: 'db-row', name: 'Dumbbell Row', muscleGroup: 'Back', instrument: 'Dumbbell', target: 'Lats & Mid Back', isCustom: false, isFavorite: false },
  { id: 'chest-supported-db-row', name: 'Chest-Supported Dumbbell Row', muscleGroup: 'Back', instrument: 'Dumbbell', target: 'Upper Back (Rhomboids)', isCustom: false, isFavorite: false },
  { id: 'db-shrugs', name: 'Dumbbell Shrugs', muscleGroup: 'Back', instrument: 'Dumbbell', target: 'Traps', isCustom: false, isFavorite: false },
  { id: 'db-back-pullover', name: 'Dumbbell Back Pullover', muscleGroup: 'Back', instrument: 'Dumbbell', target: 'Lower Lats', isCustom: false, isFavorite: false },

  // -- Cable --
  { id: 'cable-row', name: 'Seated Cable Row', muscleGroup: 'Back', instrument: 'Cable', target: 'Mid Back & Scapula', isCustom: false, isFavorite: false },
  { id: 'single-arm-cable-row', name: 'Single-Arm Cable Row', muscleGroup: 'Back', instrument: 'Cable', target: 'Lats & Mid Back', isCustom: false, isFavorite: false },
  { id: 'lat-pulldown', name: 'Lat Pulldown', muscleGroup: 'Back', instrument: 'Cable', target: 'Lats (Width)', isCustom: false, isFavorite: false },
  { id: 'underhand-pulldown', name: 'Underhand Lat Pulldown', muscleGroup: 'Back', instrument: 'Cable', target: 'Lower Lats', isCustom: false, isFavorite: false },
  { id: 'close-grip-pulldown', name: 'Close Grip Lat Pulldown', muscleGroup: 'Back', instrument: 'Cable', target: 'Lower Lats', isCustom: false, isFavorite: false },
  { id: 'neutral-grip-lat-pulldown', name: 'Neutral-Grip Lat Pulldown', muscleGroup: 'Back', instrument: 'Cable', target: 'Lats', isCustom: false, isFavorite: false },
  { id: 'wide-grip-lat-pulldown', name: 'Wide-Grip Lat Pulldown', muscleGroup: 'Back', instrument: 'Cable', target: 'Lats (Width)', isCustom: false, isFavorite: false },
  { id: 'single-arm-pulldown', name: 'Single-Arm Lat Pulldown', muscleGroup: 'Back', instrument: 'Cable', target: 'Lower Lats', isCustom: false, isFavorite: false },
  { id: 'straight-arm-pulldown', name: 'Straight Arm Pulldown', muscleGroup: 'Back', instrument: 'Cable', target: 'Lower Lats', isCustom: false, isFavorite: false },
  { id: 'cable-back-pullover', name: 'Cable Pullover', muscleGroup: 'Back', instrument: 'Cable', target: 'Lower Lats', isCustom: false, isFavorite: false },
  { id: 'face-pull-back', name: 'Face Pull', muscleGroup: 'Back', instrument: 'Cable', target: 'Rear Delts & Upper Back', isCustom: false, isFavorite: false },
  { id: 'cable-rear-delt-row', name: 'Cable Rear Delt Row', muscleGroup: 'Back', instrument: 'Cable', target: 'Rear Delts & Upper Back', isCustom: false, isFavorite: false },
  { id: 'reverse-cable-fly', name: 'Reverse Cable Fly', muscleGroup: 'Back', instrument: 'Cable', target: 'Rear Delts', isCustom: false, isFavorite: false },

  // -- Machine --
  { id: 'machine-row', name: 'Machine Row', muscleGroup: 'Back', instrument: 'Machine', target: 'Mid Back & Lats', isCustom: false, isFavorite: false },

  // -- Bodyweight --
  { id: 'pull-ups', name: 'Pull-up', muscleGroup: 'Back', instrument: 'Bodyweight', target: 'Lats (Width)', isCustom: false, isFavorite: true },
  { id: 'chin-up-back', name: 'Chin-up', muscleGroup: 'Back', instrument: 'Bodyweight', target: 'Lower Lats & Biceps', isCustom: false, isFavorite: false },
  { id: 'inverted-row', name: 'Inverted Row', muscleGroup: 'Back', instrument: 'Bodyweight', target: 'Upper Back & Scapula', isCustom: false, isFavorite: false },

  // ==========================
  // SHOULDERS
  // ==========================
  // -- Barbell --
  { id: 'bb-overhead-press', name: 'Overhead Press', muscleGroup: 'Shoulders', instrument: 'Barbell', target: 'Front Delts', isCustom: false, isFavorite: true },
  { id: 'seated-bb-shoulder-press', name: 'Seated Barbell Shoulder Press', muscleGroup: 'Shoulders', instrument: 'Barbell', target: 'Front Delts', isCustom: false, isFavorite: false },
  { id: 'bb-upright-row', name: 'Barbell Upright Row', muscleGroup: 'Shoulders', instrument: 'Barbell', target: 'Side Delts & Traps', isCustom: false, isFavorite: false },
  { id: 'ez-bar-upright-row', name: 'EZ-Bar Upright Row', muscleGroup: 'Shoulders', instrument: 'Barbell', target: 'Side Delts & Traps', isCustom: false, isFavorite: false },

  // -- Dumbbell --
  { id: 'db-shoulder-press', name: 'Dumbbell Shoulder Press', muscleGroup: 'Shoulders', instrument: 'Dumbbell', target: 'Front Delts', isCustom: false, isFavorite: false },
  { id: 'arnold-press', name: 'Arnold Press', muscleGroup: 'Shoulders', instrument: 'Dumbbell', target: 'Front & Side Delts', isCustom: false, isFavorite: false },
  { id: 'db-lateral-raise', name: 'Lateral Raise', muscleGroup: 'Shoulders', instrument: 'Dumbbell', target: 'Side Delts', isCustom: false, isFavorite: false },
  { id: 'leaning-db-lateral-raise', name: 'Leaning Dumbbell Lateral Raise', muscleGroup: 'Shoulders', instrument: 'Dumbbell', target: 'Side Delts', isCustom: false, isFavorite: false },
  { id: 'db-front-raise', name: 'Dumbbell Front Raise', muscleGroup: 'Shoulders', instrument: 'Dumbbell', target: 'Front Delts', isCustom: false, isFavorite: false },
  { id: 'db-rear-delt-fly', name: 'Rear Delt Fly', muscleGroup: 'Shoulders', instrument: 'Dumbbell', target: 'Rear Delts', isCustom: false, isFavorite: false },
  { id: 'db-upright-row', name: 'Dumbbell Upright Row', muscleGroup: 'Shoulders', instrument: 'Dumbbell', target: 'Side Delts & Traps', isCustom: false, isFavorite: false },

  // -- Cable --
  { id: 'cable-lateral-raise', name: 'Cable Lateral Raise', muscleGroup: 'Shoulders', instrument: 'Cable', target: 'Side Delts', isCustom: false, isFavorite: false },
  { id: 'cable-front-raise', name: 'Cable Front Raise', muscleGroup: 'Shoulders', instrument: 'Cable', target: 'Front Delts', isCustom: false, isFavorite: false },
  { id: 'cable-rear-delt-fly', name: 'Cable Rear Delt Fly', muscleGroup: 'Shoulders', instrument: 'Cable', target: 'Rear Delts', isCustom: false, isFavorite: false },
  { id: 'cable-upright-row', name: 'Cable Upright Row', muscleGroup: 'Shoulders', instrument: 'Cable', target: 'Side Delts & Traps', isCustom: false, isFavorite: false },
  { id: 'face-pull', name: 'Face Pull', muscleGroup: 'Shoulders', instrument: 'Cable', target: 'Rear Delts & Upper Back', isCustom: false, isFavorite: false },

  // -- Machine --
  { id: 'machine-shoulder-press', name: 'Machine Shoulder Press', muscleGroup: 'Shoulders', instrument: 'Machine', target: 'Front Delts', isCustom: false, isFavorite: false },
  { id: 'smith-shoulder-press', name: 'Smith Machine Shoulder Press', muscleGroup: 'Shoulders', instrument: 'Machine', target: 'Front Delts', isCustom: false, isFavorite: false },
  { id: 'machine-lateral-raise', name: 'Machine Lateral Raise', muscleGroup: 'Shoulders', instrument: 'Machine', target: 'Side Delts', isCustom: false, isFavorite: false },
  { id: 'reverse-pec-deck', name: 'Reverse Pec Deck', muscleGroup: 'Shoulders', instrument: 'Machine', target: 'Rear Delts', isCustom: false, isFavorite: false },
  { id: 'machine-rear-delt-fly', name: 'Machine Rear Delt Fly', muscleGroup: 'Shoulders', instrument: 'Machine', target: 'Rear Delts', isCustom: false, isFavorite: false },

  // -- Other --
  { id: 'plate-front-raise', name: 'Plate Front Raise', muscleGroup: 'Shoulders', instrument: 'Other', target: 'Front Delts', isCustom: false, isFavorite: false },

  // ==========================
  // LEGS
  // ==========================
  // -- Barbell --
  { id: 'bb-squat', name: 'Back Squat', muscleGroup: 'Legs', instrument: 'Barbell', target: 'Quads & Glutes', isCustom: false, isFavorite: true },
  { id: 'front-squat', name: 'Barbell Front Squat', muscleGroup: 'Legs', instrument: 'Barbell', target: 'Quads', isCustom: false, isFavorite: false },
  { id: 'rdl', name: 'Romanian Deadlift', muscleGroup: 'Legs', instrument: 'Barbell', target: 'Hamstrings & Glutes', isCustom: false, isFavorite: false },
  { id: 'stiff-leg-deadlift', name: 'Stiff-Leg Deadlift', muscleGroup: 'Legs', instrument: 'Barbell', target: 'Hamstrings', isCustom: false, isFavorite: false },
  { id: 'sumo-deadlift', name: 'Sumo Deadlift', muscleGroup: 'Legs', instrument: 'Barbell', target: 'Glutes & Adductors', isCustom: false, isFavorite: false },
  { id: 'hip-thrust', name: 'Barbell Hip Thrust', muscleGroup: 'Legs', instrument: 'Barbell', target: 'Glutes', isCustom: false, isFavorite: false },
  { id: 'bb-walking-lunge', name: 'Barbell Walking Lunge', muscleGroup: 'Legs', instrument: 'Barbell', target: 'Glutes & Quads', isCustom: false, isFavorite: false },

  // -- Dumbbell --
  { id: 'goblet-squat', name: 'Goblet Squat', muscleGroup: 'Legs', instrument: 'Dumbbell', target: 'Quads & Glutes', isCustom: false, isFavorite: false },
  { id: 'bulgarian-split-squat', name: 'Bulgarian Split Squat', muscleGroup: 'Legs', instrument: 'Dumbbell', target: 'Glutes & Quads', isCustom: false, isFavorite: false },
  { id: 'rev-lunge', name: 'Reverse Lunge', muscleGroup: 'Legs', instrument: 'Dumbbell', target: 'Glutes & Hamstrings', isCustom: false, isFavorite: false },
  { id: 'db-stepups', name: 'Dumbbell Step-ups', muscleGroup: 'Legs', instrument: 'Dumbbell', target: 'Glutes & Quads', isCustom: false, isFavorite: false },
  { id: 'db-rdl', name: 'Dumbbell Romanian Deadlift', muscleGroup: 'Legs', instrument: 'Dumbbell', target: 'Hamstrings & Glutes', isCustom: false, isFavorite: false },
  { id: 'single-leg-rdl', name: 'Single-Leg RDL', muscleGroup: 'Legs', instrument: 'Dumbbell', target: 'Hamstrings & Glutes', isCustom: false, isFavorite: false },

  // -- Machine --
  { id: 'leg-press', name: 'Leg Press', muscleGroup: 'Legs', instrument: 'Machine', target: 'Quads & Glutes', isCustom: false, isFavorite: false },
  { id: 'hack-squat', name: 'Hack Squat Machine', muscleGroup: 'Legs', instrument: 'Machine', target: 'Quads', isCustom: false, isFavorite: false },
  { id: 'belt-squat', name: 'Belt Squat', muscleGroup: 'Legs', instrument: 'Machine', target: 'Quads', isCustom: false, isFavorite: false },
  { id: 'v-squat-machine', name: 'V-Squat / Machine Squat', muscleGroup: 'Legs', instrument: 'Machine', target: 'Quads & Glutes', isCustom: false, isFavorite: false },
  { id: 'smith-squat', name: 'Smith Machine Squat', muscleGroup: 'Legs', instrument: 'Machine', target: 'Quads', isCustom: false, isFavorite: false },
  { id: 'machine-hip-thrust', name: 'Machine Hip Thrust', muscleGroup: 'Legs', instrument: 'Machine', target: 'Glutes', isCustom: false, isFavorite: false },
  { id: 'leg-extensions', name: 'Leg Extension', muscleGroup: 'Legs', instrument: 'Machine', target: 'Quads', isCustom: false, isFavorite: false },
  { id: 'lying-leg-curls', name: 'Lying Leg Curl', muscleGroup: 'Legs', instrument: 'Machine', target: 'Hamstrings', isCustom: false, isFavorite: false },
  { id: 'seated-leg-curls', name: 'Seated Leg Curl', muscleGroup: 'Legs', instrument: 'Machine', target: 'Hamstrings', isCustom: false, isFavorite: false },
  { id: 'standing-calf-raises', name: 'Standing Calf Raise', muscleGroup: 'Legs', instrument: 'Machine', target: 'Calves', isCustom: false, isFavorite: false },
  { id: 'seated-calf-raises', name: 'Seated Calf Raise', muscleGroup: 'Legs', instrument: 'Machine', target: 'Calves', isCustom: false, isFavorite: false },
  { id: 'calf-press-legpress', name: 'Leg Press Calf Press', muscleGroup: 'Legs', instrument: 'Machine', target: 'Calves', isCustom: false, isFavorite: false },
  { id: 'adductor-machine', name: 'Adductor Machine', muscleGroup: 'Legs', instrument: 'Machine', target: 'Adductors (Inner Thighs)', isCustom: false, isFavorite: false },

  // -- Bodyweight --
  { id: 'lunges', name: 'Lunges', muscleGroup: 'Legs', instrument: 'Bodyweight', target: 'Glutes & Quads', isCustom: false, isFavorite: false },
  { id: 'glute-bridge', name: 'Glute Bridge', muscleGroup: 'Legs', instrument: 'Bodyweight', target: 'Glutes', isCustom: false, isFavorite: false },

  // ==========================
  // ABS
  // ==========================
  // -- Cable --
  { id: 'cable-crunch', name: 'Cable Crunch', muscleGroup: 'Abs', instrument: 'Cable', target: 'Upper Abs', isCustom: false, isFavorite: false },
  { id: 'cable-woodchop', name: 'Cable Woodchop', muscleGroup: 'Abs', instrument: 'Cable', target: 'Obliques', isCustom: false, isFavorite: false },
  { id: 'cable-oblique-crunch', name: 'Cable Oblique Crunch', muscleGroup: 'Abs', instrument: 'Cable', target: 'Obliques', isCustom: false, isFavorite: false },

  // -- Machine --
  { id: 'machine-ab-crunch', name: 'Machine Ab Crunch', muscleGroup: 'Abs', instrument: 'Machine', target: 'Upper Abs', isCustom: false, isFavorite: false },

  // -- Bodyweight --
  { id: 'ab-crunch', name: 'Abdominal Crunch', muscleGroup: 'Abs', instrument: 'Bodyweight', target: 'Upper Abs', isCustom: false, isFavorite: true },
  { id: 'reverse-crunch', name: 'Reverse Crunch', muscleGroup: 'Abs', instrument: 'Bodyweight', target: 'Lower Abs', isCustom: false, isFavorite: false },
  { id: 'bicycle-crunches', name: 'Bicycle Crunches', muscleGroup: 'Abs', instrument: 'Bodyweight', target: 'Obliques & Upper Abs', isCustom: false, isFavorite: false },
  { id: 'russian-twist', name: 'Russian Twist', muscleGroup: 'Abs', instrument: 'Bodyweight', target: 'Obliques', isCustom: false, isFavorite: false },
  { id: 'plank', name: 'Plank', muscleGroup: 'Abs', instrument: 'Bodyweight', target: 'Deep Core', isCustom: false, isFavorite: false },
  { id: 'dead-bug', name: 'Dead Bug', muscleGroup: 'Abs', instrument: 'Bodyweight', target: 'Deep Core', isCustom: false, isFavorite: false },
  { id: 'lying-leg-raises', name: 'Lying Leg Raises', muscleGroup: 'Abs', instrument: 'Bodyweight', target: 'Lower Abs', isCustom: false, isFavorite: false },
  { id: 'hanging-knee-raise', name: 'Hanging Knee Raise', muscleGroup: 'Abs', instrument: 'Bodyweight', target: 'Lower Abs', isCustom: false, isFavorite: false },

  // -- Other --
  { id: 'ab-wheel', name: 'Ab Wheel Rollout', muscleGroup: 'Abs', instrument: 'Other', target: 'Deep Core', isCustom: false, isFavorite: false },
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
  'chest-supported-db-row',
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
  'ez-bar-preacher-curl',
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
  'lunges',
  'standing-calf-raises',

  // Abs
  'cable-crunch',
  'hanging-knee-raise',
  'plank'
];

export const MOVEMENT_PATTERN_GROUPS: string[][] = [
  // ==========================
  // CHEST VARIATION FAMILIES
  // ==========================
  // Flat Heavy Presses
  ['bb-bench-press', 'db-bench-press', 'chest-press-machine', 'hammer-strength-press', 'smith-bench-press'],
  // Incline Presses (Upper Chest)
  ['bb-incline-press', 'db-incline-press', 'smith-incline-press', 'incline-machine-chest-press', 'landmine-press'],
  // Decline / Lower Chest Presses
  ['bb-decline-press', 'db-decline-press', 'machine-decline-press', 'chest-dips', 'chest-dip-machine'],
  // Chest Flyes (Isolation)
  ['pec-deck', 'machine-fly', 'cable-crossover', 'high-to-low-cable', 'low-to-high-cable', 'db-flyes', 'db-incline-flyes'],
  // Bodyweight Push-ups
  ['push-ups', 'weighted-pushups', 'incline-pushup', 'decline-pushup'],
  // Pullovers
  ['db-pullover', 'cable-pullover'],

  // ==========================
  // BACK VARIATION FAMILIES
  // ==========================
  // Vertical Pulldowns & Pullups (Lat Width)
  ['lat-pulldown', 'neutral-grip-lat-pulldown', 'wide-grip-lat-pulldown', 'pull-ups', 'chin-up-back', 'underhand-pulldown', 'close-grip-pulldown', 'single-arm-pulldown'],
  // Horizontal Rows (Upper Back / Mid Back)
  ['bb-row', 'pendlay-row', 'cable-row', 'single-arm-cable-row', 'tbar-row', 'chest-supported-db-row', 'machine-row', 'db-row', 'inverted-row'],
  // Lat Isolation / Straight Arm Pullovers
  ['straight-arm-pulldown', 'cable-back-pullover', 'db-back-pullover'],
  // Posterior Chain / Deadlifts & Hinges
  ['deadlift', 'trap-bar-deadlift', 'rack-pulls'],
  // Traps / Shrugs
  ['bb-shrugs', 'db-shrugs'],

  // ==========================
  // SHOULDERS VARIATION FAMILIES
  // ==========================
  // Overhead Presses
  ['bb-overhead-press', 'seated-bb-shoulder-press', 'db-shoulder-press', 'machine-shoulder-press', 'smith-shoulder-press', 'arnold-press'],
  // Lateral Raises (Side Delts)
  ['db-lateral-raise', 'leaning-db-lateral-raise', 'cable-lateral-raise', 'machine-lateral-raise'],
  // Rear Delts (Posterior Delts)
  ['reverse-pec-deck', 'machine-rear-delt-fly', 'face-pull', 'face-pull-back', 'cable-rear-delt-fly', 'cable-rear-delt-row', 'reverse-cable-fly', 'db-rear-delt-fly'],
  // Front Delts / Upright Pulls
  ['bb-upright-row', 'ez-bar-upright-row', 'db-upright-row', 'cable-upright-row', 'db-front-raise', 'cable-front-raise', 'plate-front-raise'],

  // ==========================
  // TRICEPS VARIATION FAMILIES
  // ==========================
  // Pushdowns (Lateral/Medial Head)
  ['tricep-pushdown', 'rope-pushdown', 'cable-vbar-pushdown', 'straight-bar-pushdown', 'single-arm-pushdown', 'rev-grip-pushdown'],
  // Overhead Extensions (Long Head)
  ['cable-overhead-ext', 'cable-rope-overhead', 'overhead-db-extension', 'two-arm-db-overhead-ext', 'bb-overhead-ext', 'ez-bar-french-press'],
  // Lying Extensions (Skull Crushers)
  ['skull-crushers', 'ez-bar-skull-crusher', 'db-skull-crushers', 'lying-db-ext'],
  // Compound Presses & Dips
  ['close-grip-bench', 'bench-dips', 'weighted-dips', 'tricep-dip-machine', 'close-grip-pushups', 'diamond-pushups'],
  // Kickbacks
  ['db-kickbacks', 'cable-one-arm-kickback', 'cable-kickback'],

  // ==========================
  // BICEPS VARIATION FAMILIES
  // ==========================
  // Standard Supinated Curls
  ['db-bicep-curl', 'bb-curl', 'ez-bar-curl', 'cable-bicep-curl', 'dual-cable-bicep-curl', 'incline-db-curl', 'bayesian-cable-curl'],
  // Hammer Curls (Brachialis / Forearms)
  ['db-hammer-curl', 'crossbody-hammer', 'incline-hammer-curl', 'cable-hammer-curl', 'cable-rope-curl'],
  // Preacher & Peak Curls
  ['ez-bar-preacher-curl', 'machine-preacher-curl', 'db-preacher-curl', 'concentration-curl', 'spider-curl', 'spider-curl-bb'],
  // Reverse Curls & Forearms
  ['rev-db-curl', 'rev-bb-curl', 'rev-ez-bar-curl', 'cable-reverse-curl'],

  // ==========================
  // LEGS VARIATION FAMILIES
  // ==========================
  // Squats & Leg Press (Quads)
  ['bb-squat', 'front-squat', 'hack-squat', 'leg-press', 'smith-squat', 'goblet-squat', 'belt-squat', 'v-squat-machine'],
  // Lunges & Unilateral
  ['bulgarian-split-squat', 'bb-walking-lunge', 'lunges', 'rev-lunge', 'db-stepups'],
  // Hamstring Curls (Knee Flexion)
  ['lying-leg-curls', 'seated-leg-curls'],
  // Hip Hinges & Glutes
  ['rdl', 'stiff-leg-deadlift', 'single-leg-rdl', 'sumo-deadlift', 'hip-thrust', 'machine-hip-thrust', 'glute-bridge'],
  // Quad Isolation
  ['leg-extensions'],
  // Calves
  ['standing-calf-raises', 'seated-calf-raises', 'calf-press-legpress'],
  // Adductor
  ['adductor-machine'],

  // ==========================
  // ABS VARIATION FAMILIES
  // ==========================
  // Crunches
  ['cable-crunch', 'ab-crunch', 'machine-ab-crunch', 'bicycle-crunches', 'reverse-crunch', 'cable-oblique-crunch'],
  // Leg & Knee Raises
  ['hanging-knee-raise', 'lying-leg-raises'],
  // Stability & Core
  ['plank', 'ab-wheel', 'russian-twist', 'cable-woodchop', 'dead-bug'],
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
    'ez-bar-preacher-curl',
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
    'ez-bar-preacher-curl',
  ],
  'ez-bar-curl': [
    'bb-curl',
    'db-bicep-curl',
    'cable-bicep-curl',
    'ez-bar-preacher-curl',
  ],
  'ez-bar-preacher-curl': [
    'machine-preacher-curl',
    'db-preacher-curl',
    'ez-bar-curl',
    'cable-bicep-curl',
  ],
  'machine-preacher-curl': [
    'ez-bar-preacher-curl',
    'db-preacher-curl',
    'ez-bar-curl',
    'cable-bicep-curl',
  ],
  'db-preacher-curl': [
    'machine-preacher-curl',
    'ez-bar-preacher-curl',
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
    'machine-fly',
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
    'chin-up-back',
    'close-grip-pulldown',
    'single-arm-pulldown',
    'underhand-pulldown',
  ],
  'bb-row': [
    'cable-row',
    'chest-supported-db-row',
    'machine-row',
    'db-row',
  ],
  'cable-row': [
    'bb-row',
    'db-row',
    'chest-supported-db-row',
    'machine-row',
  ],
  'deadlift': [
    'trap-bar-deadlift',
    'rdl',
    'rack-pulls',
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
    'machine-lateral-raise',
    'face-pull',
    'db-front-raise',
  ],
  'face-pull': [
    'reverse-pec-deck',
    'machine-rear-delt-fly',
    'db-rear-delt-fly',
  ],
  'db-rear-delt-fly': [
    'reverse-pec-deck',
    'face-pull',
  ],
  'reverse-pec-deck': [
    'face-pull',
    'machine-rear-delt-fly',
    'db-rear-delt-fly',
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
    'ez-bar-skull-crusher',
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
    'stiff-leg-deadlift',
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

export const getMovementFamilyIds = (exerciseId: string): string[] => {
  const explicitGroup = MOVEMENT_PATTERN_GROUPS.find((group) => group.includes(exerciseId));
  if (explicitGroup) {
    return explicitGroup;
  }
  return [exerciseId];
};
