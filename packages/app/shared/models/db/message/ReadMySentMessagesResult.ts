import type { SentMessageWithRoom } from "#shared/models/db/message/SentMessageWithRoom";
import type { OffsetPaginationData } from "#shared/models/pagination/offset/OffsetPaginationData";

export interface ReadMySentMessagesResult {
  count: number;
  data: OffsetPaginationData<SentMessageWithRoom>;
}
