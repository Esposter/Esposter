import type { OffsetPaginationData } from "#shared/models/pagination/offset/OffsetPaginationData";
import type { MessageEntity } from "@esposter/db-schema";

export interface SearchMessagesResult {
  // Azure Search only returns a total when one was asked for, so the client leaves its own total alone when it is absent
  count?: number;
  data: OffsetPaginationData<MessageEntity>;
}
