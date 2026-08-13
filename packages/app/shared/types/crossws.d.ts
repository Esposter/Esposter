// @TODO: Move to `server/types` once nuxt fixes its types. `.nuxt/types/nitro-routes.d.ts` imports every server
// route, so the app project typechecks `server/routes/ws.ts` — but its `include` covers `shared/**/*.d.ts` and no
// server file, so this augmentation is invisible there and every `peer.wsAdapter` fails with TS2339.
import "crossws";

import type { WsAdapter } from "@@/server/models/ws/WsAdapter";

declare module "crossws" {
  interface Peer {
    wsAdapter?: WsAdapter;
  }
}
