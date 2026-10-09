# Exercise Image Generation Guide & Phase 2 Specification

## 1. Project Overview & Context
This project is **Workout Journal**, a minimalist, premium workout logging app built with Expo / React Native.
In the exercise picker sheet, each exercise row features a compact thumbnail illustration (`48x48 dp`, rounded `10dp`, background `#F1F2F4`) positioned between the category color accent line and the exercise name.

---

## 2. Visual Style & Strict Uniformity Benchmarks

Every generated image **must** strictly match the established visual benchmarks:

1. **Background & Lighting (Gold Standard: `ez-bar-skull-crusher.jpg`)**:
   - **Uniform, flat, seamless soft light-gray studio backdrop** (`~#F2F2F2` to `#F4F4F4`, `RGB ~242, 242, 242`).
   - Pure, diffuse ambient studio illumination across the entire canvas.
   - Clean, subtle ground contact shadow directly under the equipment and figure.
   - **STRICT ANTI-PATTERN (Fix `single-arm-pushdown.jpg`)**:
     - **NO** radial spotlight, **NO** bright circular halo behind the mannequin, **NO** vignette, and **NO** dark shaded corners. The backdrop must remain completely uniform and flat.

2. **Equipment & Material Contrast (Gold Standard: `smith-incline-press.jpg`)**:
   - Harmonious, balanced shades: matte aluminum / light-to-medium steel gray frames, brushed silver hardware/bars, dark graphite/charcoal accents, and dark gray weight plates/padding.
   - **STRICT ANTI-PATTERN (Fix `cable-crossover.jpg`)**:
     - **NO** stark pitch-black / jet-black monolithic frames. Black must **not** overpower or dominate the scene. The contrast must remain subtle and balanced so the anatomical mannequin and glowing muscles remain the primary visual focus.

3. **Subject / Figure**:
   - Athletic male anatomical mannequin figure.
   - Monochrome silver/light-gray skin tone.
   - Neutral anatomy, no hair, no facial expression, no clothes.

4. **Muscle Activation (Crucial)**:
   - The primary target muscle(s) **must be highlighted in glowing vibrant neon red-orange** (`#FF4500` / `#FF5722`), showing clear muscle fiber striations.
   - Secondary / passive muscles remain in neutral silver-gray.

5. **Composition & Camera**:
   - Aspect ratio: `1:1` square (300 × 300 px target).
   - 3/4 isometric perspective, centered, consistent camera distance (~75–80% frame fill).


---

## 3. Technical Constraints & Performance Rules

- **Format**: JPEG (or WebP).
- **Resolution**: 300 × 300 pixels.
- **File Size Target**: **~10 KB to 20 KB** per image (maximum 50 KB).
  - *Why*: Users scroll long lists of exercises; keeping images tiny ensures 60/120 FPS scrolling with zero lag or frame drops.
- **Destination Folder**: `assets/exercises/<exercise-id>.jpg`
- **Compression Tool**:
  The project includes a PowerShell script to automatically resize and compress high-res renders:
  ```powershell
  powershell -ExecutionPolicy Bypass -File scripts/compress-exercise-image.ps1 -SourcePath "<path_to_raw_image>" -DestName "<exercise-id>"
  ```

---

## 4. Current State (Phase 1 Completed)

