import { CUSTOM_EMOJI_TAG_PREFIX, UNICODE_EMOJI_TAG_MAX_LENGTH } from "#src/services/message/emoji/constants";
import { EN_US_GRAPHEME_SEGMENTER } from "@esposter/shared";
import { z } from "zod";

// The two vocabularies a reaction can name, and one reaction is one emoji. `z.emoji()` on its own accepts a run of them,
// So the grapheme count beside it is what bounds a tag to a single cluster — toned characters, flags and ZWJ sequences
// All being one. See openspec/specs/esbabbler/emoji/design.md
export const emojiTagSchema = z.union([
  z
    .emoji()
    .max(UNICODE_EMOJI_TAG_MAX_LENGTH)
    .refine((emojiTag) => [...EN_US_GRAPHEME_SEGMENTER.segment(emojiTag)].length === 1),
  z.templateLiteral([CUSTOM_EMOJI_TAG_PREFIX, z.uuidv7()]),
]);
