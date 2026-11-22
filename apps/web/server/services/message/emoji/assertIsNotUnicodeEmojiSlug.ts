import type { Operation } from "@esposter/shared";

import { checkIsUnicodeEmojiSlug } from "#server/services/message/emoji/checkIsUnicodeEmojiSlug";
import { getInvalidOperationError } from "#server/trpc/guards/getInvalidOperationError";
import { DatabaseEntityType } from "@esposter/db-schema";

export const assertIsNotUnicodeEmojiSlug = (operation: Operation, name: string) => {
  if (checkIsUnicodeEmojiSlug(name)) throw getInvalidOperationError(operation, DatabaseEntityType.RoomEmoji, name);
};
