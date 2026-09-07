import type { CompositeKeyEntity } from "@esposter/db-schema";
import type { ToData } from "@esposter/shared";

import { EN_US_GRAPHEME_SEGMENTER } from "#shared/services/intl/constants";
import { CUSTOM_EMOJI_TAG_PREFIX } from "#shared/services/message/emoji/constants";
import {
  createMessageMetadataEntitySchema,
  MessageMetadataEntity,
  MessageMetadataType,
  userIdsSchema,
} from "@esposter/db-schema";
import { getPropertyNames } from "@esposter/shared";
import { z } from "zod";

export class MessageEmojiMetadataEntity extends MessageMetadataEntity<MessageMetadataType.Emoji> {
  declare emojiTag: string;
  userIds: string[] = [];

  constructor(init?: Partial<MessageEmojiMetadataEntity> & ToData<CompositeKeyEntity>) {
    super();
    Object.assign(this, init);
  }
}

export const MessageEmojiMetadataEntityPropertyNames = getPropertyNames<MessageEmojiMetadataEntity>();

export const messageEmojiMetadataEntitySchema = z.object({
  ...createMessageMetadataEntitySchema(z.literal(MessageMetadataType.Emoji)).shape,
  // The two vocabularies a reaction can name, and one reaction is one emoji. `z.emoji()` on its own accepts a
  // Run of them, so the grapheme count beside it is what bounds a tag to a single cluster — toned characters,
  // Flags and ZWJ sequences all being one. See /docs/esbabbler/emoji
  emojiTag: z.union([
    z.emoji().refine((emojiTag) => [...EN_US_GRAPHEME_SEGMENTER.segment(emojiTag)].length === 1),
    z.templateLiteral([CUSTOM_EMOJI_TAG_PREFIX, z.uuid()]),
  ]),
  ...userIdsSchema.shape,
}) satisfies z.ZodType<ToData<MessageEmojiMetadataEntity>>;
