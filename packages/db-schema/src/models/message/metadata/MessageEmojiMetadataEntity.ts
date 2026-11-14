import type { CompositeKeyEntity } from "#src/models/streams/CompositeKeyEntity";
import type { ToData } from "@esposter/shared";
import { EN_US_GRAPHEME_SEGMENTER, getPropertyNames } from "@esposter/shared";
import { CUSTOM_EMOJI_TAG_PREFIX, UNICODE_EMOJI_TAG_MAX_LENGTH } from "#src/services/message/emoji/constants";
import { createMessageMetadataEntitySchema } from "#src/services/message/metadata/createMessageMetadataEntitySchema";
import { MessageMetadataEntity } from "#src/models/message/metadata/MessageMetadataEntity";
import { MessageMetadataType } from "#src/models/message/metadata/MessageMetadataType";
import { userIdsSchema } from "#src/models/shared/UserIds";
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
  // Flags and ZWJ sequences all being one. See openspec/specs/esbabbler/emoji/design.md
  emojiTag: z.union([
    z
      .emoji()
      .max(UNICODE_EMOJI_TAG_MAX_LENGTH)
      .refine((emojiTag) => [...EN_US_GRAPHEME_SEGMENTER.segment(emojiTag)].length === 1),
    z.templateLiteral([CUSTOM_EMOJI_TAG_PREFIX, z.uuidv4()]),
  ]),
  ...userIdsSchema.shape,
}) satisfies z.ZodType<ToData<MessageEmojiMetadataEntity>>;
