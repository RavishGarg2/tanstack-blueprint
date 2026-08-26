import { createMMKV } from 'react-native-mmkv';
import { QueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';

export const storage = createMMKV();

export const resetAppStorage = async (queryClient?: QueryClient) => {
  try {
    // 1. Clear all MMKV persistent storage
    storage.clearAll();

    // 2. Clear all TanStack React Query memory cache
    if (queryClient) {
      queryClient.clear();
      await queryClient.refetchQueries({ type: 'active' });
    }

    Alert.alert(
      'Storage Reset 🧹',
      'All local MMKV storage and TanStack query cache have been completely wiped. The app is in a clean fresh state.',
    );
  } catch (error: any) {
    Alert.alert('Reset Failed', error?.message || 'Could not reset storage.');
  }
};
