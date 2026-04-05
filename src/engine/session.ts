import ProfileController from "@/profile/profile";
import { getTypingTimeout, shouldCountAsTyping } from "./analyse";
import { updateLocalTempoProfile } from "@/profile/update";
import { truncateOldTimestamps } from "./util";
import { DeepReadonly, SessionState } from "@/types";

const CYCLE_DURATION_MS = 5;
const HISTORY_LIMIT_MS = 2000;

let state: DeepReadonly<SessionState> = {
  profile: { ...ProfileController.getInstance().getProfile() },
  timestamps: [] as number[],
  typingTimeout: 0,
};

let intervalId: NodeJS.Timeout | null = null;

/**
 * Facilitates atomic mutations to prevent overwriting data between event-driven and time-driven flows
 * @param updater function with previous value of `state`
 */
const mutate = (updater: (curr: typeof state) => Partial<typeof state>) => {
    state = {...state, ...updater(state)};
}

const startSession = () => {
  if (!intervalId) {
    intervalId = setInterval(processTick, CYCLE_DURATION_MS);
  }
};

const stopSession = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
};

const cleanTimestamps = (timestamps: number[], now: number) => {
  return truncateOldTimestamps(timestamps, HISTORY_LIMIT_MS, now);
};

const processTick = () => {
  const now = Date.now()
  mutate((curr) => {
    return {
      timestamps: cleanTimestamps([...curr.timestamps], now)
    }
  })
  // function calls...
};


const addEvent = (value: string, inputType: string, isComposing: boolean, timestamp: number = Date.now()) => {
    if (!intervalId) startSession();

    const isTyping = shouldCountAsTyping(inputType, isComposing);
    const updatedTimestamps = isTyping 
        ? [...state.timestamps, timestamp] 
        : [...state.timestamps];
    
    const { tempoProfile, samples } = updateLocalTempoProfile(
        state.profile.tempoProfile,
        state.profile.samples,
        updatedTimestamps
    );

    mutate((curr) => {
        return {
            timestamps: updatedTimestamps,
            profile: { ...curr.profile, tempoProfile, samples: {...curr.profile.samples, tempo: samples.tempo} },
            typingTimeout: getTypingTimeout(tempoProfile.meanCPS, tempoProfile.deviation, Date.now())
        }
    })
};

export default {
  addEvent,
  stopSession
};