// TODO Q2: Уточнить у заказчика финальный WS URL
const WS_URL = 'wss://k8s.mectest.ru/test-app/ws';

type Listener = (msg: unknown) => void;

function safeParse(data: string): unknown {
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

class WsClient {
  private ws?: WebSocket;
  private listeners = new Set<Listener>();
  private retries = 0;
  private heartbeatTimer?: ReturnType<typeof setInterval>;
  private pongTimer?: ReturnType<typeof setTimeout>;
  private reconnectTimer?: ReturnType<typeof setTimeout>;
  private token?: string;

  connect(token: string): void {
    this.token = token;
    if (this.ws?.readyState === WebSocket.OPEN) return;
    // Close existing non-open socket before creating a new one
    if (this.ws) {
      this.ws.onclose = null;
      this.ws.onerror = null;
      this.ws.onmessage = null;
      this.ws.close();
    }

    try {
      this.ws = new WebSocket(`${WS_URL}?token=${token}`);
    } catch (e) {
      if (__DEV__) console.warn('[WsClient] Failed to create WebSocket:', e);
      this.scheduleReconnect();
      return;
    }

    this.ws.onopen = () => {
      this.retries = 0;
      this.startHeartbeat();
    };

    this.ws.onmessage = (e) => {
      const msg = safeParse(e.data as string) as Record<string, unknown> | null;
      if (msg?.type === 'pong') {
        this.armPongTimeout();
        return;
      }
      this.listeners.forEach((l) => l(msg));
    };

    this.ws.onclose = () => {
      this.scheduleReconnect();
    };

    this.ws.onerror = () => {
      this.ws?.close();
    };
  }

  private startHeartbeat(): void {
    this.armPongTimeout();
    this.heartbeatTimer = setInterval(() => {
      try {
        this.ws?.send(JSON.stringify({ type: 'ping' }));
      } catch {
        // send can fail if socket is closing — ignored
      }
    }, 30_000);
  }

  private armPongTimeout(): void {
    clearTimeout(this.pongTimer);
    this.pongTimer = setTimeout(() => {
      this.ws?.close();
    }, 60_000);
  }

  private scheduleReconnect(): void {
    clearInterval(this.heartbeatTimer);
    clearTimeout(this.pongTimer);
    clearTimeout(this.reconnectTimer);
    this.heartbeatTimer = undefined;
    this.pongTimer = undefined;

    if (this.retries >= 10) {
      if (__DEV__) console.warn('[WsClient] Max retries reached, waiting for AppState active');
      return;
    }

    const delay = Math.min(30_000, 1000 * Math.pow(2, this.retries));
    this.retries += 1;

    this.reconnectTimer = setTimeout(() => {
      if (this.token) {
        this.connect(this.token);
      }
    }, delay);
  }

  disconnect(): void {
    clearInterval(this.heartbeatTimer);
    clearTimeout(this.pongTimer);
    clearTimeout(this.reconnectTimer);
    this.heartbeatTimer = undefined;
    this.pongTimer = undefined;
    this.reconnectTimer = undefined;
    this.retries = 0;

    if (this.ws) {
      this.ws.onclose = null;
      this.ws.onerror = null;
      this.ws.onmessage = null;
      this.ws.close();
      this.ws = undefined;
    }
  }

  on(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}

export const ws = new WsClient();
