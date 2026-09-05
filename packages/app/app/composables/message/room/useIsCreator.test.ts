// @vitest-environment nuxt
import { useIsCreator } from "@/composables/message/room/useIsCreator";
import { createMessageEntity, MessageType } from "@esposter/db-schema";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test, vi } from "vitest";
// `authClient` is a better-auth dynamic-path Proxy, so useSession is not a configurable own property and cannot
// Be spied on directly — mock the module and drive useSession through a hoisted mock instead. Its two call
// Forms return different shapes: the composable takes the nuxt `{ data }` pair, the room store takes the ref
const { useSessionMock } = vi.hoisted(() => ({ useSessionMock: vi.fn<(fetcher?: unknown) => unknown>() }));

vi.mock(import("@/services/auth/authClient"), () => ({
  authClient: { useSession: useSessionMock } as unknown as (typeof import("@/services/auth/authClient"))["authClient"],
}));

describe(useIsCreator, () => {
  const roomId = crypto.randomUUID();
  const userId = crypto.randomUUID();

  beforeEach(() => {
    setActivePinia(createPinia());
    useSessionMock.mockImplementation((fetcher?: unknown) =>
      fetcher ? { data: ref({ user: { id: userId } }) } : ref({ data: { user: { id: userId } } }),
    );
  });

  // Authorship is the message's own userId whatever the type, which is what getMessageProcedure asks. Answering
  // It only for text messages makes every Author-permitted operation on any other type — deleting or pinning
  // Your own poll — unreachable to the person who authored it, while the procedure accepts them
  test.each([MessageType.Message, MessageType.Poll] as const)("recognises the author of a %s", async (type) => {
    expect.hasAssertions();

    const message = createMessageEntity({ roomId, type, userId });
    const isCreator = await useIsCreator(() => message);

    expect(isCreator.value).toBe(true);
  });

  test("does not recognise another member as the author", async () => {
    expect.hasAssertions();

    const message = createMessageEntity({ roomId, type: MessageType.Poll, userId: crypto.randomUUID() });
    const isCreator = await useIsCreator(() => message);

    expect(isCreator.value).toBe(false);
  });

  // A webhook message declares `userId?: undefined`, so an absent author must never match an absent session
  test("does not recognise an authorless webhook message as authored", async () => {
    expect.hasAssertions();

    const message = createMessageEntity({
      appUser: {
        createdAt: new Date("1970-01-01"),
        deletedAt: null,
        id: crypto.randomUUID(),
        image: "",
        name: "name",
        updatedAt: new Date("1970-01-01"),
      },
      roomId,
      type: MessageType.Webhook,
    });
    const isCreator = await useIsCreator(() => message);

    expect(isCreator.value).toBe(false);
  });
});
