import { useEffect } from 'react';
import { AppState } from 'react-native';
import { ws } from '@/api/ws';
import { useAuth } from '@/store/AuthContext';

export function useWsLifecycle(): void {
  const { uuid } = useAuth();

  useEffect(() => {
    if (!uuid) return;

    ws.connect(uuid);

    const sub = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        ws.connect(uuid);
      } else if (nextState === 'background') {
        ws.disconnect();
      }
    });

    return () => {
      sub.remove();
      ws.disconnect();
    };
  }, [uuid]);
}
