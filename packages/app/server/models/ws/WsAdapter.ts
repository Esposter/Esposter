import type { Peer } from "crossws";

import { EventEmitter } from "node:events";
// Wraps a crossws Peer to satisfy the ws.WebSocket interface that tRPC expects
export class WsAdapter extends EventEmitter {
  readonly CLOSED = 3 as const;
  readonly CLOSING = 2 as const;
  readonly CONNECTING = 0 as const;
  readonly OPEN = 1 as const;
  readyState: typeof this.CLOSED | typeof this.CLOSING | typeof this.CONNECTING | typeof this.OPEN = this.OPEN;
  private readonly peer: Peer;

  constructor(peer: Peer) {
    super();
    this.peer = peer;
  }

  close(code?: number, reason?: Buffer | string) {
    this.readyState = this.CLOSING;
    this.peer.close(code, typeof reason === "string" ? reason : reason?.toString());
  }

  send(data: string) {
    this.peer.send(data);
  }
}
