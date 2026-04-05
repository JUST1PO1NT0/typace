import { Profile } from "@/types";
import ProfileController from "@/profile/profile";

type SessionData = {
    value: {
        curr: string,
        prev?: string
    },
    entries: number[]
    localProfile: Profile;
    lastUpdate: number;
    isComposing: boolean;
}

interface InputStreamData {
    value: string;
    timestamp: number;
    isComposing: boolean;
}

class Session {
    private static instance: Session;
    private isActive: boolean = false;
    private data: SessionData;

    private constructor() {}

    static getInstance(): Session {
        if(!Session.instance) {
            Session.instance = new Session();
        }
        return Session.instance;
    }

    registerData = ({value, timestamp, isComposing}: InputStreamData) => {
        if(!this.isActive) this.initialiseSession();
        this.data.entries.push(timestamp);
        this.data.lastUpdate = timestamp;
        this.data.isComposing = isComposing;
        this.data.value.prev = this.data.value.curr;
        this.data.value.curr = value;

        this.truncateOldData();
    }

    private truncateOldData() {
        let entries = this.data.entries;
        const threshold = new Date().getTime() - 2000;
        for(var i = 0; i < entries.length; i++) {
            if(entries[i] >= threshold) break;
            entries.splice(i, 1);
        }
    }

    private initialiseSession = () => {
        this.data.localProfile = ProfileController.getInstance().getProfile();
        this.isActive = true;
    }
}

const session = Session.getInstance();
export default Session;