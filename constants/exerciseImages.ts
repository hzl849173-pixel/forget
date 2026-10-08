import { ImageSourcePropType } from 'react-native';

const IMAGES: Record<string, ImageSourcePropType> = {
  // Barbell
  'bb-bench-press': require('../assets/exercises/bb-bench-press.jpg'),
  'bb-incline-press': require('../assets/exercises/bb-incline-press.jpg'),
  'bb-decline-press': require('../assets/exercises/bb-decline-press.jpg'),
  'landmine-press': require('../assets/exercises/landmine-press.jpg'),

  // Dumbbell
  'db-bench-press': require('../assets/exercises/db-bench-press.jpg'),
  'db-incline-press': require('../assets/exercises/db-incline-press.jpg'),
  'db-decline-press': require('../assets/exercises/db-decline-press.jpg'),
  'db-flyes': require('../assets/exercises/db-flyes.jpg'),
  'db-incline-flyes': require('../assets/exercises/db-incline-flyes.jpg'),
  'db-pullover': require('../assets/exercises/db-pullover.jpg'),

  // Cable
  'cable-crossover': require('../assets/exercises/cable-crossover.jpg'),
  'high-to-low-cable': require('../assets/exercises/high-to-low-cable.jpg'),
  'low-to-high-cable': require('../assets/exercises/low-to-high-cable.jpg'),
  'cable-pullover': require('../assets/exercises/cable-pullover.jpg'),

  // Machine
  'chest-press-machine': require('../assets/exercises/chest-press-machine.jpg'),
  'incline-machine-chest-press': require('../assets/exercises/incline-machine-chest-press.jpg'),
  'hammer-strength-press': require('../assets/exercises/hammer-strength-press.jpg'),
  'pec-deck': require('../assets/exercises/pec-deck.jpg'),
  'machine-decline-press': require('../assets/exercises/machine-decline-press.jpg'),
  'smith-bench-press': require('../assets/exercises/smith-bench-press.jpg'),
  'smith-incline-press': require('../assets/exercises/smith-incline-press.jpg'),
  'chest-dip-machine': require('../assets/exercises/chest-dip-machine.jpg'),

  // Bodyweight
  'push-ups': require('../assets/exercises/push-ups.jpg'),
  'incline-pushup': require('../assets/exercises/incline-pushup.jpg'),
  'decline-pushup': require('../assets/exercises/decline-pushup.jpg'),
  'chest-dips': require('../assets/exercises/chest-dips.jpg'),

  // Triceps
  'rope-pushdown': require('../assets/exercises/rope-pushdown.jpg'),
  'skull-crushers': require('../assets/exercises/skull-crushers.jpg'),
  'overhead-db-extension': require('../assets/exercises/overhead-db-extension.jpg'),
  'close-grip-bench': require('../assets/exercises/close-grip-bench.jpg'),
  'bench-dips': require('../assets/exercises/bench-dips.jpg'),
  'db-kickbacks': require('../assets/exercises/db-kickbacks.jpg'),
  'cable-overhead-ext': require('../assets/exercises/cable-overhead-ext.jpg'),
  'diamond-pushups': require('../assets/exercises/diamond-pushups.jpg'),
  'tricep-dip-machine': require('../assets/exercises/tricep-dip-machine.jpg'),
  'straight-bar-pushdown': require('../assets/exercises/straight-bar-pushdown.jpg'),
  'cable-vbar-pushdown': require('../assets/exercises/cable-vbar-pushdown.jpg'),
  'single-arm-pushdown': require('../assets/exercises/single-arm-pushdown.jpg'),
};

