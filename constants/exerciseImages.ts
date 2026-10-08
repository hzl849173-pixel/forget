import { ImageSourcePropType } from 'react-native';

export const EXERCISE_IMAGES: Record<string, ImageSourcePropType> = {
  'bb-bench-press': require('../assets/exercises/bb-bench-press.jpg'),
  'bb-incline-press': require('../assets/exercises/bb-incline-press.jpg'),
  'db-bench-press': require('../assets/exercises/db-bench-press.jpg'),
  'db-incline-press': require('../assets/exercises/db-incline-press.jpg'),
  'smith-incline-press': require('../assets/exercises/smith-incline-press.jpg'),
  'pec-deck': require('../assets/exercises/pec-deck.jpg'),
};

export function getExerciseIllustration(exerciseId: string): ImageSourcePropType | null {
  return EXERCISE_IMAGES[exerciseId] || null;
}
