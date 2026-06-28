# Technology Stack

## Framework

- Expo SDK 54
- React Native
- TypeScript

---

## Navigation

- Expo Router

Do not replace Expo Router unless explicitly instructed.

---

## Backend

- Firebase

Use:

- Authentication
- Firestore
- Storage (only if needed)

---

## Authentication

Google Sign-In using Firebase Authentication.

---

## Database

Cloud Firestore.

Design collections for scalability.

Avoid unnecessary reads.

---

## State Management

Prefer React Context.

Only introduce Zustand if the application grows large enough to justify it.

Do not introduce Redux.

---

## Styling

Use NativeWind (Tailwind for React Native).

Avoid inline styles unless necessary.

Reuse style components.

---

## Icons

Use Lucide React Native.

Avoid mixing multiple icon libraries.

---

## Animations

Use React Native Reanimated when needed.

Keep animations subtle.

---

## Forms

Use React Hook Form when forms become complex.

---

## Validation

Use Zod.

---

## Dates

Use date-fns.

Avoid Moment.js.

---

## Image Handling

Use Expo Image.

---

## Storage

Use AsyncStorage only for local preferences.

Use Firestore for user workout data.

---

## Package Philosophy

Before adding a dependency:

Ask:

- Is it necessary?
- Is Expo already providing this feature?
- Can existing libraries solve it?

Avoid dependency bloat.