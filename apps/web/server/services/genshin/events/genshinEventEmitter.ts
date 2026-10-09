import type { UserInAuth } from "@esposter/db-schema";

import { EventEmitter } from "node:events";

interface GenshinEvents {
  // A start took the lease, so the session the user's save held before is replaced by the one named here
  replaceSession: [[UserInAuth["id"], string]];
}

export const genshinEventEmitter = new EventEmitter<GenshinEvents>();
