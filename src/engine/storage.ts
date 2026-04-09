import { Config, Profile } from "@/types";
import { destroyCookieProfile, fetchCookieProfile, pushCookieProfile } from "./storage/cookie";
import DEFAULT_CONFIG from "./config";
import { destroyLocalStorageProfile, fetchLocalStorageProfile, pushLocalStorageProfile } from "./storage/localStorage";

const STORAGE_KEY = "typace_profile";

export type ProfileSchema = {
    v: number;
    st: number; // tempo samples
    sp: number; // pause samples
    se: number; // edit samples
    sf: number; // tolerance samples
    tc: number; // tempo mean
    td: number; // tempo deviation
    pc: number; // pause mean
    pd: number; // pause deviation
    er: number; // edit rate
    ft: number; // fire tolerance
    ts: number; // timestamp
};

export const serialiseProfile = (profile: Profile): ProfileSchema => ({
    v: profile.version,
    st: profile.tempoProfile.samples,
    sp: profile.pauseProfile.samples,
    se: profile.editProfile.samples,
    sf: profile.toleranceProfile.samples,
    tc: Math.round(profile.tempoProfile.meanCPS * 100) / 100,
    td: Math.round(profile.tempoProfile.deviation * 100) / 100,
    pc: Math.round(profile.pauseProfile.meanPause),
    pd: Math.round(profile.pauseProfile.deviation),
    er: Math.round(profile.editProfile.editRate * 100) / 100,
    ft: parseInt(profile.toleranceProfile.fireTolerance.toFixed(3)),
    ts: profile.lastUpdated ?? Date.now()
});

export const deserialiseProfile = (cookie: ProfileSchema): Profile => ({
    version: cookie.v,
    tempoProfile: {
        meanCPS: cookie.tc,
        deviation: cookie.td,
        samples: cookie.st,
    },
    pauseProfile: {
        meanPause: cookie.pc,
        deviation: cookie.pd,
        samples: cookie.sp
    },
    editProfile: {
        editRate: cookie.er,
        samples: cookie.se
    },
    toleranceProfile: {
        fireTolerance: cookie.ft,
        samples: cookie.sf
    },
    lastUpdated: cookie.ts
});

export const fetchProfile = async (config: Config): Promise<Profile | null> => {
    if (!config.persistentStorage) {
        destroy();
        return null;
    }

    const localStorageProfile = fetchLocalStorageProfile(STORAGE_KEY);
    const cookieProfile = config.useCookie ? await fetchCookieProfile(STORAGE_KEY) : null;

    // If useCookie is true, prefer cookie, but compare timestamps if both exist
    if (cookieProfile && localStorageProfile) {
        return cookieProfile.lastUpdated > localStorageProfile.lastUpdated 
            ? cookieProfile 
            : localStorageProfile;
    }

    // useCookie is false: only return localStorage data
    return localStorageProfile;
};

/**
 * Save profile to the configured storage mechanism.
 */
export const pushProfile = async (profile: Profile, config: Config): Promise<void> => {
    if (!config.persistentStorage) {
        destroy();
        return;
    }

    if (config.useCookie) {
        destroyLocalStorageProfile(STORAGE_KEY);
        await pushCookieProfile(profile, STORAGE_KEY, config.cookieMaxAgeDays ?? DEFAULT_CONFIG.cookieMaxAgeDays!);
    } else {
        pushLocalStorageProfile(profile, STORAGE_KEY);
    }
};

/**
 * Delete profile from ALL storage mechanisms.
 * @remarks Called when user withdraws consent (persistentStorage toggled OFF).
 */
export const destroy = async (): Promise<void> => {
    await destroyCookieProfile(STORAGE_KEY);
    destroyLocalStorageProfile(STORAGE_KEY);
};