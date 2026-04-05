import { Profile } from "@/types";
import {fetchProfile} from "@/engine/cookie";


class ProfileController {
    private static instance: ProfileController;
    private profile: Profile;
    private listeners: ((profile: Profile | null) => void)[] = [];

    private constructor () {}

    static getInstance (): ProfileController {
        if(!ProfileController.instance) {
            ProfileController.instance = new ProfileController();
            Promise.resolve(ProfileController.instance.initialise());
        }

        return ProfileController.instance;
    }

    private async initialise(): Promise<void> {
        this.profile = await fetchProfile();
    }

    setProfile(profile: Profile): void {
        this.profile = { ...profile, lastUpdated: new Date()}
        this.notifyListeners();
    }

    updateProfile(update: Partial<Profile>): void {
        if(!this.profile) return;
        this.profile = {
            ...this.profile,
            ...update,
            lastUpdated: new Date()
        }
        this.notifyListeners()
    }

    getProfile(): Profile {
        return this.profile
    }

    subscribe(listener: (profile: Profile | null) => void): () => void {
        this.listeners.push(listener);
        return () => this.listeners = this.listeners.filter(l => l !== listener);
    }

    private notifyListeners(): void {
        this.listeners.forEach(listener => listener(this.profile));
    }
}

const profileController = ProfileController.getInstance();
export default ProfileController;