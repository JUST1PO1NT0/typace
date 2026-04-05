import ProfileController from "@/profile/profile";
import { getTypingTimeout, shouldCountAsTyping } from "./analyse";
import { updateLocalTempoProfile } from "@/profile/update";
import { truncateOldTimestamps } from "./util";


class Session {
    private profile = { ...ProfileController.getInstance().getProfile() }
    private timestamps: number[] = [];
    private intervalId: NodeJS.Timeout | null = null;
    private isActive: boolean = false;
    private CYCLE_DURATION = 5; 

    private typingTimeout: number;
    private prevValue: string;

    public addEvent(value: string, inputType: string, isComposing: boolean, timestamp: number = new Date().getTime()) {
        if(!this.isActive) {
            this.startSession();
        }

        const isTyping = shouldCountAsTyping(inputType, isComposing);
        if(isTyping) this.timestamps.push(timestamp);
        this.profile.tempoProfile = updateLocalTempoProfile(this.profile.tempoProfile, this.timestamps);
        this.typingTimeout = getTypingTimeout(this.profile.tempoProfile.meanCPS, this.profile.tempoProfile.deviation, timestamp);
    }

    private startSession() {
        this.isActive = true;
        this.intervalId = setInterval(() => {
            this.processTick();
        }, this.CYCLE_DURATION)
    }

    private processTick() {
        const now = new Date().getTime();
        this.timestamps = truncateOldTimestamps(this.timestamps, 2000, now);

        // function calls...
    }

    public stopSession() {
        if(this.intervalId) clearInterval(this.intervalId);
        this.isActive = false;
    }
}

const session = new Session();
export default session;