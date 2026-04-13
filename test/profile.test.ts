import profileController from '@/profile/profile';
import { fetchProfile, pushProfile } from '@/engine/storage';
import type { Profile } from '@/types'

import {
    test,
    expect,
    describe,
    jest,
    beforeEach
} from "@jest/globals";
import { DEFAULT_PROFILE } from '@/profile/default';

jest.mock('@/engine/storage', () => ({
    fetchProfile: jest.fn(),
    pushProfile: jest.fn(),
    destroy: jest.fn()
}));

const mockFetchProfile = fetchProfile as jest.MockedFunction<typeof fetchProfile>;

describe('ProfileController', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (profileController as any).isInitialised = false;
        (profileController as any).profile = { ...DEFAULT_PROFILE };
    });

    test('initialises only once', async () => {
        const mockProfile: Profile = DEFAULT_PROFILE;
        mockFetchProfile.mockResolvedValue(mockProfile);
        
        const config = { persistentStorage: true, useCookie: false };
        
        await profileController.initialise(config);
        await profileController.initialise(config); // Second call should be ignored
        
        expect(fetchProfile).toHaveBeenCalledTimes(1);
    });

    test('subscribes and notifies listeners', () => {
        const listener = jest.fn();
        profileController.subscribe(listener);
        
        profileController.setProfile({ version: 2 } as any);
        
        expect(listener).toHaveBeenCalled();
    });

    test('updates profile and persists to storage', () => {
        const config = { persistentStorage: true, useCookie: false };
        const update = { tempoProfile: { meanCPS: 10, deviation: 0.5, samples: 20 } };
        
        profileController.updateProfile(update, config);
        
        expect(pushProfile).toHaveBeenCalled();
    });
});