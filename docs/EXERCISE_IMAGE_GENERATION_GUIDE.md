# Exercise Image Generation Guide & Phase 2 Specification

## 1. Project Overview & Context
This project is **Workout Journal**, a minimalist, premium workout logging app built with Expo / React Native.
In the exercise picker sheet, each exercise row features a compact thumbnail illustration (`48x48 dp`, rounded `10dp`, background `#F1F2F4`) positioned between the category color accent line and the exercise name.

---

## 2. Visual Style & Strict Uniformity Benchmarks

Every generated image **must** strictly match the established visual benchmarks:

1. **Background & Lighting (Gold Standard: `bb-incline-press.jpg`)**:
   - **Uniform, flat, seamless soft light-gray studio backdrop** (`~#F2F2F2` to `#F4F4F4`, `RGB ~242, 242, 242`).
   - Pure, diffuse ambient studio illumination across the entire canvas.
   - Clean, subtle ground contact shadow directly under the equipment and figure.
   - **STRICT ANTI-PATTERN (Fix `single-arm-pushdown.jpg`)**:
     - **NO** radial spotlight, **NO** bright circular halo behind the mannequin, **NO** vignette, and **NO** dark shaded corners. The backdrop must remain completely uniform and flat.

2. **Equipment & Material Contrast (Gold Standard: `bb-incline-press.jpg`)**:
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
16. `spider-curl-bb.jpg` **[Completed - 10.1 KB]**: Prone chest-down on incline bench, curling straight barbell vertically downward.
17. `incline-hammer-curl.jpg` **[Completed - 11.2 KB]**: Seated on 45-degree incline bench, neutral hammer grip curling dumbbells.
18. `rev-db-curl.jpg` **[Completed - 7.7 KB]**: Standing neutral/overhand pronated reverse dumbbell curl (forearms glowing).
19. `rev-bb-curl.jpg` **[Completed - 8.5 KB]**: Standing overhand pronated reverse straight barbell curl.
20. `rev-ez-bar-curl.jpg` **[Completed - 8.1 KB]**: Standing overhand pronated reverse wavy EZ-bar curl.
21. `cable-reverse-curl.jpg` **[Completed - 10.8 KB]**: Standing low cable straight bar with overhand pronated grip.

### Phase 3 Completed: Biceps (100% Distinct Variations Live)
- All 21 Biceps movements generated, compressed (7–15 KB), and mapped in `constants/exerciseImages.ts`.

---

## 5. Phase 4 Completed: Shoulders (100% Distinct Variations Live)
Every shoulder movement now has its dedicated biomechanical render, compressed (~7–14 KB), debloomed, and calibrated to exact RGB 241.0:
1. `bb-overhead-press.jpg` [9.1 KB] — Standing Barbell Overhead Press to lockout
2. `seated-bb-shoulder-press.jpg` [11.4 KB] — Seated Barbell Shoulder Press on 90° bench
3. `bb-upright-row.jpg` [9.1 KB] — Straight Barbell Upright Row with high elbows
4. `ez-bar-upright-row.jpg` [8.7 KB] — Wavy EZ-Bar Upright Row
5. `db-shoulder-press.jpg` [10.7 KB] — Seated Dumbbell Overhead Press
6. `arnold-press.jpg` [10.8 KB] — Seated Arnold Press with rotational trajectory
7. `db-lateral-raise.jpg` [8.4 KB] — Symmetrical Bilateral Dumbbell Lateral Raise (T-pose)
8. `leaning-db-lateral-raise.jpg` [9.1 KB] — 30° Leaning Unilateral Dumbbell Lateral Raise
9. `db-front-raise.jpg` [7.5 KB] — Bilateral Dumbbell Front Raise to shoulder height
10. `db-rear-delt-fly.jpg` [8.4 KB] — Bent-Over Dumbbell Reverse Fly with glowing rear deltoids
11. `db-upright-row.jpg` [8.1 KB] — Bilateral Dumbbell Upright Row with high flaring elbows
12. `cable-lateral-raise.jpg` [11.2 KB] — Single-Arm Low Cable Lateral Raise to shoulder height
13. `cable-front-raise.jpg` [9.3 KB] — Low Cable Front Raise with straight bar
14. `cable-rear-delt-fly.jpg` [15.6 KB] — Standing High Cable Cross-Body Rear Delt Fly
15. `cable-upright-row.jpg` [10.8 KB] — Low Cable Straight Bar Upright Row to collarbone
16. `face-pull.jpg` [9.9 KB] — High Cable Rope Face Pull to eye level
17. `machine-shoulder-press.jpg` [12.9 KB] — Seated Selectorized Shoulder Press Machine
18. `smith-shoulder-press.jpg` [14.1 KB] — Seated Smith Machine Overhead Press on vertical rails
19. `machine-lateral-raise.jpg` [12.3 KB] — Seated Machine Lateral Raise pushing elbow pads
20. `reverse-pec-deck.jpg` [11.2 KB] — Seated Reverse Pec Deck Rear Delt Fly
21. `machine-rear-delt-fly.jpg` [12.2 KB] — Dedicated Seated Machine Rear Delt Fly
22. `plate-front-raise.jpg` [7.6 KB] — Standing Olympic Weight Plate Front Raise