### Architecture
- **UI Component**: [`app/index.tsx`](file:///c:/Users/Haisal/Documents/workout-journal/app/index.tsx) renders the thumbnail with `expo-image` (`contentFit="contain"`, `cachePolicy="memory-disk"`).
- **Image Mapping**: [`constants/exerciseImages.ts`](file:///c:/Users/Haisal/Documents/workout-journal/constants/exerciseImages.ts) maps exercise IDs to local `require('../assets/exercises/<id>.jpg')` assets via `getExerciseIllustration(exerciseId)`.

### Images Already Live (13 Chest Renders in `assets/exercises/`):
- `bb-bench-press.jpg` (Flat Barbell Bench Press)
- `bb-incline-press.jpg` (Incline Barbell Bench Press)
- `bb-decline-press.jpg` (Decline Barbell Press)
- `landmine-press.jpg` (Landmine Angled Barbell Press)
- `db-bench-press.jpg` (Flat Dumbbell Press)
- `db-incline-press.jpg` (Incline Dumbbell Press)
- `db-decline-press.jpg` (Decline Dumbbell Press)
- `db-flyes.jpg` (Flat Dumbbell Flyes)
- `db-incline-flyes.jpg` (Incline Dumbbell Flyes)
- `db-pullover.jpg` (Dumbbell Pullover)
- `cable-crossover.jpg` (Mid Cable Crossover)
- `smith-incline-press.jpg` (Smith Machine Incline Press)
- `pec-deck.jpg` (Pec Deck Fly)

---

## 5. Phase 2 Task List for the New AI Agent

### Priority 1: Finish Remaining Chest Movements (Replace temporary mappings)
These exercises currently share stand-in images and need their own dedicated renders:

1. **`push-ups`**:
   - Athletic mannequin in a plank push-up position on the floor, pressing up, chest highlighted in glowing red-orange.
2. **`incline-pushup`**:
   - Hands elevated on a flat gym bench, feet on the floor, pressing up.
3. **`decline-pushup`**:
   - Feet elevated on a bench, hands on the floor in a decline push-up position.
4. **`chest-dips`**:
   - Mannequin suspended between parallel dip bars, leaning torso slightly forward to target lower chest, chest highlighted.
5. **`high-to-low-cable`**:
   - Dual cable towers with pulleys at the TOP; arms sweeping downward and forward towards hips.
6. **`low-to-high-cable`**:
   - Dual cable towers with pulleys near the FLOOR; arms scooping upward and forward towards upper chest.
7. **`chest-press-machine`**:
   - Seated upright in a chest press machine, pressing handles forward horizontally.
8. **`incline-machine-chest-press`**:
   - Seated in an incline chest press machine, pressing handles upward at a 45-degree angle.
9. **`hammer-strength-press`**:
   - Seated in a plate-loaded iso-lateral Hammer Strength press machine.
10. **`smith-bench-press`**:
    - Lying on a flat bench inside a vertical Smith machine, pressing the guided barbell.
11. **`chest-dip-machine`**:
    - Seated or kneeling on an assisted dip machine, pressing down on dip bars.

### Phase 1 Completed: Chest (All Core Variations Live)
- All primary Barbell, Dumbbell, Cable, Machine, and Bodyweight chest exercises generated, compressed (~9–15 KB), and mapped in [`constants/exerciseImages.ts`](file:///c:/Users/Haisal/Documents/workout-journal/constants/exerciseImages.ts).

### Phase 2 Completed: Triceps (100% Exact Distinct Movements Live)
Every triceps exercise now has its distinct, exact biomechanical movement and equipment render:
1. `rope-pushdown.jpg` (Cable rope attachment flared at bottom)
2. `straight-bar-pushdown.jpg` (Overhand pronated cable straight bar)
3. `cable-vbar-pushdown.jpg` (Angled V-bar attachment)
4. `single-arm-pushdown.jpg` (Single D-handle unilateral pushdown)
5. `rev-grip-pushdown.jpg` (Underhand supinated grip palms up)
6. `skull-crushers.jpg` (Flat bench straight barbell skull crusher)
7. `ez-bar-skull-crusher.jpg` (Flat bench wavy zig-zag EZ-bar)
8. `db-skull-crushers.jpg` (Flat bench two independent dumbbells neutral grip)
9. `overhead-db-extension.jpg` (Seated single dumbbell overhead extension)
10. `two-arm-db-overhead-ext.jpg` (Seated, both hands cupped under top plate of single dumbbell overhead)
11. `bb-overhead-ext.jpg` (Seated straight barbell overhead extension)
12. `ez-bar-french-press.jpg` (Seated wavy EZ-bar overhead extension)
13. `close-grip-bench.jpg` (Barbell close-grip flat bench press)
14. `bench-dips.jpg` (Bodyweight dips off flat gym bench)
15. `weighted-dips.jpg` (Parallel dip bars with weight plate suspended on dip belt)
16. `db-kickbacks.jpg` (Bent-over dumbbell tricep kickback)
17. `cable-kickback.jpg` (Low-pulley single cable tricep kickback)
18. `cable-overhead-ext.jpg` (High cable forward overhead extension)
19. `cable-rope-overhead.jpg` (Split-stance forward overhead cable rope extension)
20. `diamond-pushups.jpg` (Floor push-up with index fingers and thumbs touching in diamond)
21. `close-grip-pushups.jpg` (Floor push-up with hands shoulder-width and elbows pinned to ribcage)
22. `tricep-dip-machine.jpg` (Seated selectorized dip machine)

---

## 5. Phase 3: Biceps Queue (Active)
Exact movement requirements for each bicep exercise:
1. `bb-curl.jpg` **[Completed - 9.2 KB]**: Standing straight barbell curl, underhand supinated grip, biceps glowing.
2. `ez-bar-curl.jpg` **[Completed - 8.7 KB]**: Standing wavy zig-zag EZ-bar curl, semi-supinated grip, biceps glowing.
3. `db-bicep-curl.jpg` **[Completed - 9.5 KB]**: Standing dumbbell curls, palms fully supinated facing upward at top.
4. `db-hammer-curl.jpg` **[Completed - 9.4 KB]**: Standing neutral hammer grip (palms facing inward towards each other, thumbs up), brachialis and forearms glowing.
5. `incline-db-curl.jpg` **[Completed - 11.8 KB]**: Seated on a 45-degree incline bench, arms hanging straight down back, curling dumbbells with deep stretch.
6. `concentration-curl.jpg` **[Completed - 10.7 KB]**: Seated on flat bench, elbow braced firmly against inner thigh, single dumbbell curling towards face.
7. `spider-curl.jpg` **[Completed - 11.8 KB]**: Mannequin lying prone chest-down on an incline bench, arms hanging vertically downward, curling dumbbells without elbow sway.
8. `ez-bar-preacher-curl.jpg` **[Completed - 13.4 KB]**: Seated at preacher bench with upper arms braced on pad, curling wavy EZ-bar.
9. `db-preacher-curl.jpg` **[Completed - 11.9 KB]**: Seated at a 45-degree preacher bench with upper arm flat against slanted pad, curling single dumbbell.
10. `cable-bicep-curl.jpg` **[Completed - 11.9 KB]**: Standing facing low pulley cable tower with straight bar attachment, curling upwards.
11. `dual-cable-bicep-curl.jpg` **[Completed - 15.4 KB]**: Standing between dual high cable towers, front-double-biceps contraction pose.
12. `crossbody-hammer.jpg` **[Completed - 8.9 KB]**: Standing neutral hammer grip curling diagonally across chest towards opposite collarbone.
13. `cable-rope-curl.jpg` **[Completed - 11.6 KB]**: Standing low cable with rope attachment, neutral hammer grip curling upward.
14. `bayesian-cable-curl.jpg` **[Completed - 9.8 KB]**: Standing facing away from low cable tower, arm extended behind torso, curling forward.
15. `machine-preacher-curl.jpg` **[Completed - 11.9 KB]**: Seated at selectorized preacher curl machine, arms on pad, curling machine handles.
16. `spider-curl-bb`: Prone chest-down on incline bench, curling straight barbell vertically downward.
17. `incline-hammer-curl`: Seated on 45-degree incline bench, neutral hammer grip curling dumbbells.
18. `rev-db-curl`: Standing neutral/overhand pronated reverse dumbbell curl (forearms glowing).
19. `rev-bb-curl`: Standing overhand pronated reverse straight barbell curl.
20. `rev-ez-bar-curl`: Standing overhand pronated reverse wavy EZ-bar curl.
21. `cable-reverse-curl`: Standing low cable straight bar with overhand pronated grip.


---

## 6. Standard Image Prompt Template

```text
Minimalist 3D fitness exercise illustration of [EXERCISE_NAME]. An athletic male anatomical mannequin figure with a smooth silver-gray monochrome skin tone is [PRECISE_POSTURE_AND_EQUIPMENT]. [EXACT_GRIP_AND_BIOMECHANICS]. Target [TARGET_MUSCLE] muscles highlighted in vibrant glowing neon red-orange (#FF4500) with visible muscle striations. Gym equipment rendered in balanced matte aluminum, brushed steel, and dark graphite charcoal tones (no solid jet-black monoliths). Uniform diffuse light-gray studio background (#F4F4F4), no spotlight, no radial halo, no vignette, subtle floor contact shadow, clean 3/4 isometric perspective, 1:1 square framing. Faceless, hairless, clothes-free, premium modern aesthetic.
```

### Negative Prompt Directives (Crucial to Enforce Uniformity)
* **Lighting/Background**: `spotlight, radial vignette, circular halo, dark corners, moody lighting, colored background, dramatic lighting, lens flare`.
* **Equipment**: `solid jet black silhouette, heavy black block, pitch black monolith, overpowering high contrast black frame`.


