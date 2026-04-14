import { createStore } from 'zustand/vanilla';
import { SessionState } from "@/types";
import profileController from '@/profile/profile';
import DEFAULT_CONFIG from './config';

const initialState: SessionState = {
    profile: {
        ...profileController.getProfile()
    },
    timestamps: [] as number[],
    typing: {
        timeout: 0,
        interval: 0
    },
    edit: {
        length: 0,
        prevLength: undefined,
        effort: 0,
        progress: 0,
        consecutiveEdits: 0,
        signal: 0,
    },
    pause: {
        start: null,
        timeout: undefined,
        interval: undefined,
        intervals: [] as number[],
        awaitedFalsePositive: false,
    },
    fire: {
        hasFired: false
    },
    elapsed: 0,
    terminated: false,
    config: DEFAULT_CONFIG
};

export const sessionStore = createStore<SessionState>(() => initialState);

profileController.subscribe((updatedProfile) => {
    if (updatedProfile) {
        sessionStore.setState({ 
            profile: { ...updatedProfile } 
        });
    }
});