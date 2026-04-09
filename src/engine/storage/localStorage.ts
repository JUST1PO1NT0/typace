import { Profile } from "@/types";
import { deserialiseProfile, serialiseProfile } from "../storage";

/**
 * Fetch profile from localStorage
 */
export const fetchLocalStorageProfile = (STORAGE_KEY: string): Profile | null => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) return null;
        return deserialiseProfile(JSON.parse(data));
    } catch {
        return null;
    }
};

/**
 * Save profile to localStorage
 */
export const pushLocalStorageProfile = (profile: Profile, STORAGE_KEY: string): void => {
    const serialised = JSON.stringify(serialiseProfile(profile));
    localStorage.setItem(STORAGE_KEY, serialised);
};

/**
 * Delete profile from localStorage (GDPR consent withdrawal)
 */
export const destroyLocalStorageProfile = (STORAGE_KEY: string): void => {
    localStorage.removeItem(STORAGE_KEY);
};