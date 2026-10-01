import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { VARIANT } from '../constants/student';

export const triggerAddToCartHaptic = () => {
    const options = {
        enableVibrateFallback: true,
        ignoreAndroidSystemSettings: false,
    };

    const type = VARIANT.hapticOnAdd === 'impact' ? 'impactMedium' : 'selection';
    ReactNativeHapticFeedback.trigger(type, options);
};