import { db } from '@/lib/firebase/firebaseConfig';
import type { FitnessGoal, OnboardingProfile } from '@/lib/profile/profileStorage';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';

export interface UserProfileDocument {
    name: string;
    heightCm: number;
    weightKg: number;
    goal: FitnessGoal;
    updatedAt: any;
}

export async function saveProfileToFirestore(
    uid: string,
    profile: Omit<OnboardingProfile, 'updatedAt'> & { updatedAt?: string }
) {
    const ref = doc(db, 'users', uid);

    const payload = {
        name: profile.name || '',
        heightCm: profile.heightCm,
        weightKg: profile.weightKg,
        goal: profile.goal,
        updatedAt: serverTimestamp(),
    };

    await setDoc(ref, payload, { merge: true });
}

export async function getProfileFromFirestore(uid: string) {
    const ref = doc(db, 'users', uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return snap.data() as UserProfileDocument;
}
