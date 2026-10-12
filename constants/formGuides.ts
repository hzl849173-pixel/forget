import { ImageSourcePropType } from 'react-native';

export interface FormGuide {
  exerciseId: string;
  name: string;
  targetMuscle: string;
  gif: ImageSourcePropType;
  cues: string[];
  commonMistakes?: string[];
}

export const FORM_GUIDES: Record<string, FormGuide> = {
  'bb-bench-press': {
    exerciseId: 'bb-bench-press',
    name: 'Barbell Bench Press',
    targetMuscle: 'Chest (Pectorals), Triceps & Front Delts',
    gif: require('../assets/form-guides/bb-bench-press.gif'),
    cues: [
      'Grip slightly wider than shoulder width with a full grip.',
      'Plant your feet firmly and pinch shoulder blades together on the bench.',
      'Inhale and lower the barbell in control to your lower-to-mid chest.',
      'Keep elbows tucked at roughly 45° to 70° (avoid excessive flaring).',
      'Press upward and slightly backward, exhaling as you extend your arms.',
    ],
    commonMistakes: [
      'Bouncing the barbell forcefully off the chest.',
      'Flaring elbows out flat at 90 degrees.',
      'Lifting your hips off the bench during the press.',
    ],
  },
};

export function getFormGuide(exerciseId: string): FormGuide | null {
  return FORM_GUIDES[exerciseId] || null;
}
