// @TODO: This should only be on server folder once nuxt fixes its types
import "crossws";

import type { WsAdapter } from "@@/server/models/ws/WsAdapter";

declare module "crossws" {
  interface Peer {
    wsAdapter?: WsAdapter;
  }
}
