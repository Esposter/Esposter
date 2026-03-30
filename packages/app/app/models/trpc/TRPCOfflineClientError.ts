import type { InferrableClientTypes } from "@trpc/server/unstable-core-do-not-import";

import { TRPCClientError } from "@trpc/client";

export class TRPCOfflineClientError extends TRPCClientError<InferrableClientTypes> {
  override readonly name = "TRPCOfflineClientError";

  constructor() {
    super("offline");
  }
}
