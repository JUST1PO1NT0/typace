import { createSession, getReadiness, Signals, TypingSession } from '@/engine/session';
import ProfileController from '@/profile/profile';
import { Config, useAdaptiveDebounceProps } from '@/types';
import { useRef, useState } from 'react';

export const useAdaptiveDebounce: useAdaptiveDebounceProps = ( onFire, minChars = 1, config: Config ) => {
    const sessionRef = useRef<TypingSession>(null);
    const localProfileRef = useRef(ProfileController.getInstance().getProfile());

    const [readiness, setReadiness] = useState(0);

    const ensureSession = (value: string) => {
        if(!sessionRef.current) {
            sessionRef.current = createSession(value, performance.now());
        }
    }

    const updateReadiness = () => {
        const s = sessionRef.current;
        if(!s) return;

        const now = performance.now();
        const duration = (now - s.startTime) / 1000;

        const signals: Signals = {
            pauseMs: now - s.lastInputTime,
            cps: s.keystrokes / Math.max(duration, 0.2),
            editRatio: s.edits / Math.max(s.keystrokes, 1),
            isComposing: false
        }

        setReadiness(getReadiness(signals, localProfileRef.current))
    }

    const fire = (reason: string) => {
        const s = sessionRef.current;
        if(!s || s.value.length < minChars) return;

        onFire(s.value);
        learnFromSession(s, localProfileRef.current); // IMPLEMENT!

        sessionRef.current = null;
        // POST-FIRE OBSERVATION
    }

    const bind = {
        onInput(e: React.InputEvent<HTMLInputElement>) {
            const now = performance.now();
            const value = e.currentTarget.value;

            ensureSession(value);

            const s = sessionRef.current!
            s.keystrokes++

            const pause = now - s.lastInputTime;
            if(pause > 50) s.pauses.push(pause);

            s.lastInputTime = now;
            s.value = value;

            updateReadiness();
        },

        onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
            if(e.key === 'Backspace' || e.key === 'Delete') {
                if(sessionRef.current) sessionRef.current.edits++;
            }
        },

        onBlur() {
            fire('blur');
        }
    }

    return {
        bind,
        readiness,
        fireNow: () => fire('manual')
    }
}