import { DEFAULT_PROFILE } from "@/profile/default";
import { Profile } from "@/types";
import { deserialiseProfile, serialiseProfile } from "../storage";

export type ProfileCookie = {
    v: number;
    st: number; // samples
    sp: number;
    se: number;
    sf: number;
    tc: number; // tempo
    td: number;
    pc: number; // pause
    pd: number;
    er: number; // edit rate
    ft: number; // fire tolerance
    ts: number; // timestamp
};

const getCookie = async (name: string): Promise<string | undefined> => {
    // Using the native global cookieStore
    const cookie = await cookieStore.get({name: name});
    return cookie ? cookie.value : undefined; 
}

const setCookie = async (name: string, value: string, expiresDays: number): Promise<void> => {
    await cookieStore.set({
        name: name, 
        value: value, 
        expires: Date.now() + expiresDays * 24 * 60 * 60 * 1000,
        sameSite: "none"
    });
}

export const fetchCookieProfile = async (COOKIE_NAME: string): Promise<Profile | undefined> => {
    const cookieData: string | undefined = await getCookie(COOKIE_NAME) ?? undefined;
    if(!cookieData) return DEFAULT_PROFILE;
    return deserialiseProfile(JSON.parse(cookieData));
}

export const pushCookieProfile = async (profile: Profile, COOKIE_NAME: string, expiresDays: number): Promise<void> => {
    const pushableData = JSON.stringify(serialiseProfile(profile));
    await setCookie(COOKIE_NAME, pushableData, expiresDays);
}

export const destroyCookieProfile = async (COOKIE_NAME: string) => {
    await cookieStore.delete(COOKIE_NAME);
}