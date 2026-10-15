import { ImageSourcePropType } from 'react-native';

export interface FormGuide {
  exerciseId: string;
  name: string;
  targetMuscle: string;
  gif: ImageSourcePropType;
  cues: string[];
  commonMistakes?: string[];
}

export const FORM_GUIDES: Record<string, FormGuide> = {};

export function getFormGuide(exerciseId: string): FormGuide | null {
  return FORM_GUIDES[exerciseId] || null;
}
