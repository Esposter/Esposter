import type { OffsetPaginationData } from "#shared/models/pagination/offset/OffsetPaginationData";
import type { SentMessageWithRoom } from "#shared/models/db/message/SentMessageWithRoom";

export interface ReadMySentMessagesResult {
  count: number;
  data: OffsetPaginationData<SentMessageWithRoom>;
}
