// @vitest-environment nuxt
import { useSelectEmoji } from "#src/composables/message/emoji/useSelectEmoji";
import { createOptimisticMessage } from "#src/services/message/createOptimisticMessage";
import { useEmojiStore } from "#src/store/message/emoji";
import { MessageType } from "@esposter/db-schema";
import { noop } from "@esposter/shared";
import { v7 } from "uuid";
import { afterEach, describe, expect, test, vi } from "vitest";

describe(useSelectEmoji, () => {
  const THUMBS_UP = "👍";
  const THUMBS_UP_MEDIUM = "👍🏽";
  const userId = v7();
  const message = createOptimisticMessage({ roomId: v7(), type: MessageType.Message }, userId);

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // The composable reads the store's own state, so the test seeds that state through the store's setter rather than
  // Doubling the reads. Only the two writes that reach the server are spied, and they record instead of running
  // A reaction is stored as the emoji itself, so two tones of one emoji are two reactions with their own
  // Counts — Discord and Slack both behave this way, and any normalisation reintroduced here would break it
  test("treats a differently toned emoji as its own reaction", () => {
    expect.hasAssertions();

    const emojiStore = useEmojiStore();
    const createEmoji = vi.spyOn(emojiStore, "createEmoji").mockImplementation(noop);
    const selectEmoji = useSelectEmoji(message);
    selectEmoji(THUMBS_UP);
    emojiStore.setEmojis(message.roomId, message.id, [
      { emojiTag: THUMBS_UP, messageId: message.id, userIds: [userId] },
    ]);
    selectEmoji(THUMBS_UP_MEDIUM);

    expect(createEmoji.mock.calls.map(([{ emojiTag }]) => emojiTag)).toStrictEqual([THUMBS_UP, THUMBS_UP_MEDIUM]);
  });

  test("toggles the existing reaction when the same emoji comes back", () => {
    expect.hasAssertions();

    const foundEmoji = { emojiTag: THUMBS_UP, messageId: message.id, userIds: [userId] };
    const emojiStore = useEmojiStore();
    emojiStore.setEmojis(message.roomId, message.id, [foundEmoji]);
    const createEmoji = vi.spyOn(emojiStore, "createEmoji").mockImplementation(noop);
    const toggleEmoji = vi.spyOn(emojiStore, "toggleEmoji").mockImplementation(noop);
    const selectEmoji = useSelectEmoji(message);
    selectEmoji(THUMBS_UP);

    expect(createEmoji).not.toHaveBeenCalled();
    expect(toggleEmoji).toHaveBeenCalledExactlyOnceWith(message.roomId, foundEmoji);
  });
});
