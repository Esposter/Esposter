// @vitest-environment nuxt
import type { CreateEmojiInput } from "#shared/models/db/message/metadata/CreateEmojiInput";
import type { MessageEmojiMetadataEntity } from "#shared/models/db/message/metadata/MessageEmojiMetadataEntity";

import { useSelectEmoji } from "@/composables/message/emoji/useSelectEmoji";
import { createMessageEntity, MessageType } from "@esposter/db-schema";
import { beforeEach, describe, expect, test, vi } from "vitest";
// Hoisted above the imports by `vi.mock`, so unlike a plain constant these cannot live inside the describe
const { createEmoji, emojis, toggleEmoji } = vi.hoisted(() => ({
  createEmoji: vi.fn<(input: CreateEmojiInput) => Promise<void>>(),
  // Only the two fields the composable matches on, so the double states its own contract
  emojis: new Array<Pick<MessageEmojiMetadataEntity, "emojiTag" | "userIds">>(),
  toggleEmoji: vi.fn<(emoji: MessageEmojiMetadataEntity) => Promise<void>>(),
}));

// The composable reads three members off the store and nothing else, so the double is those three — the cast is
// What standing in for a Pinia store's full surface costs, and it is the only one this double needs
vi.mock(import("@/store/message/emoji"), () => ({
  useEmojiStore: (() => ({
    createEmoji,
    getEmojis: () => emojis,
    toggleEmoji,
  })) as unknown as (typeof import("@/store/message/emoji"))["useEmojiStore"],
}));

describe(useSelectEmoji, () => {
  const THUMBS_UP = "👍";
  const THUMBS_UP_MEDIUM = "👍🏽";
  const userId = "userId";
  const message = createMessageEntity({ roomId: crypto.randomUUID(), type: MessageType.Message, userId });

  beforeEach(() => {
    emojis.length = 0;
    vi.clearAllMocks();
  });

  // A reaction is stored as the emoji itself, so two tones of one emoji are two reactions with their own
  // Counts — Discord and Slack both behave this way, and any normalisation reintroduced here would break it
  test("treats a differently toned emoji as its own reaction", async () => {
    expect.hasAssertions();

    const selectEmoji = useSelectEmoji(message);
    await selectEmoji(THUMBS_UP);
    emojis.push({ emojiTag: THUMBS_UP, userIds: [userId] });
    await selectEmoji(THUMBS_UP_MEDIUM);

    expect(createEmoji.mock.calls.map(([{ emojiTag }]) => emojiTag)).toStrictEqual([THUMBS_UP, THUMBS_UP_MEDIUM]);
  });

  test("toggles the existing reaction when the same emoji comes back", async () => {
    expect.hasAssertions();

    const foundEmoji = { emojiTag: THUMBS_UP, userIds: [userId] };
    emojis.push(foundEmoji);
    const selectEmoji = useSelectEmoji(message);
    await selectEmoji(THUMBS_UP);

    expect(createEmoji).not.toHaveBeenCalled();
    expect(toggleEmoji).toHaveBeenCalledExactlyOnceWith(foundEmoji);
  });
});
