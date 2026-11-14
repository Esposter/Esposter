import type { OffsetPaginationData } from "#shared/models/pagination/offset/OffsetPaginationData";
import type { RoomMessage } from "@esposter/db-schema";

// A hit names the room it is in, since one search reads several rooms and a hit is opened in its own room
export interface SearchMessagesResult {
  count: number;
  data: OffsetPaginationData<RoomMessage & { roomId: string }>;
}
