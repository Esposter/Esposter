// @vitest-environment nuxt
import { useSelectEmoji } from "#src/composables/message/emoji/useSelectEmoji";
import { createOptimisticMessage } from "#src/services/message/createOptimisticMessage";
import { useEmojiStore } from "#src/store/message/emoji";
import { MessageType } from "@esposter/db-schema";
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

  // The composable reads the store's own state, so the test seeds that state through the store's arrival rather than
  // Doubling the reads. Only the two writes that reach the server are spied, and they record instead of running
  // A reaction is stored as the emoji itself, so two tones of one emoji are two reactions with their own
  // Counts — Discord and Slack both behave this way, and any normalisation reintroduced here would break it
  test("treats a differently toned emoji as its own reaction", async () => {
    expect.hasAssertions();

    const emojiStore = useEmojiStore();
    const { storeEmoji } = emojiStore;
    const createEmoji = vi.spyOn(emojiStore, "createEmoji").mockResolvedValue(undefined);
    const selectEmoji = useSelectEmoji(message);
    await selectEmoji(THUMBS_UP);
    storeEmoji(message.roomId, { emojiTag: THUMBS_UP, messageId: message.id, userIds: [userId], version: 0 });
    await selectEmoji(THUMBS_UP_MEDIUM);

    expect(createEmoji.mock.calls.map(([{ emojiTag }]) => emojiTag)).toStrictEqual([THUMBS_UP, THUMBS_UP_MEDIUM]);
  });

  test("toggles the existing reaction when the same emoji comes back", async () => {
    expect.hasAssertions();

    const foundEmoji = { emojiTag: THUMBS_UP, messageId: message.id, userIds: [userId], version: 0 };
    const emojiStore = useEmojiStore();
    const { storeEmoji } = emojiStore;
    storeEmoji(message.roomId, foundEmoji);
    const createEmoji = vi.spyOn(emojiStore, "createEmoji").mockResolvedValue(undefined);
    const toggleEmoji = vi.spyOn(emojiStore, "toggleEmoji").mockResolvedValue(undefined);
    const selectEmoji = useSelectEmoji(message);
    await selectEmoji(THUMBS_UP);

    expect(createEmoji).not.toHaveBeenCalled();
    expect(toggleEmoji).toHaveBeenCalledExactlyOnceWith(message.roomId, foundEmoji);
  });
});
