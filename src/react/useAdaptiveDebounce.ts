import { useAdaptiveDebounceProps } from "../types"
import session from "@/engine/session";
import React from "react";

type NativeEvent = React.InputEvent<HTMLInputElement | HTMLTextAreaElement>;

const useAdaptiveDebounce: useAdaptiveDebounceProps = (onFire, minFireLength) => {
    const handleEvent = (e: NativeEvent, inputType: string, isComposing: boolean) => {
        const target = e.currentTarget;
        if (!target) return;
        
        const value = target.value;
        const fire = () => onFire(value);
        
        session.addEvent(value.length, inputType, isComposing, Date.now(), fire);
    };
    
    const bind = {
        onInput(e: NativeEvent) {
            const nativeEvent = e.nativeEvent as InputEvent;
            handleEvent(e, nativeEvent.inputType, nativeEvent.isComposing ?? false);
        },
        onCompositionEnd(e: NativeEvent) {
            handleEvent(e, 'insertCompositionText', false);
        }
    };

    return { bind };
};

export default useAdaptiveDebounce