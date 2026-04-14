import { Config } from "@/types";

const DEFAULT_CONFIG: Config = {
    persistentStorage: false,
    useCookie: false,
    cookieMaxAgeDays: 180,
    minFireLength: 0,
    fireOnEnter: true,
    fireOnPaste: false,
    minFireDelay: 0,
    maxWait: 0
}

export default DEFAULT_CONFIG;