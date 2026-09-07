import type { InferrableClientTypes } from "@trpc/server/unstable-core-do-not-import";

import { TRPCClientError } from "@trpc/client";

// The rejection `offlineLink` answers a call with while the browser is offline. Nothing branches on the type —
// What it carries is what every reader needs: a `name` that says why in the console line, and no `data` shape,
// Which is the property `errorLink` skips its alert on (an offline call is not a failure the person should be
// Toasted about; the offline banner already says so).
export class TRPCOfflineClientError extends TRPCClientError<InferrableClientTypes> {
  override readonly name = "TRPCOfflineClientError";

  constructor() {
    super("offline");
  }
}
