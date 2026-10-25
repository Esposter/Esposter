import type { UserInAuth } from "@esposter/db-schema";

export interface GenshinEvents {
  // A start took the lease, so the session the user's save held before is replaced by the one named here
  replaceSession: [[UserInAuth["id"], string]];
}
