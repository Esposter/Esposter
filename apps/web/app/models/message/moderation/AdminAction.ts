import type { RoomInMessage } from "@esposter/db-schema";
import type { Promisable } from "type-fest";

export type AdminAction = (roomId: RoomInMessage["id"], durationMs?: number) => Promisable<void>;
