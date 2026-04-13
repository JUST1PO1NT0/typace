import { 
    updateLocalTempoProfile, updateLocalPauseProfile, 
    updateToleranceProfile, updateEditProfile,
} from '@/profile/update';
import {
    test,
    expect,
    describe
} from "@jest/globals";

describe('Profile Update Functions', () => {
    describe('Tempo Profile Updates', () => {
        test('updates with valid timestamps', () => {
            const tempoProfile = { meanCPS: 4, deviation: 0.5, samples: 10 };
            const timestamps = [1000, 1200, 1450, 1950]; // intervals: 200, 250, 500
            
            const result = updateLocalTempoProfile({...tempoProfile}, timestamps);
            
            expect(result.samples).toBe(11);
            expect(result.meanCPS).not.toBe(tempoProfile.meanCPS);
            expect(result.deviation).not.toBe(tempoProfile.deviation);
        });

        test('returns unchanged profile with insufficient timestamps', () => {
            const tempoProfile = { meanCPS: 4, deviation: 0.5, samples: 10 };
            
            expect(updateLocalTempoProfile(tempoProfile, [1000])).toEqual(tempoProfile);
            expect(updateLocalTempoProfile(tempoProfile, [])).toEqual(tempoProfile);
        });
    });

    describe('Pause Profile Updates', () => {
        test('updates with positive growth', () => {
            const pauseProfile = { meanPause: 500, deviation: 100, samples: 10 };
            const intervals = [450, 520, 480];
            
            const result = updateLocalPauseProfile(pauseProfile, intervals);
            expect(result.samples).toBe(11);
        });

        test('applies default growth when specified', () => {
            const pauseProfile = { meanPause: 500, deviation: 100, samples: 10 };
            
            const positiveGrowth = updateLocalPauseProfile({...pauseProfile}, [], true, true);
            const negativeGrowth = updateLocalPauseProfile({...pauseProfile}, [], true, false);
            
            expect(positiveGrowth.meanPause).toBeGreaterThan(pauseProfile.meanPause);
            expect(negativeGrowth.meanPause).toBeLessThan(pauseProfile.meanPause);
        });
    });

    describe('Tolerance Profile Updates', () => {
        test('decreases tolerance on timeout exceed', () => {
            const toleranceProfile = { fireTolerance: 0.5, samples: 10 };
            const result = updateToleranceProfile(toleranceProfile, true);
            
            expect(result.fireTolerance).toBeLessThan(0.5);
            expect(result.samples).toBe(11);
        });

        test('increases tolerance on successful typing', () => {
            const toleranceProfile = { fireTolerance: 0.5, samples: 10 };
            const result = updateToleranceProfile(toleranceProfile, false);
            
            expect(result.fireTolerance).toBeGreaterThan(0.5);
        });

        test('clamps tolerance to valid range', () => {
            let toleranceProfile = { fireTolerance: 0.01, samples: 1000 };
            let result = updateToleranceProfile(toleranceProfile, false);
            expect(result.fireTolerance).toBeGreaterThanOrEqual(0);
            
            toleranceProfile = { fireTolerance: 0.99, samples: 1000 };
            result = updateToleranceProfile(toleranceProfile, true);
            expect(result.fireTolerance).toBeLessThanOrEqual(1);
        });
    });
    describe('Edit Profile Updates', () => {
        test('calculates edit rate from session progress and effort', () => {
            const editProfile = { editRate: 0.5, samples: 10 };
            const editState = {
                progress: 60,  // characters typed
                effort: 120,   // total keystrokes (including deletions)
                length: 60,
                prevLength: 50,
                consecutiveEdits: 0,
                signal: 0.3
            };

            // Edit rate = 60/120 = 0.5
            const result = updateEditProfile({...editProfile}, editState);

            expect(result.samples).toBe(11);
            // Should maintain similar edit rate (EMA weighted)
            expect(result.editRate).toBeCloseTo(0.5, 1);
        });

        test('handles extreme edit rates smoothly', () => {
            // Very efficient typing (no corrections)
            const efficientState = {
                progress: 100,
                effort: 100,
                length: 100,
                prevLength: 90,
                consecutiveEdits: 0,
                signal: 0.1
            };

            // Very inefficient typing (many corrections)
            const inefficientState = {
                progress: 20,
                effort: 100,
                length: 20,
                prevLength: 15,
                consecutiveEdits: 0,
                signal: 0.8
            };

            const editProfile = { editRate: 0.5, samples: 5 };

            const efficientResult = updateEditProfile({...editProfile}, efficientState);
            const inefficientResult = updateEditProfile({...editProfile}, inefficientState);

            expect(efficientResult.editRate).toBeGreaterThan(inefficientResult.editRate);
        });

        test('EMA smoothing prevents sudden dramatic changes', () => {
            const editProfile = { editRate: 0.5, samples: 100 }; // Well-established profile

            // Extreme change in behavior
            const extremeState = {
                progress: 100,
                effort: 1000,
                length: 100,
                prevLength: 90,
                consecutiveEdits: 0,
                signal: 0
            };

            const result = updateEditProfile({...editProfile}, extremeState);

            // With EMA, should not immediately drop to 0.1
            expect(result.editRate).toBeGreaterThan(0.2);
            expect(result.editRate).toBeLessThan(0.5);
        });

        test('samples count increments correctly', () => {
            const editProfile = { editRate: 0.5, samples: 5 };
            const editState = {
                progress: 50,
                effort: 100,
                length: 50,
                prevLength: 40,
                consecutiveEdits: 0,
                signal: 0.2
            };

            const result = updateEditProfile(editProfile, editState);
            expect(result.samples).toBe(6);

            const result2 = updateEditProfile(result, editState);
            expect(result2.samples).toBe(7);
        });
    });
});