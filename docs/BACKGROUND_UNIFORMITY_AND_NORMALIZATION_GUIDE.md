# Background Uniformity & Deblooming Guide for AI Agents

## 1. Overview & Golden Reference Standard

In **Workout Journal**, exercise thumbnails appear in the bottom picker sheet inside a `48x48 dp` rounded container (`#F1F1F1`, border `rgba(0,0,0,0.06)` or `rgba(255,255,255,0.12)` in dark mode).

### The Golden Benchmark: `assets/exercises/bb-incline-press.jpg`
* **Target Studio Background**: Flat, uniform, diffuse studio gray **`RGB 241, 241, 241`** (`#F1F1F1`).
* **Luminance Range**: Background pixels everywhere on the canvas remain locked between **240.5 and 242.5**.
* **Zero Seams**: Because the image background is `241, 241, 241` and the container in [`app/index.tsx`](file:///c:/Users/Haisal/Documents/workout-journal/app/index.tsx) is `backgroundColor: '#F1F1F1'`, the illustration blends seamlessly into the card with no visible bounding box.

---

## 2. The Two Issues Discovered & Diagnosed

When auditing exercise assets across the library, two major AI generation discrepancies were identified:

### Issue A: Background Baseline Shifts (Too Dark or Too White)
* **Dark Deviation**: Recent Bicep renders (`rev-bb-curl`, `rev-ez-bar-curl`, `incline-hammer-curl`, `spider-curl-bb`, `cable-reverse-curl`) had background luminance at **228–233** (`#E4E4E4` to `#E9E9E9`). This caused them to appear as dark gray boxes inside the UI card.
* **White Deviation**: Earlier Bicep renders (`db-preacher-curl`, `ez-bar-preacher-curl`, `bb-curl`, `db-bicep-curl`, `spider-curl`) had background luminance at **249–251** (`#FAFAFA` near-white), making them look washed out and inconsistent with chest exercises.

### Issue B: White Spotlight Halo / Bloom Behind Figures
* In many exercises (e.g. `rope-pushdown`, `single-arm-pushdown`, `dual-cable-bicep-curl`, `cable-vbar-pushdown`, `chest-dip-machine`), the image model placed an artificial **radial spotlight / bright halo** behind the lifter.
* **Measurements**: Over 25,000 to 45,000 pixels (30%–50% of the entire 300x300 image) were blown out to pure white (`#FFFFFF`, luminance $\ge 248$), creating an unsightly circular glow.

---

## 3. What Was Done: The Zero-Distortion Mathematical Solution

Rather than re-generating images (which would consume quota and risk changing anatomical poses), we engineered a **non-destructive, pixel-level post-processing algorithm** using GDI+ / `System.Drawing.Bitmap.LockBits`.

### Core Technical Pillars:

#### 1. Robust Corner Patch Sampling
* Instead of sampling image edges (which might accidentally hit tall cable towers or Smith machine vertical bars), the script samples two $15 \times 15$ pixel corner patches:
  * Top-Left: $x \in [2..16], y \in [2..16]$
  * Top-Right: $x \in [w-17..w-3], y \in [2..16]$
* Samples are filtered: only pixels with $sat \le 4$ and $lum \ge 215$ are accepted to guarantee zero floor or figure shadow interference.
* This measures the image's true unshaded studio backdrop level $B$.

#### 2. Color Saturation Immunity Shield (Protects Neon Muscles)
* Neon red-orange muscles have intense color divergence: $R \approx 255, G \approx 69, B \approx 0 \implies |R - G| > 150$.
* Saturation divergence is defined as: $sat = \max(R, G, B) - \min(R, G, B)$.
* Any pixel with $sat > 10$ is completely bypassed ($w_{color} = 0$).
* For $sat \le 10$, a cosine ease is applied: $w_{color} = \cos((sat / 10) \cdot (\pi / 2))$.
* **Result**: Neon muscle striations receive **0% modification** and remain 100% pixel-perfect.

#### 3. Midtone & Shadow Protection (Protects Mannequin & Equipment)
* Mannequin skin tones sit at $L \in [120..200]$.
* Dumbbells, barbells, cable towers, and weight plates sit at $L \in [30..180]$.
* The threshold ensures any pixel with $lum \le 215$ receives **0% modification**.

#### 4. Smooth Hermite Cubic Ease Transition
* At the figure's edge highlight rim, a Hermite cubic curve $t^2 (3 - 2t)$ blends the adjustment smoothly into the background, preventing halos, edge fringes, or posterization banding.

#### 5. Background Hotspot Tone Compression (Deblooming)
* For pixels with $lum > 241.5$ and neutral saturation, the blown-out white range $[241.5, 255.0]$ is smoothly compressed into $[241.0, 242.5]$:
  $$targetL = 241.0 + \left(\frac{lum - 241.5}{255.0 - 241.5}\right) \times 1.5$$
* This completely flattens the radial halo into matte studio gray `#F1F1F1`.

---

## 4. UI Alignment in React Native

In [`app/index.tsx`](file:///c:/Users/Haisal/Documents/workout-journal/app/index.tsx#L5039):
```tsx
styles.modalExerciseThumbContainer,
{
  backgroundColor: '#F1F1F1', // Aligned from #F1F2F4 to exact RGB 241
  borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.06)',
}
```

---

## 5. Scripts in the Repository for Future AI Agents

Whenever a future AI agent generates new exercise illustrations (e.g., Shoulders, Back, Legs, Abs), they **MUST** run this post-processing pipeline after initial compression:

### 1. General Debloomer: `scripts/debloom-all-exercises.ps1`
Runs across `assets/exercises/*.jpg`, scans for any blown-out white pixels ($lum > 241.5$), and compresses them into $[241.0, 242.5]$ without altering figures or muscles.
```powershell
powershell -ExecutionPolicy Bypass -File scripts/debloom-all-exercises.ps1
```

### 2. Specific Baseline Calibrator: `scripts/normalize-biceps.ps1`
Calibrates images whose overall background plane is shifted too dark or too bright towards target `241.0`.
```powershell
powershell -ExecutionPolicy Bypass -File scripts/normalize-biceps.ps1
```

---

## 6. Checklist for Future Generation Runs (Shoulders, Back, Legs)

1. **Generate Raw Render**: 1:1 aspect ratio, athletic silver-gray mannequin, glowing neon red-orange (`#FF4500`) target muscle striations, diffuse `#F4F4F4` studio ambient.
2. **Compress**: Run `scripts/compress-exercise-image.ps1` to produce `300x300` px JPEG at 88% quality (~10–12 KB).
3. **Normalize & Debloom**: Run `scripts/debloom-all-exercises.ps1` to ensure background pixels are strictly locked to `RGB 241, 241, 241` with zero white spotlights.
4. **Register**: Add the asset to `IMAGES` and `EXERCISE_IMAGES` in [`constants/exerciseImages.ts`](file:///c:/Users/Haisal/Documents/workout-journal/constants/exerciseImages.ts).
5. **Verify**: Run `npx tsc --noEmit` to confirm zero type errors.
