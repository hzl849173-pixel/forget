import AsyncStorage from '@react-native-async-storage/async-storage';

export type FitnessGoal =
    | 'Lean & Aesthetic'
    | 'Strong & Powerful'
    | 'Slim & Toned'
    | 'Improve Overall Health';

export interface OnboardingProfile {
    name: string;
    heightCm: number;
    weightKg: number;
    goal: FitnessGoal;
    updatedAt: string;
}

const KEYS = {
    ONBOARDING_COMPLETED: '@workout_journal_onboarding_completed_v1',
    SIGNED_IN: '@workout_journal_user_signed_in_v1',
    NAME: '@workout_journal_profile_name_v1',
    HEIGHT_CM: '@workout_journal_profile_height_cm_v1',
    WEIGHT_KG: '@workout_journal_profile_weight_kg_v1',
    GOAL: '@workout_journal_profile_goal_v1',
};

export async function setOnboardingCompleted() {
    await AsyncStorage.setItem(KEYS.ONBOARDING_COMPLETED, 'true');
}

export async function isOnboardingCompleted() {
    const val = await AsyncStorage.getItem(KEYS.ONBOARDING_COMPLETED);
    return val === 'true';
}

export async function setSignedIn() {
    await AsyncStorage.setItem(KEYS.SIGNED_IN, 'true');
}

export async function isSignedInFlag() {
    const val = await AsyncStorage.getItem(KEYS.SIGNED_IN);
    return val === 'true';
}

export async function saveLocalProfile(profile: Omit<OnboardingProfile, 'updatedAt'>) {
    await AsyncStorage.multiSet([
        [KEYS.NAME, profile.name],
        [KEYS.HEIGHT_CM, String(profile.heightCm)],
        [KEYS.WEIGHT_KG, String(profile.weightKg)],
        [KEYS.GOAL, profile.goal],
    ]);
}

export async function loadLocalProfile(): Promise<OnboardingProfile | null> {
    const [n, h, w, g] = await Promise.all([
        AsyncStorage.getItem(KEYS.NAME),
        AsyncStorage.getItem(KEYS.HEIGHT_CM),
        AsyncStorage.getItem(KEYS.WEIGHT_KG),
        AsyncStorage.getItem(KEYS.GOAL),
    ]);

    if (n === null && h === null && w === null && g === null) return null;

    const heightCm = h ? Number(h) : 0;
    const weightKg = w ? Number(w) : 0;

    return {
        name: n || '',
        heightCm: Number.isFinite(heightCm) ? heightCm : 0,
        weightKg: Number.isFinite(weightKg) ? weightKg : 0,
        goal: (g || '') as FitnessGoal,
        updatedAt: new Date().toISOString(),
    };
}

// Firestore sync helpers (implemented in auth layer but we keep the local shape here)
export async function upsertProfileFirestoreShape(
    profile: OnboardingProfile
): Promise<Record<string, any>> {
    return {
        name: profile.name,
        heightCm: profile.heightCm,
        weightKg: profile.weightKg,
        goal: profile.goal,
        updatedAt: profile.updatedAt,
    };
}

export async function setSignedOut() {
    await AsyncStorage.setItem(KEYS.SIGNED_IN, 'false');
}
