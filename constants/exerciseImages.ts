import { ImageSourcePropType } from 'react-native';

const IMAGES: Record<string, ImageSourcePropType> = {
  'bb-bench-press': require('../assets/exercises/bb-bench-press.jpg'),
  'bb-incline-press': require('../assets/exercises/bb-incline-press.jpg'),
  'bb-decline-press': require('../assets/exercises/bb-decline-press.jpg'),
  'landmine-press': require('../assets/exercises/landmine-press.jpg'),
  'db-bench-press': require('../assets/exercises/db-bench-press.jpg'),
  'db-incline-press': require('../assets/exercises/db-incline-press.jpg'),
  'db-decline-press': require('../assets/exercises/db-decline-press.jpg'),
  'db-flyes': require('../assets/exercises/db-flyes.jpg'),
  'db-incline-flyes': require('../assets/exercises/db-incline-flyes.jpg'),
  'db-pullover': require('../assets/exercises/db-pullover.jpg'),
  'cable-crossover': require('../assets/exercises/cable-crossover.jpg'),
  'smith-incline-press': require('../assets/exercises/smith-incline-press.jpg'),
  'pec-deck': require('../assets/exercises/pec-deck.jpg'),
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
  'high-to-low-cable': IMAGES['cable-crossover'],
  'low-to-high-cable': IMAGES['cable-crossover'],
  'cable-pullover': IMAGES['db-pullover'],

  // Machine Chest
  'chest-press-machine': IMAGES['db-bench-press'],
  'incline-machine-chest-press': IMAGES['smith-incline-press'],
  'hammer-strength-press': IMAGES['smith-incline-press'],
  'pec-deck': IMAGES['pec-deck'],
  'machine-fly': IMAGES['pec-deck'],
  'machine-decline-press': IMAGES['bb-decline-press'],
  'smith-bench-press': IMAGES['bb-bench-press'],
  'smith-incline-press': IMAGES['smith-incline-press'],
  'chest-dip-machine': IMAGES['bb-decline-press'],

  // Bodyweight Chest
  'push-ups': IMAGES['db-bench-press'],
  'weighted-pushups': IMAGES['db-bench-press'],
  'incline-pushup': IMAGES['db-incline-press'],
  'decline-pushup': IMAGES['db-decline-press'],
  'chest-dips': IMAGES['bb-decline-press'],
};

export function getExerciseIllustration(exerciseId: string): ImageSourcePropType | null {
  return EXERCISE_IMAGES[exerciseId] || null;
}
