import { Gesture } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";

export const useSwipeGesture = (goToNextPoint: () => void, goToPreviousPoint: () => void) => {
    const swipeLeftRight = Gesture.Pan()
        .onEnd((event) => {
            if (Math.abs(event.translationX) > Math.abs(event.translationY)) {
                if (event.translationX > 0) {
                    runOnJS(goToPreviousPoint)();
                } else {
                    runOnJS(goToNextPoint)();
                }
            }
        });

    return swipeLeftRight;
};