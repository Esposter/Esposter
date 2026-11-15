import type { MessageCreationRejectionType, RoomFilterInMessage } from "@esposter/db-schema";

export type MessageCreationRejection =
  | {
      filter: Pick<RoomFilterInMessage, "action" | "timeoutDurationMs">;
      type: typeof MessageCreationRejectionType.WordFilter;
    }
  | { type: Exclude<MessageCreationRejectionType, typeof MessageCreationRejectionType.WordFilter> };
