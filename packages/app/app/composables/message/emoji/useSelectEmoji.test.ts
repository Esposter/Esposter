// @vitest-environment nuxt
import type { CreateEmojiInput } from "#shared/models/db/message/metadata/CreateEmojiInput";
import type { DeleteEmojiInput } from "#shared/models/db/message/metadata/DeleteEmojiInput";
import type { MessageEmojiMetadataEntity } from "#shared/models/db/message/metadata/MessageEmojiMetadataEntity";
import type { UpdateEmojiInput } from "#shared/models/db/message/metadata/UpdateEmojiInput";

import { useSelectEmoji } from "@/composables/message/emoji/useSelectEmoji";
import { createMessageEntity, MessageType } from "@esposter/db-schema";
import { beforeEach, describe, expect, test, vi } from "vitest";
// Hoisted above the imports by `vi.mock`, so unlike a plain constant these cannot live inside the describe
const { createEmoji, deleteEmoji, emojis, updateEmoji, useSessionMock } = vi.hoisted(() => ({
  createEmoji: vi.fn<(input: CreateEmojiInput) => Promise<void>>(),
  deleteEmoji: vi.fn<(input: DeleteEmojiInput) => Promise<void>>(),
  // Only the two fields the composable matches and toggles on, so the double states its own contract
  emojis: new Array<Pick<MessageEmojiMetadataEntity, "emojiTag" | "userIds">>(),
  updateEmoji: vi.fn<(input: UpdateEmojiInput) => Promise<void>>(),
  useSessionMock: vi.fn<() => Promise<{ data: Ref<{ user: { id: string } }> }>>(),
}));

// AuthClient is a better-auth dynamic-path Proxy, so useSession is not a configurable own property and cannot
// Be spied on — the module is mocked instead, and the single cast is what standing in for that Proxy costs
vi.mock(import("@/services/auth/authClient"), () => ({
  authClient: { useSession: useSessionMock } as unknown as (typeof import("@/services/auth/authClient"))["authClient"],
}));
// The composable reads four members off the store and nothing else, so the double is those four — the cast is
// What standing in for a Pinia store's full surface costs, and it is the only one this double needs
vi.mock(import("@/store/message/emoji"), () => ({
  useEmojiStore: (() => ({
    createEmoji,
    deleteEmoji,
    getEmojis: () => emojis,
    updateEmoji,
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
    useSessionMock.mockResolvedValue({ data: ref({ user: { id: userId } }) });
  });

  // A reaction is stored as the emoji itself, so two tones of one emoji are two reactions with their own
  // Counts — Discord and Slack both behave this way, and any normalisation reintroduced here would break it
  test("treats a differently toned emoji as its own reaction", async () => {
    expect.hasAssertions();

    const selectEmoji = await useSelectEmoji(message);
    await selectEmoji(THUMBS_UP);
    emojis.push({ emojiTag: THUMBS_UP, userIds: [userId] });
    await selectEmoji(THUMBS_UP_MEDIUM);

    expect(createEmoji.mock.calls.map(([{ emojiTag }]) => emojiTag)).toStrictEqual([THUMBS_UP, THUMBS_UP_MEDIUM]);
  });

  test("toggles the existing reaction when the same emoji comes back", async () => {
    expect.hasAssertions();

    emojis.push({ emojiTag: THUMBS_UP, userIds: [userId] });
    const selectEmoji = await useSelectEmoji(message);
    await selectEmoji(THUMBS_UP);

    expect(createEmoji).not.toHaveBeenCalled();
    expect(deleteEmoji).toHaveBeenCalledTimes(1);
  });
});
