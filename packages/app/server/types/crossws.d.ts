import "crossws";

import type { WsAdapter } from "@@/server/models/ws/WsAdapter";

declare module "crossws" {
  interface Peer {
    _wsAdapter?: WsAdapter;
  }
}
