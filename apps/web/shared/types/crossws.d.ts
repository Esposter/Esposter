// Here rather than under `server/types`: Nuxt typechecks every server route in the app project too, to infer what
// `$fetch` returns, and that project includes `shared/**/*.d.ts` and no server file — so an augmentation under
// `server/` is invisible there and every `peer.wsAdapter` fails with TS2339. Nuxt documents this as a known
// Limitation (https://github.com/nuxt/nuxt/pull/33964) whose answer is declaring the type in the app context as well.
import "crossws";

import type { WsAdapter } from "@@/server/models/ws/WsAdapter";

declare module "crossws" {
  interface Peer {
    wsAdapter?: WsAdapter;
  }
}
