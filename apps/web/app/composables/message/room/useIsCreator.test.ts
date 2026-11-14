// @vitest-environment nuxt
import { useIsCreator } from "@/composables/message/room/useIsCreator";
import { useSession } from "@/services/auth/authClient.test";
import { createOptimisticMessage } from "@/services/message/createOptimisticMessage";
import { MessageType } from "@esposter/db-schema";
import { v7 } from "uuid";
import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock(import("@/services/auth/authClient"), () => import("@/services/auth/authClient.test"));

describe(useIsCreator, () => {
  const roomId = v7();
  const userId = v7();

  beforeEach(() => {
    useSession.mockImplementation((fetcher?: unknown) =>
      fetcher ? { data: ref({ user: { id: userId } }) } : ref({ data: { user: { id: userId } } }),
    );
  });

  // Authorship is the message's own userId whatever the type, which is what getMessageProcedure asks. Answering
  // It only for text messages makes every Author-permitted operation on any other type — deleting or pinning
  // Your own poll — unreachable to the person who authored it, while the procedure accepts them
  test.each([MessageType.Message, MessageType.Poll] as const)("recognises the author of a %s", async (type) => {
    expect.hasAssertions();

    const message = createOptimisticMessage({ roomId, type }, userId);
    const isCreator = await useIsCreator(() => message);

    expect(isCreator.value).toBe(true);
  });

  test("does not recognise another member as the author", async () => {
    expect.hasAssertions();

    const message = createOptimisticMessage({ roomId, type: MessageType.Poll }, v7());
    const isCreator = await useIsCreator(() => message);

    expect(isCreator.value).toBe(false);
  });

  // A webhook message has a null `userId`, so an absent author must never match an absent session
  test("does not recognise an authorless webhook message as authored", async () => {
    expect.hasAssertions();

    const message = {
      ...createOptimisticMessage({ roomId, type: MessageType.Message }, userId),
      appUserId: v7(),
      senderName: "senderName",
      type: MessageType.Webhook,
      userId: null,
    };
    const isCreator = await useIsCreator(() => message);

    expect(isCreator.value).toBe(false);
  });
});
