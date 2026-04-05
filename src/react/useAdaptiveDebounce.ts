import { useAdaptiveDebounceProps } from "@/types"

const useAdaptiveDebounce: useAdaptiveDebounceProps = (onFire, minFireLength) => {
    const bind = {
        onbeforeinput(e: React.InputEvent<HTMLInputElement | HTMLTextAreaElement>) {
            const value = e.currentTarget.value;
            const inputType = e.nativeEvent.inputType;
            const isComposing = e.nativeEvent.isComposing;
            const timestamp = e.nativeEvent.timeStamp;
        }
    }

    return {
        bind
    }
}