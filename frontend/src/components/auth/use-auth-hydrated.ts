'use client';

import { useAuthStore } from '@/stores/auth-store';
import { useSyncExternalStore } from 'react';

function subscribe(onStoreChange: () => void) {
  return useAuthStore.persist.onFinishHydration(onStoreChange);
}

export function useAuthHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => useAuthStore.persist.hasHydrated(),
    () => false,
  );
}
