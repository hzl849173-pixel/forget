# Exercise Image Generation Guide & Phase 2 Specification

## 1. Project Overview & Context
This project is **Workout Journal**, a minimalist, premium workout logging app built with Expo / React Native.
In the exercise picker sheet, each exercise row features a compact thumbnail illustration (`48x48 dp`, rounded `10dp`, background `#F1F2F4`) positioned between the category color accent line and the exercise name.

---

## 2. Visual Style & Art Direction

Every generated image **must** strictly match the established art direction:

1. **Subject / Figure**:
   - Athletic male anatomical mannequin figure.
   - Monochrome silver/light-gray skin tone.
   - Neutral anatomy, no hair, no facial expression, no clothes.
2. **Muscle Activation (Crucial)**:
   - The primary target muscle(s) **must be highlighted in glowing vibrant red-orange** (`#FF4500` / `#FF5722`), showing clear muscle fiber striations.
   - Secondary / passive muscles remain in neutral silver-gray.
3. **Equipment & High-Contrast Framing (Critical)**:
   - Realistic gym equipment featuring **bold matte black frames, black weight stacks, and dark charcoal accents** with chrome/silver hardware.
   - **Avoid all-gray equipment**: Especially for cable machines and towers, do **not** render the entire frame in silver/gray. Use matte black upright columns, black pulleys, and dark weight stacks so the equipment creates strong, crisp contrast against both the light-gray mannequin and the soft gray background.
4. **Background & Lighting**:
   - **Soft studio light-gray ambient gradient** (center `~#F6F6F6` down to edges/corners `~#F1F1F1` / `RGB ~241, 241, 241`).
   - Clean, soft ground contact shadow underneath the equipment/figure.
   - **NOT** stark flat pure `#FFFFFF` white, and **NOT** dark/moody.
5. **Composition & Camera**:
   - Aspect ratio: `1:1` square.
   - 3/4 isometric perspective that clearly displays both the equipment setup and the highlighted muscle group.

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

### Priority 2: Next Muscle Groups
Once Chest is finalized, generate images for the other major categories in [`constants/exercises.ts`](file:///c:/Users/Haisal/Documents/workout-journal/constants/exercises.ts):
- **Back** (Pull-ups, Lat Pulldown, Barbell Row, Seated Cable Row, Deadlift, etc.)
- **Shoulders** (Overhead Press, Dumbbell Lateral Raise, Face Pull, Rear Delt Fly, etc.)
- **Biceps & Triceps** (Barbell Curl, Hammer Curl, Tricep Pushdown, Skull Crushers, Dips)
- **Legs** (Squat, Leg Press, Romanian Deadlift, Leg Extension, Hamstring Curl, Calf Raise)
- **Abs** (Plank, Cable Crunch, Hanging Leg Raise, Ab Wheel)

---

## 6. Standard Image Prompt Template

```text
A 3D anatomical fitness illustration of an athletic male figure performing [EXERCISE_NAME] on [EQUIPMENT_NAME], strictly matching clean medical fitness 3D art direction. Clean light-gray athletic mannequin figure with glowing red-orange highlighted [TARGET_MUSCLE] muscles with visible striations. Equipment featuring bold matte black structural frames, black weight stacks, and chrome accents for punchy contrast. Soft studio light-gray ambient gradient background (#F1F1F1 at edges), subtle ground contact shadow, 3/4 isometric perspective, square 1:1, minimalist premium design, no all-gray equipment.
```
