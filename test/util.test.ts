import {
    EMA,
    meanAvg,
    variance,
    stdDev,
    getAlpha,
    getIntervals,
    getEditWeight,
} from '@/engine/util'
import {
    test,
    expect,
    describe
} from "@jest/globals";

describe('Utility Functions', () => {
    describe('EMA (Exponential Moving Average)', () => {
        test('should converge to new value over time', () => {
            let avg = 100;
            const targetValue = 50;

            for (let i = 1; i <= 100; i++) {
                avg = EMA(avg, targetValue, i);
            }

            expect(avg).toBeCloseTo(targetValue, 0);
        });

        test('should handle random values correctly', () => {
            const randomValues = Array.from({
                length: 50
            }, () => Math.random() * 100);
            let avg = randomValues[0];

            for (let i = 1; i < randomValues.length; i++) {
                avg = EMA(avg, randomValues[i], i);
            }

            // EMA should be between min and max
            expect(avg).toBeGreaterThanOrEqual(Math.min(...randomValues));
            expect(avg).toBeLessThanOrEqual(Math.max(...randomValues));
        });
    });

    describe('getAlpha', () => {
        test('should increase with more samples', () => {
            const alpha1 = getAlpha(1);
            const alpha100 = getAlpha(100);
            expect(alpha100).toBeGreaterThan(alpha1);
        });

        test('should stay within bounds', () => {
            for (let n = 1; n <= 1000; n++) {
                const alpha = getAlpha(n);
                expect(alpha).toBeGreaterThanOrEqual(0.04);
                expect(alpha).toBeLessThanOrEqual(0.135);
            }
        });
    });

    describe('getIntervals', () => {
        test('should calculate correct intervals', () => {
            const timestamps = [1000, 1100, 1250, 1400];
            const intervals = getIntervals(timestamps);
            expect(intervals).toEqual([100, 150, 150]);
        });

        test('should return empty array for insufficient data', () => {
            expect(getIntervals([1000])).toEqual([]);
            expect(getIntervals([])).toEqual([]);
        });
    });

    describe('statistical functions with random data', () => {
        test('variance and stdDev should be consistent', () => {
            const randomData = Array.from({length: 100}, () => Math.random() * 100);
            const mean = meanAvg(randomData);

            // population
            const var_pop = variance(randomData, mean, false);
            const dev_pop = stdDev(randomData, mean, false);
            expect(Math.abs(dev_pop * dev_pop - var_pop)).toBeLessThan(1e-8);

            // sample
            const var_sample = variance(randomData, mean, true);
            const dev_sample = stdDev(randomData, mean, true);
            expect(Math.abs(dev_sample * dev_sample - var_sample)).toBeLessThan(1e-8);

            // Sample variance should be greater than population variance
            expect(var_sample).toBeGreaterThan(var_pop);
        });

        test('should handle edge cases', () => {
            expect(variance([1])).toBe(0);
            expect(stdDev([5, 5, 5, 5])).toBe(0);
        });
    });

    describe('getEditWeight', () => {
        test('should decrease with consecutive edits', () => {
            const weight1 = getEditWeight(5, 1);
            const weight10 = getEditWeight(5, 10);
            expect(weight10).toBeLessThan(weight1);
        });

        test('should handle edge cases', () => {
            expect(getEditWeight(0, 5)).toBe(1); // Fallback
            expect(getEditWeight(5, 0)).toBe(1);
        });
    });
});