import { Stack } from 'expo-router';
import { PointProvider } from '../providers/PointProvider';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function Layout() {
  return (
    <GestureHandlerRootView>
      <SafeAreaProvider>
        <PointProvider>
          <Stack />
        </PointProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
