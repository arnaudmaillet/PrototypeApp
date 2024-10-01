import { Stack } from 'expo-router';
import { PointProvider } from '../providers/PointProvider';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function Layout() {
  return (
    <SafeAreaProvider>
      <PointProvider>
        <Stack />
      </PointProvider>
    </SafeAreaProvider>
  )
}
