import * as SecureStore from 'expo-secure-store';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { newUuid } from '@/utils/uuid';

const KEY = 'mecenate.uuid';

type AuthContextValue = {
  uuid: string | null;
  regenerate: () => Promise<string>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [uuid, setUuid] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = await SecureStore.getItemAsync(KEY);
      if (cancelled) return;
      if (stored) {
        setUuid(stored);
      } else {
        const fresh = newUuid();
        await SecureStore.setItemAsync(KEY, fresh);
        if (!cancelled) setUuid(fresh);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const regenerate = async (): Promise<string> => {
    const fresh = newUuid();
    await SecureStore.setItemAsync(KEY, fresh);
    setUuid(fresh);
    return fresh;
  };

  return <AuthContext.Provider value={{ uuid, regenerate }}>{children}</AuthContext.Provider>;
}

export const useAuth = (): AuthContextValue => {
  const v = useContext(AuthContext);
  if (!v) throw new Error('useAuth must be used inside AuthProvider');
  return v;
};
