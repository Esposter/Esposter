import { EventEmitter } from "node:events";

// The client tRPC's connection handler drives, over any transport that can close, send and terminate: the members
// TRPC's `WSClient` names, the transport held in closures. A subclass replays its transport's life as the events `ws`
// Would have emitted
export class WebSocketClientAdapter extends EventEmitter {
  readonly close: (code?: number, reason?: string) => void;
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
