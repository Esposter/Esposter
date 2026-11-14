import type { OffsetPaginationData } from "#shared/models/pagination/offset/OffsetPaginationData";
import type { RoomMessage } from "@esposter/db-schema";

export interface SearchMessagesResult {
  count: number;
  data: OffsetPaginationData<RoomMessage>;
}
