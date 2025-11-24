import type { UserToHuddle, UserToHuddleWithRelations } from "@esposter/db-schema";

import { EventEmitter } from "node:events";

export interface HuddleEvents {
  joinHuddle: Pick<UserToHuddleWithRelations, "roomId" | "user">[];
  leaveHuddle: Pick<UserToHuddle, "roomId" | "userId">[];
}

export const huddleEventEmitter = new EventEmitter<HuddleEvents>();
