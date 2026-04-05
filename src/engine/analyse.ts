interface GetTempoProfileProps {
    timestamps: number[];
}

type ShouldCountAsTyping = (
    inputType: string,
    isComposing: boolean,
) => boolean;

/**
 * 
 * @param inputType type of input as recorded by event onbeforeinput
 * @param isComposing if user is composing via IME language composer
 * @returns `boolean` if typing action should be recorded as timestamp for computing meanCPS, etc.
 */
export const shouldCountAsTyping: ShouldCountAsTyping = (inputType, isComposing) => {
    switch(inputType) {
        case "insertText": {
            return true;
        }
        case "insertCompositionText": {
            if(isComposing) return false;
            return true;
        }
        default: {
            return false;
        }
    }
}

// event-driven
/**
 * Calculate the latest time at which to expect user input, with deviation confidence of `2σ`
 * @param avgCPS mean average CPS collected in localProfile
 * @param devCPS standard deviation from mean average CPS
 * @param timestamp unix timestamp of current time
 * @returns `timestamp + t` time threshold before which to expect a new input.
 * @remarks event-driven in `Session`.
 */
export const getTypingTimeout = (avgCPS: number, devCPS: number, timestamp: number = new Date().getTime()) => {
    const devConfidence = 2;

    const avgInterval = 1000 / avgCPS;
    const devInterval = 1000 / devCPS;
    const t = avgInterval + (devConfidence * devInterval);

    return timestamp + t;
}

type GetPauseLikelihood = (
    
) => number;

export const getPauseLikelihood = () => {

}