---

## 6. Phase 5 Completed: Back (100% Distinct Variations Live)

Every back exercise now has its distinct, exact biomechanical movement and equipment render, compressed (~8–12 KB), debloomed, and calibrated to exact studio gray:
1. `bb-row.jpg` [9.5 KB] — Standing 45° bent-over barbell row, pulling to lower abdomen, lats & upper back glowing.
2. `pendlay-row.jpg` [9.3 KB] — Strict torso parallel to floor, explosive barbell pull from dead stop on floor.
3. `tbar-row.jpg` [10.1 KB] — Straddling landmine/T-bar with V-grip handle, rowing to mid-torso.
4. `deadlift.jpg` [9.7 KB] — Conventional barbell deadlift lockout, entire posterior chain glowing.
5. `trap-bar-deadlift.jpg` [10.3 KB] — Standing inside hexagonal trap bar, neutral grip lift from floor.
6. `rack-pulls.jpg` [12.4 KB] — Barbell starting at knee height in power rack, pulling to lockout, upper back & traps glowing.
7. `bb-shrugs.jpg` [8.6 KB] — Upright barbell shrug, arms straight, traps elevated at peak contraction (shadowless).
8. `db-row.jpg` [9.3 KB] — Single-arm dumbbell row braced on flat bench, pulling to hip (shadowless).
9. `chest-supported-db-row.jpg` [10.3 KB] — Incline bench prone dumbbell row, elbows flared for rhomboids & upper back (shadowless).
10. `db-shrugs.jpg` [7.6 KB] — Standing upright with heavy dumbbells at sides, shrugging shoulders upward (shadowless).
11. `db-back-pullover.jpg` [10.7 KB] — Crossways across flat bench, dumbbell pulled overhead focusing on lats & serratus (shadowless).
12. `cable-row.jpg` [11.4 KB] — Seated cable row with close-grip V-handle, pulling to abdomen (shadowless).
13. `single-arm-cable-row.jpg` [9.7 KB] — Seated single-arm cable row with D-handle to hip crease (shadowless).
14. `lat-pulldown.jpg` [11.3 KB] — Seated lat pulldown station with wide overhand bar to upper chest (shadowless).
15. `underhand-pulldown.jpg` [10.7 KB] — Supinated shoulder-width reverse-grip lat pulldown to upper chest (shadowless).
16. `close-grip-pulldown.jpg` [9.9 KB] — Close-grip triangle V-handle lat pulldown to sternum (shadowless).
17. `neutral-grip-lat-pulldown.jpg` [11.3 KB] — Parallel-grip neutral lat bar pulldown to upper chest (shadowless).
18. `wide-grip-lat-pulldown.jpg` [11.6 KB] — Ultra-wide overhand grip lat pulldown for maximum lat width (shadowless).
19. `single-arm-pulldown.jpg` [11.7 KB] — Seated high cable single-arm pulldown with D-handle to collarbone (shadowless).
20. `straight-arm-pulldown.jpg` [11.5 KB] — Standing facing high cable tower with straight bar sweeping down to thighs (shadowless).
21. `cable-back-pullover.jpg` [12.1 KB] — Lying bench high cable lat pullover in wide arching motion (shadowless).
22. `machine-row.jpg` [11.1 KB] — Seated chest-supported plate-loaded row machine (shadowless).
23. `pull-ups.jpg` [10.7 KB] — Suspended from overhead pull-up bar with overhand grip, chin clearing bar (shadowless).
24. `chin-up-back.jpg` [8.8 KB] — Suspended from pull-up bar with underhand supinated grip, chin clearing bar (shadowless).
25. `inverted-row.jpg` [12.2 KB] — Underneath waist-high barbell in rack, heels on floor, rowing chest to bar (shadowless).

---

## 7. Phase 6: Legs Queue (Active & In Progress)

