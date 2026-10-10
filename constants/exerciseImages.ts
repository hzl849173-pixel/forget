/**
 * ============================================================================
 * EXERCISE ILLUSTRATION MAPPINGS & STRICT VISUAL UNIFORMITY STANDARDS
 * ============================================================================
 * Visual Rules for Generated Exercise Assets:
 * - Background: Uniform, diffuse, seamless soft light-gray (#F4F4F4) studio ambient
 *   like `bb-incline-press.jpg`.
 *   [STRICT BAN]: NO radial spotlight, NO circular bright halo, NO vignette/dark corners
 *   (as seen in `single-arm-pushdown.jpg`).
 * - Equipment: Harmonious shades of matte aluminum, brushed steel, and graphite charcoal
 *   like `bb-incline-press.jpg`.
 *   [STRICT BAN]: NO solid jet-black monoliths or overpowering black blocks
 *   (as seen in `cable-crossover.jpg`).
 * - Target Muscle: Glowing vibrant red-orange (#FF4500) with striations on silver-gray mannequin.
 * - Details & Full Prompts: See `constants/exercises.ts` and `docs/EXERCISE_IMAGE_GENERATION_GUIDE.md`.
 * ============================================================================
 */

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
  'rev-grip-pushdown': require('../assets/exercises/rev-grip-pushdown.jpg'),
  'ez-bar-skull-crusher': require('../assets/exercises/ez-bar-skull-crusher.jpg'),
  'bb-overhead-ext': require('../assets/exercises/bb-overhead-ext.jpg'),
  'ez-bar-french-press': require('../assets/exercises/ez-bar-french-press.jpg'),
  'db-skull-crushers': require('../assets/exercises/db-skull-crushers.jpg'),
  'two-arm-db-overhead-ext': require('../assets/exercises/two-arm-db-overhead-ext.jpg'),
  'cable-rope-overhead': require('../assets/exercises/cable-rope-overhead.jpg'),
  'cable-kickback': require('../assets/exercises/cable-kickback.jpg'),
  'weighted-dips': require('../assets/exercises/weighted-dips.jpg'),
  'close-grip-pushups': require('../assets/exercises/close-grip-pushups.jpg'),
  // Biceps
  'bb-curl': require('../assets/exercises/bb-curl.jpg'),
  'ez-bar-curl': require('../assets/exercises/ez-bar-curl.jpg'),
  'db-bicep-curl': require('../assets/exercises/db-bicep-curl.jpg'),
  'db-hammer-curl': require('../assets/exercises/db-hammer-curl.jpg'),
  'incline-db-curl': require('../assets/exercises/incline-db-curl.jpg'),
  'concentration-curl': require('../assets/exercises/concentration-curl.jpg'),
  'spider-curl': require('../assets/exercises/spider-curl.jpg'),
  'ez-bar-preacher-curl': require('../assets/exercises/ez-bar-preacher-curl.jpg'),
  'db-preacher-curl': require('../assets/exercises/db-preacher-curl.jpg'),
  'cable-bicep-curl': require('../assets/exercises/cable-bicep-curl.jpg'),
  'dual-cable-bicep-curl': require('../assets/exercises/dual-cable-bicep-curl.jpg'),
  'crossbody-hammer': require('../assets/exercises/crossbody-hammer.jpg'),
  'cable-rope-curl': require('../assets/exercises/cable-rope-curl.jpg'),
  'bayesian-cable-curl': require('../assets/exercises/bayesian-cable-curl.jpg'),
  'machine-preacher-curl': require('../assets/exercises/machine-preacher-curl.jpg'),
  'spider-curl-bb': require('../assets/exercises/spider-curl-bb.jpg'),
  'incline-hammer-curl': require('../assets/exercises/incline-hammer-curl.jpg'),
  'rev-db-curl': require('../assets/exercises/rev-db-curl.jpg'),
  'rev-bb-curl': require('../assets/exercises/rev-bb-curl.jpg'),
  'rev-ez-bar-curl': require('../assets/exercises/rev-ez-bar-curl.jpg'),
  'cable-reverse-curl': require('../assets/exercises/cable-reverse-curl.jpg'),

  // Shoulders
  'bb-overhead-press': require('../assets/exercises/bb-overhead-press.jpg'),
  'seated-bb-shoulder-press': require('../assets/exercises/seated-bb-shoulder-press.jpg'),
  'bb-upright-row': require('../assets/exercises/bb-upright-row.jpg'),
  'ez-bar-upright-row': require('../assets/exercises/ez-bar-upright-row.jpg'),
  'db-shoulder-press': require('../assets/exercises/db-shoulder-press.jpg'),
  'arnold-press': require('../assets/exercises/arnold-press.jpg'),
  'db-lateral-raise': require('../assets/exercises/db-lateral-raise.jpg'),
  'leaning-db-lateral-raise': require('../assets/exercises/leaning-db-lateral-raise.jpg'),
  'db-front-raise': require('../assets/exercises/db-front-raise.jpg'),
  'db-rear-delt-fly': require('../assets/exercises/db-rear-delt-fly.jpg'),
  'db-upright-row': require('../assets/exercises/db-upright-row.jpg'),
  'cable-lateral-raise': require('../assets/exercises/cable-lateral-raise.jpg'),
  'cable-front-raise': require('../assets/exercises/cable-front-raise.jpg'),
  'cable-rear-delt-fly': require('../assets/exercises/cable-rear-delt-fly.jpg'),
  'cable-upright-row': require('../assets/exercises/cable-upright-row.jpg'),
  'face-pull': require('../assets/exercises/face-pull.jpg'),
  'machine-shoulder-press': require('../assets/exercises/machine-shoulder-press.jpg'),
  'smith-shoulder-press': require('../assets/exercises/smith-shoulder-press.jpg'),
  'machine-lateral-raise': require('../assets/exercises/machine-lateral-raise.jpg'),
  'reverse-pec-deck': require('../assets/exercises/reverse-pec-deck.jpg'),
  'machine-rear-delt-fly': require('../assets/exercises/machine-rear-delt-fly.jpg'),
  'plate-front-raise': require('../assets/exercises/plate-front-raise.jpg'),

  // Back
  'bb-row': require('../assets/exercises/bb-row.jpg'),
  'pendlay-row': require('../assets/exercises/pendlay-row.jpg'),
  'tbar-row': require('../assets/exercises/tbar-row.jpg'),
  'deadlift': require('../assets/exercises/deadlift.jpg'),
  'trap-bar-deadlift': require('../assets/exercises/trap-bar-deadlift.jpg'),
  'rack-pulls': require('../assets/exercises/rack-pulls.jpg'),
  'bb-shrugs': require('../assets/exercises/bb-shrugs.jpg'),
  'db-row': require('../assets/exercises/db-row.jpg'),
  'chest-supported-db-row': require('../assets/exercises/chest-supported-db-row.jpg'),
  'db-shrugs': require('../assets/exercises/db-shrugs.jpg'),
  'db-back-pullover': require('../assets/exercises/db-back-pullover.jpg'),
  'cable-row': require('../assets/exercises/cable-row.jpg'),
  'single-arm-cable-row': require('../assets/exercises/single-arm-cable-row.jpg'),
  'lat-pulldown': require('../assets/exercises/lat-pulldown.jpg'),
  'underhand-pulldown': require('../assets/exercises/underhand-pulldown.jpg'),
  'close-grip-pulldown': require('../assets/exercises/close-grip-pulldown.jpg'),
  'neutral-grip-lat-pulldown': require('../assets/exercises/neutral-grip-lat-pulldown.jpg'),
  'wide-grip-lat-pulldown': require('../assets/exercises/wide-grip-lat-pulldown.jpg'),
  'single-arm-pulldown': require('../assets/exercises/single-arm-pulldown.jpg'),
  'straight-arm-pulldown': require('../assets/exercises/straight-arm-pulldown.jpg'),
  'cable-back-pullover': require('../assets/exercises/cable-back-pullover.jpg'),
  'machine-row': require('../assets/exercises/machine-row.jpg'),
  'pull-ups': require('../assets/exercises/pull-ups.jpg'),
  'chin-up-back': require('../assets/exercises/chin-up-back.jpg'),
  'inverted-row': require('../assets/exercises/inverted-row.jpg'),

  // Legs
  'bb-squat': require('../assets/exercises/bb-squat.jpg'),
  'front-squat': require('../assets/exercises/front-squat.jpg'),
  'rdl': require('../assets/exercises/rdl.jpg'),
  'stiff-leg-deadlift': require('../assets/exercises/stiff-leg-deadlift.jpg'),
  'sumo-deadlift': require('../assets/exercises/sumo-deadlift.jpg'),
  'hip-thrust': require('../assets/exercises/hip-thrust.jpg'),
  'bb-walking-lunge': require('../assets/exercises/bb-walking-lunge.jpg'),
  'goblet-squat': require('../assets/exercises/goblet-squat.jpg'),
  'bulgarian-split-squat': require('../assets/exercises/bulgarian-split-squat.jpg'),
  'rev-lunge': require('../assets/exercises/rev-lunge.jpg'),
  'db-rdl': require('../assets/exercises/db-rdl.jpg'),
  'db-stepups': require('../assets/exercises/db-stepups.jpg'),
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
  'rev-grip-pushdown': IMAGES['rev-grip-pushdown'],

  // Triceps Skull Crushers & Lying Extensions
  'skull-crushers': IMAGES['skull-crushers'],
  'ez-bar-skull-crusher': IMAGES['ez-bar-skull-crusher'],
  'db-skull-crushers': IMAGES['db-skull-crushers'],
  'lying-db-ext': IMAGES['db-skull-crushers'],

  // Triceps Overhead Extensions
  'overhead-db-extension': IMAGES['overhead-db-extension'],
  'two-arm-db-overhead-ext': IMAGES['two-arm-db-overhead-ext'],
  'bb-overhead-ext': IMAGES['bb-overhead-ext'],
  'ez-bar-french-press': IMAGES['ez-bar-french-press'],

  // Triceps Close Grip Bench
  'close-grip-bench': IMAGES['close-grip-bench'],

  // Triceps Dips
  'bench-dips': IMAGES['bench-dips'],
  'weighted-dips': IMAGES['weighted-dips'],

  // Triceps Kickbacks
  'db-kickbacks': IMAGES['db-kickbacks'],
  'cable-one-arm-kickback': IMAGES['cable-kickback'],
  'cable-kickback': IMAGES['cable-kickback'],

  // Triceps Cable Overhead Extensions
  'cable-overhead-ext': IMAGES['cable-overhead-ext'],
  'cable-rope-overhead': IMAGES['cable-rope-overhead'],

  // Triceps Push-ups
  'diamond-pushups': IMAGES['diamond-pushups'],
  'close-grip-pushups': IMAGES['close-grip-pushups'],

  // Triceps Machine Dips
  'tricep-dip-machine': IMAGES['tricep-dip-machine'],

  // Biceps
  'bb-curl': IMAGES['bb-curl'],
  'ez-bar-curl': IMAGES['ez-bar-curl'],
  'db-bicep-curl': IMAGES['db-bicep-curl'],
  'db-hammer-curl': IMAGES['db-hammer-curl'],
  'incline-db-curl': IMAGES['incline-db-curl'],
  'concentration-curl': IMAGES['concentration-curl'],
  'spider-curl': IMAGES['spider-curl'],
  'spider-curl-bb': IMAGES['spider-curl-bb'],
  'ez-bar-preacher-curl': IMAGES['ez-bar-preacher-curl'],
  'machine-preacher-curl': IMAGES['machine-preacher-curl'],
  'db-preacher-curl': IMAGES['db-preacher-curl'],
  'cable-bicep-curl': IMAGES['cable-bicep-curl'],
  'dual-cable-bicep-curl': IMAGES['dual-cable-bicep-curl'],
  'crossbody-hammer': IMAGES['crossbody-hammer'],
  'incline-hammer-curl': IMAGES['incline-hammer-curl'],
  'cable-rope-curl': IMAGES['cable-rope-curl'],
  'cable-hammer-curl': IMAGES['cable-rope-curl'],
  'bayesian-cable-curl': IMAGES['bayesian-cable-curl'],
  'rev-db-curl': IMAGES['rev-db-curl'],
  'rev-bb-curl': IMAGES['rev-bb-curl'],
  'rev-ez-bar-curl': IMAGES['rev-ez-bar-curl'],
  'cable-reverse-curl': IMAGES['cable-reverse-curl'],

  // Shoulders
  'bb-overhead-press': IMAGES['bb-overhead-press'],
  'seated-bb-shoulder-press': IMAGES['seated-bb-shoulder-press'],
  'bb-upright-row': IMAGES['bb-upright-row'],
  'ez-bar-upright-row': IMAGES['ez-bar-upright-row'],
  'db-shoulder-press': IMAGES['db-shoulder-press'],
  'arnold-press': IMAGES['arnold-press'],
  'db-lateral-raise': IMAGES['db-lateral-raise'],
  'leaning-db-lateral-raise': IMAGES['leaning-db-lateral-raise'],
  'db-front-raise': IMAGES['db-front-raise'],
  'db-rear-delt-fly': IMAGES['db-rear-delt-fly'],
  'db-upright-row': IMAGES['db-upright-row'],
  'cable-lateral-raise': IMAGES['cable-lateral-raise'],
  'cable-front-raise': IMAGES['cable-front-raise'],
  'cable-rear-delt-fly': IMAGES['cable-rear-delt-fly'],
  'cable-upright-row': IMAGES['cable-upright-row'],
  'face-pull': IMAGES['face-pull'],
  'face-pull-back': IMAGES['face-pull'],
  'reverse-cable-fly': IMAGES['cable-rear-delt-fly'],
  'cable-rear-delt-row': IMAGES['cable-rear-delt-fly'],
  'machine-shoulder-press': IMAGES['machine-shoulder-press'],
  'smith-shoulder-press': IMAGES['smith-shoulder-press'],
  'machine-lateral-raise': IMAGES['machine-lateral-raise'],
  'reverse-pec-deck': IMAGES['reverse-pec-deck'],
  'machine-rear-delt-fly': IMAGES['machine-rear-delt-fly'],
  'plate-front-raise': IMAGES['plate-front-raise'],

  // Back
  'bb-row': IMAGES['bb-row'],
  'pendlay-row': IMAGES['pendlay-row'],
  'tbar-row': IMAGES['tbar-row'],
  'deadlift': IMAGES['deadlift'],
  'trap-bar-deadlift': IMAGES['trap-bar-deadlift'],
  'rack-pulls': IMAGES['rack-pulls'],
  'bb-shrugs': IMAGES['bb-shrugs'],
  'db-row': IMAGES['db-row'],
  'chest-supported-db-row': IMAGES['chest-supported-db-row'],
  'db-shrugs': IMAGES['db-shrugs'],
  'db-back-pullover': IMAGES['db-back-pullover'],
  'cable-row': IMAGES['cable-row'],
  'single-arm-cable-row': IMAGES['single-arm-cable-row'],
  'lat-pulldown': IMAGES['lat-pulldown'],
  'underhand-pulldown': IMAGES['underhand-pulldown'],
  'close-grip-pulldown': IMAGES['close-grip-pulldown'],
  'neutral-grip-lat-pulldown': IMAGES['neutral-grip-lat-pulldown'],
  'wide-grip-lat-pulldown': IMAGES['wide-grip-lat-pulldown'],
  'single-arm-pulldown': IMAGES['single-arm-pulldown'],
  'straight-arm-pulldown': IMAGES['straight-arm-pulldown'],
  'cable-back-pullover': IMAGES['cable-back-pullover'],
  'machine-row': IMAGES['machine-row'],
  'pull-ups': IMAGES['pull-ups'],
  'chin-up-back': IMAGES['chin-up-back'],
  'inverted-row': IMAGES['inverted-row'],

  // Legs (Barbell, Dumbbell & Aliased Variations)
  'bb-squat': IMAGES['bb-squat'],
  'front-squat': IMAGES['front-squat'],
  'rdl': IMAGES['rdl'],
  'stiff-leg-deadlift': IMAGES['stiff-leg-deadlift'],
  'sumo-deadlift': IMAGES['sumo-deadlift'],
  'hip-thrust': IMAGES['hip-thrust'],
  'bb-walking-lunge': IMAGES['bb-walking-lunge'],
  'goblet-squat': IMAGES['goblet-squat'],
  'bulgarian-split-squat': IMAGES['bulgarian-split-squat'],
  'rev-lunge': IMAGES['rev-lunge'],
  'db-rdl': IMAGES['db-rdl'],
  'single-leg-rdl': IMAGES['db-rdl'],
  'db-stepups': IMAGES['db-stepups'],
  'leg-press': IMAGES['bb-squat'],
  'hack-squat': IMAGES['bb-squat'],
  'belt-squat': IMAGES['bb-squat'],
  'v-squat-machine': IMAGES['bb-squat'],
  'smith-squat': IMAGES['bb-squat'],
  'machine-hip-thrust': IMAGES['hip-thrust'],
  'leg-extensions': IMAGES['goblet-squat'],
  'lying-leg-curls': IMAGES['rdl'],
  'seated-leg-curls': IMAGES['rdl'],
  'standing-calf-raises': IMAGES['db-stepups'],
  'seated-calf-raises': IMAGES['db-stepups'],
  'calf-press-legpress': IMAGES['bb-squat'],
  'adductor-machine': IMAGES['sumo-deadlift'],
  'lunges': IMAGES['bb-walking-lunge'],
  'glute-bridge': IMAGES['hip-thrust'],

  // Abs & Core (Stand-ins until generation resumes)
  'cable-crunch': IMAGES['cable-pullover'],
  'cable-woodchop': IMAGES['cable-lateral-raise'],
  'cable-oblique-crunch': IMAGES['cable-lateral-raise'],
  'machine-ab-crunch': IMAGES['chest-press-machine'],
  'ab-crunch': IMAGES['push-ups'],
  'reverse-crunch': IMAGES['push-ups'],
  'bicycle-crunches': IMAGES['push-ups'],
  'russian-twist': IMAGES['goblet-squat'],
  'plank': IMAGES['push-ups'],
  'dead-bug': IMAGES['push-ups'],
  'lying-leg-raises': IMAGES['push-ups'],
  'hanging-knee-raise': IMAGES['pull-ups'],
  'ab-wheel': IMAGES['push-ups'],
};

export function getExerciseIllustration(exerciseId: string): ImageSourcePropType | null {
  return EXERCISE_IMAGES[exerciseId] || null;
}
