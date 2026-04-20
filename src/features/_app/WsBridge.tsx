import { useWsLifecycle } from './useWsLifecycle';
import { useWsCacheSync } from './useWsCacheSync';

export function WsBridge(): null {
  useWsLifecycle();
  useWsCacheSync();
  return null;
}