### Completed Movements (12 Distinct Dedicated Renders Live & Debloomed):
1. `bb-squat.jpg` [10.3 KB] — High bar back squat at parallel depth, quads & glutes glowing.
2. `front-squat.jpg` [16.4 KB] — Barbell front rack position across anterior deltoids, upright torso, quads glowing.
3. `rdl.jpg` [10.2 KB] — Barbell Romanian deadlift hip hinge, hamstrings & glutes glowing.
4. `stiff-leg-deadlift.jpg` [10.1 KB] — Stiff-legged barbell deadlift from floor, high hips, deep hamstring stretch.
5. `sumo-deadlift.jpg` [9.6 KB] — Wide sumo stance barbell deadlift, glutes & adductors glowing.
6. `hip-thrust.jpg` [11.4 KB] — Upper back on bench, barbell across hips at full lockout, glutes glowing.
7. `bb-walking-lunge.jpg` [14.2 KB] — Barbell on back, walking lunge stride, quads & glutes glowing.
8. `goblet-squat.jpg` [8.8 KB] — Holding dumbbell vertically at chest, deep squat, quads & glutes glowing.
9. `bulgarian-split-squat.jpg` [9.9 KB] — Rear foot elevated on bench holding dumbbells, front quad & glute glowing.
10. `rev-lunge.jpg` [8.9 KB] — Dumbbells in hands, stepping back into reverse lunge, glutes & quads glowing.
11. `db-rdl.jpg` [8.1 KB] — Bilateral dumbbell Romanian deadlift hip hinge, hamstrings glowing.
12. `db-stepups.jpg` [9.5 KB] — Stepping up onto plyo box holding dumbbells, working leg glowing.

*Note: Aliases configured in `constants/exerciseImages.ts` for remaining movements until generation queue resumes.*

### Remaining Movements to Generate (When image quota resets):
13. `single-leg-rdl`: Unilateral single-leg dumbbell Romanian deadlift (currently aliased to `db-rdl`).
14. `leg-press`: 45-degree sled leg press sled at bottom inflection (currently aliased to `bb-squat`).
15. `hack-squat`: Hack squat machine sled descending to parallel (currently aliased to `bb-squat`).
16. `belt-squat`: Belt squat platform with weight loaded at hips (currently aliased to `bb-squat`).
17. `v-squat-machine`: V-Squat machine facing in/out (currently aliased to `bb-squat`).
18. `smith-squat`: Smith machine squat with guided vertical barbell (currently aliased to `bb-squat`).
19. `machine-hip-thrust`: Dedicated machine hip thrust with padded lap bar (currently aliased to `hip-thrust`).
20. `leg-extensions`: Seated leg extension machine kicking up to lockout, quadriceps glowing (currently aliased to `goblet-squat`).
21. `lying-leg-curls`: Prone lying leg curl machine curling pad to glutes, hamstrings glowing (currently aliased to `rdl`).
22. `seated-leg-curls`: Seated leg curl machine curling downward under knees (currently aliased to `rdl`).
23. `standing-calf-raises`: Standing calf raise machine on toes, gastrocnemius glowing.
24. `seated-calf-raises`: Seated calf raise machine on knees, soleus glowing.
25. `calf-press-legpress`: Toes on bottom of leg press sled, calf press extension.
26. `adductor-machine`: Seated hip adductor machine squeezing thighs inward (currently aliased to `sumo-deadlift`).
27. `lunges`: Bodyweight stationary lunges (currently aliased to `bb-walking-lunge`).
28. `glute-bridge`: Floor bodyweight glute bridge with hips driven up (currently aliased to `hip-thrust`).

---

## 6. Standard Image Prompt Template

```text
Minimalist 3D fitness exercise illustration of [EXERCISE_NAME]. An athletic male anatomical mannequin figure with a smooth silver-gray monochrome skin tone is [PRECISE_POSTURE_AND_EQUIPMENT]. [EXACT_GRIP_AND_BIOMECHANICS]. Target [TARGET_MUSCLE] muscles highlighted in vibrant glowing neon red-orange (#FF4500) with visible muscle striations. Gym equipment rendered in balanced matte aluminum, brushed steel, and dark graphite charcoal tones (no solid jet-black monoliths). Uniform diffuse light-gray studio background (#F4F4F4), no spotlight, no radial halo, no vignette, subtle floor contact shadow, clean 3/4 isometric perspective, 1:1 square framing. Faceless, hairless, clothes-free, premium modern aesthetic.
```

### Negative Prompt Directives (Crucial to Enforce Uniformity)
* **Lighting/Background**: `spotlight, radial vignette, circular halo, dark corners, moody lighting, colored background, dramatic lighting, lens flare`.
* **Equipment**: `solid jet black silhouette, heavy black block, pitch black monolith, overpowering high contrast black frame`.


