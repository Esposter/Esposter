import type { UserToHuddle } from "@esposter/db-schema";

import { EventEmitter } from "node:events";

export interface HuddleEvents {
  join: Pick<UserToHuddle, "roomId" | "userId">[];
  leave: Pick<UserToHuddle, "roomId" | "userId">[];
}

export const huddleEventEmitter = new EventEmitter<HuddleEvents>();
