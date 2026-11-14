import type { MessageEntity } from "#src/models/message/MessageEntity";
import type { UserInAuth } from "#src/schema/auth/usersInAuth";

import { standardMessageEntitySchema } from "#src/models/message/StandardMessageEntity";
import { webhookMessageEntitySchema } from "#src/models/message/WebhookMessageEntity";
import { PublishEventType } from "#src/models/publish/PublishEventType";
import { userIdSchema } from "#src/models/shared/UserId";
import { z } from "zod";

// What a background job tells the server to publish to its live subscriptions. A message is the entity as it was
// Written; a storage change names only whose counter moved, and the server reads the figure itself
export type PublishEvent =
  | { message: MessageEntity; type: PublishEventType.Message }
  | { type: PublishEventType.Storage; userId: UserInAuth["id"] };

// JSON carries the metadata dates as strings, so they are coerced here rather than revived from every string a
// Message holds. No link preview exists when a message is published; the backend generates one afterwards
const publishedMetadataShape = {
  createdAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
  linkPreviewResponse: z.null(),
  updatedAt: z.coerce.date(),
};
const publishedMessageEntitySchema = z.union([
  standardMessageEntitySchema.extend(publishedMetadataShape),
  webhookMessageEntitySchema.extend(publishedMetadataShape),
]);

export const publishEventSchema = z.discriminatedUnion("type", [
  z.object({ message: publishedMessageEntitySchema, type: z.literal(PublishEventType.Message) }),
  z.object({ type: z.literal(PublishEventType.Storage), ...userIdSchema.shape }),
]) satisfies z.ZodType<PublishEvent>;
