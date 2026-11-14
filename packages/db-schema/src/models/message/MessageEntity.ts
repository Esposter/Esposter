import type { StandardMessageEntity } from "#src/models/message/StandardMessageEntity";
import type { WebhookMessageEntity } from "#src/models/message/WebhookMessageEntity";
import type { ToData } from "@esposter/shared";
import type { Except } from "type-fest";

import { standardMessageEntitySchema } from "#src/models/message/StandardMessageEntity";
import { webhookMessageEntitySchema } from "#src/models/message/WebhookMessageEntity";
import { z } from "zod";

export type MessageEntity = StandardMessageEntity | WebhookMessageEntity;

// Both kinds, as the wire carries them: the link preview is generated on the server and never sent with a message
export const messageEntitySchema = z.union([
  standardMessageEntitySchema,
  webhookMessageEntitySchema,
]) satisfies z.ZodType<
  | ToData<Except<StandardMessageEntity, "linkPreviewResponse">>
  | ToData<Except<WebhookMessageEntity, "linkPreviewResponse">>
>;
