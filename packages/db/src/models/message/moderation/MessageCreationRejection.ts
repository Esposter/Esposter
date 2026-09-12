import type { MessageCreationRejectionType, RoomFilterInMessage } from "@esposter/db-schema";

export type MessageCreationRejection =
  | {
      filter: Pick<RoomFilterInMessage, "action" | "timeoutDurationMs">;
      type: MessageCreationRejectionType.WordFilter;
    }
  | { type: Exclude<MessageCreationRejectionType, MessageCreationRejectionType.WordFilter> };
