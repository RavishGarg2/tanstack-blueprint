import React from 'react';
import { StatusBar, AppState, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, onlineManager, focusManager } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { storage } from './src/utils/storage';
import NetInfo from '@react-native-community/netinfo';
import RootNavigation from './src/navigation/NavigationContainer';

const clientPersister = createAsyncStoragePersister({
  storage: {
    getItem: (key: string) => storage.getString(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
    removeItem: (key: string) => {
      storage.remove(key);
    },
  },
});

// Auto pause/resume queries based on network connectivity
onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    setOnline(!!state.isConnected);
  });
});

// Auto refetch queries when app comes back from background
focusManager.setEventListener((handleFocus) => {
  const subscription = AppState.addEventListener('change', (status) => {
    handleFocus(status === 'active');
  });
  return () => subscription.remove();
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 hours cache retention in MMKV
      staleTime: 0, // Mark cache as stale so API refetches background data
      refetchOnMount: 'always', // Always revalidate from server when screen loads
    },
  },
});

function App() {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: clientPersister }}
    >
      <SafeAreaProvider>
        <StatusBar hidden={true} />
        <RootNavigation />
      </SafeAreaProvider>
    </PersistQueryClientProvider>
  );
}

export default App;
