import { Instrument } from './exercises';

export type ImageColor = 'blue' | 'green' | 'light_blue' | 'orange';

export const EQUIPMENT_IMAGES: Record<string, Record<ImageColor, any>> = {
  dumbbell: {
    blue: require('../assets/images/forget/db blue.png'),
    green: require('../assets/images/forget/db green.png'),
    light_blue: require('../assets/images/forget/db light blue.png'),
    orange: require('../assets/images/forget/db orange.png'),
  },
  barbell: {
    blue: require('../assets/images/forget/barbell blue.png'),
    green: require('../assets/images/forget/barbell green.png'),
    light_blue: require('../assets/images/forget/barbell light blue.png'),
    orange: require('../assets/images/forget/orange barbell.png'),
  },
  cable: {
    blue: require('../assets/images/forget/cable dark blue.png'),
    green: require('../assets/images/forget/cable green image.png'),
    light_blue: require('../assets/images/forget/cable light blue.png'),
    orange: require('../assets/images/forget/cable orange.png'),
  },
  machine: {
    blue: require('../assets/images/forget/machine dark blue.png'),
    green: require('../assets/images/forget/machine green.png'),
    light_blue: require('../assets/images/forget/machine light blue.png'),
    orange: require('../assets/images/forget/machine orange.png'),
  },
  bodyweight: {
    blue: require('../assets/images/forget/body weight dark blue.png'),
    green: require('../assets/images/forget/body weight green.png'),
    light_blue: require('../assets/images/forget/body weight light blue.png'),
    orange: require('../assets/images/forget/body weight orange.png'),
  },
  kettlebell: {
    blue: require('../assets/images/forget/kettleball image.png'),
    green: require('../assets/images/forget/kettleball image.png'),
    light_blue: require('../assets/images/forget/kettleball image.png'),
    orange: require('../assets/images/forget/kettleball image.png'),
  },
};

export function getExerciseImage(instrument: Instrument, index: number) {
  const normEquip = (instrument || 'Other').toLowerCase();
  
  let key = 'cable'; // default fallback for 'other'
  if (normEquip === 'dumbbell') {
    key = 'dumbbell';
  } else if (normEquip === 'barbell') {
    key = 'barbell';
  } else if (normEquip === 'cable') {
    key = 'cable';
  } else if (normEquip === 'machine') {
    key = 'machine';
  } else if (normEquip === 'bodyweight') {
    key = 'bodyweight';
  } else if (normEquip === 'kettlebell') {
    key = 'kettlebell';
  }

  const colors: ImageColor[] = ['blue', 'green', 'light_blue', 'orange'];
  const color = colors[index % colors.length];

  return EQUIPMENT_IMAGES[key][color];
}
