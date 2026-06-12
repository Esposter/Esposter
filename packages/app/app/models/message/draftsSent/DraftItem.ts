import type { RoomInMessage } from "@esposter/db-schema";

export interface DraftItem {
  content: string;
  room: RoomInMessage;
  updatedAt: Date;
}