export const EXERCISE_IMAGES: Record<string, ImageSourcePropType> = {
  // Barbell Chest
  'bb-bench-press': IMAGES['bb-bench-press'],
  'bb-incline-press': IMAGES['bb-incline-press'],
  'bb-decline-press': IMAGES['bb-decline-press'],
  'landmine-press': IMAGES['landmine-press'],

  // Dumbbell Chest
  'db-bench-press': IMAGES['db-bench-press'],
  'db-incline-press': IMAGES['db-incline-press'],
  'db-decline-press': IMAGES['db-decline-press'],
  'db-flyes': IMAGES['db-flyes'],
  'db-incline-flyes': IMAGES['db-incline-flyes'],
  'db-pullover': IMAGES['db-pullover'],

  // Cable Chest
  'cable-crossover': IMAGES['cable-crossover'],
  'high-to-low-cable': IMAGES['high-to-low-cable'],
  'low-to-high-cable': IMAGES['low-to-high-cable'],
  'cable-pullover': IMAGES['cable-pullover'],

  // Machine Chest
  'chest-press-machine': IMAGES['chest-press-machine'],
  'incline-machine-chest-press': IMAGES['incline-machine-chest-press'],
  'hammer-strength-press': IMAGES['hammer-strength-press'],
  'pec-deck': IMAGES['pec-deck'],
  'machine-fly': IMAGES['pec-deck'],
  'machine-decline-press': IMAGES['machine-decline-press'],
  'smith-bench-press': IMAGES['smith-bench-press'],
  'smith-incline-press': IMAGES['smith-incline-press'],
  'chest-dip-machine': IMAGES['chest-dip-machine'],

  // Bodyweight Chest
  'push-ups': IMAGES['push-ups'],
  'weighted-pushups': IMAGES['push-ups'],
  'incline-pushup': IMAGES['incline-pushup'],
  'decline-pushup': IMAGES['decline-pushup'],
  'chest-dips': IMAGES['chest-dips'],

  // Triceps Pushdowns
  'rope-pushdown': IMAGES['rope-pushdown'],
  'tricep-pushdown': IMAGES['straight-bar-pushdown'],
  'cable-vbar-pushdown': IMAGES['cable-vbar-pushdown'],
  'straight-bar-pushdown': IMAGES['straight-bar-pushdown'],
  'single-arm-pushdown': IMAGES['single-arm-pushdown'],
  'rev-grip-pushdown': IMAGES['rope-pushdown'],

  // Triceps Skull Crushers & Lying Extensions
  'skull-crushers': IMAGES['skull-crushers'],
  'ez-bar-skull-crusher': IMAGES['skull-crushers'],
  'db-skull-crushers': IMAGES['skull-crushers'],
  'lying-db-ext': IMAGES['skull-crushers'],

  // Triceps Overhead Extensions
  'overhead-db-extension': IMAGES['overhead-db-extension'],
  'two-arm-db-overhead-ext': IMAGES['overhead-db-extension'],
  'bb-overhead-ext': IMAGES['overhead-db-extension'],
  'ez-bar-french-press': IMAGES['overhead-db-extension'],

  // Triceps Close Grip Bench
  'close-grip-bench': IMAGES['close-grip-bench'],

  // Triceps Dips
  'bench-dips': IMAGES['bench-dips'],
  'weighted-dips': IMAGES['bench-dips'],

  // Triceps Kickbacks
  'db-kickbacks': IMAGES['db-kickbacks'],
  'cable-one-arm-kickback': IMAGES['db-kickbacks'],
  'cable-kickback': IMAGES['db-kickbacks'],

  // Triceps Cable Overhead Extensions
  'cable-overhead-ext': IMAGES['cable-overhead-ext'],
  'cable-rope-overhead': IMAGES['cable-overhead-ext'],

  // Triceps Push-ups
  'diamond-pushups': IMAGES['diamond-pushups'],
  'close-grip-pushups': IMAGES['diamond-pushups'],

  // Triceps Machine Dips
  'tricep-dip-machine': IMAGES['tricep-dip-machine'],
};

export function getExerciseIllustration(exerciseId: string): ImageSourcePropType | null {
  return EXERCISE_IMAGES[exerciseId] || null;
}
