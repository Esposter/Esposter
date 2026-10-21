import type { ModerationLogEntity } from "@esposter/db-schema";
import type { ToData } from "@esposter/shared";

// An audit entry whose actor and target carry the name each one has in the room the entry is in. Plain data over the
// Entity's ToData form, since the procedure returns the mapped page rather than entity instances
export type ModerationLogInRoom = ToData<ModerationLogEntity> & { actorDisplayName: string; targetDisplayName: string };
