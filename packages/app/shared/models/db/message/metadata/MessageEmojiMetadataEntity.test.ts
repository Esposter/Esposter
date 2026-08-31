import { messageEmojiMetadataEntitySchema } from "#shared/models/db/message/metadata/MessageEmojiMetadataEntity";
import { describe, expect, test } from "vitest";

describe("messageEmojiMetadataEntitySchema", () => {
  const emojiTagSchema = messageEmojiMetadataEntitySchema.shape.emojiTag;

  // Only the grapheme count is ours — `z.emoji()` owns the charset. A toned character, a flag and a ZWJ
  // Sequence are each several code points and one cluster, and a keycap is built out of a digit, so these are
  // The shapes a single-cluster rule rejects by accident
  test.each(["👍🏽", "🇦🇺", "🧑🏽‍💻", "1️⃣"])("accepts the single grapheme %s", (emojiTag) => {
    expect.hasAssertions();

    expect(emojiTagSchema.safeParse(emojiTag).success).toBe(true);
  });

  // Both pass `z.emoji()` on its own, which is the whole reason the count is there
  test.each(["😀😀", "123"])("rejects %s", (emojiTag) => {
    expect.hasAssertions();

    expect(emojiTagSchema.safeParse(emojiTag).success).toBe(false);
  });
});
