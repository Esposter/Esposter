import { EventEmitter } from "node:events";

// The `ws.WebSocket` tRPC's connection handler drives, over any transport that can close, send and terminate. It
// Declares only members `ws.WebSocket` has, the transport held in closures, so the socket stays a subset a single `as`
// Can stand in for. A subclass replays its transport's life as the events `ws` would have emitted
export class WebSocketClientAdapter extends EventEmitter {
  readonly close: (code?: number, reason?: string) => void;
  readonly CLOSED: number = WebSocket.CLOSED;
  readonly CLOSING: number = WebSocket.CLOSING;
  readonly CONNECTING: number = WebSocket.CONNECTING;
  readonly OPEN: number = WebSocket.OPEN;
  readyState: number = WebSocket.OPEN;
  readonly send: (data: string) => void;
  readonly terminate: () => void;

  constructor(transport: {
    close: (code?: number, reason?: string) => void;
    send: (data: string) => void;
    terminate: () => void;
  }) {
    super();
    this.close = (code, reason) => {
      this.readyState = WebSocket.CLOSING;
      transport.close(code, reason);
    };
    this.send = (data) => {
      transport.send(data);
    };
    this.terminate = () => {
      this.readyState = WebSocket.CLOSING;
      transport.terminate();
    };
  }
}
