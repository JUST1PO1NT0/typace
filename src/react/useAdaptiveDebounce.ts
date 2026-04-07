import { useAdaptiveDebounceProps } from "@/types"
import session from "@/engine/session";
import React from "react";


export const useAdaptiveDebounce: useAdaptiveDebounceProps = (onFire, minFireLength) => {
    const bind = {
        onbeforeinput(e: React.InputEvent<HTMLInputElement | HTMLTextAreaElement>) {
            const length = e.currentTarget.value.length;
            const inputType = e.nativeEvent.inputType;
            const isComposing = e.nativeEvent.isComposing;
            const timestamp = e.nativeEvent.timeStamp;

            const fire = (): void => onFire(e.currentTarget.value);

            session.addEvent(length, inputType, isComposing, timestamp, fire)
        }
    }

    return {
        bind
    }
}