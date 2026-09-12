// @vitest-environment nuxt
import type { PollMessageContent } from "#shared/models/message/poll/PollMessageContent";

import { useVotePoll } from "@/composables/message/poll/useVotePoll";
import { useSession } from "@/services/auth/authClient.test";
import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { MessageType, StandardMessageEntity } from "@esposter/db-schema";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock(import("@/services/auth/authClient"), () => import("@/services/auth/authClient.test"));

describe(useVotePoll, () => {
  const server = setupMswTrpc();
  const roomId = crypto.randomUUID();
  const userId = crypto.randomUUID();
  const optionId = crypto.randomUUID();
  const pollContent: PollMessageContent = {
    options: [{ id: optionId, label: "label" }],
    question: "question",
    votes: {},
  };
  const createPollMessage = (rowKey: string) =>
    new StandardMessageEntity({
      createdAt: new Date(0),
      message: JSON.stringify(pollContent),
      partitionKey: roomId,
      rowKey,
      type: MessageType.Poll,
      updatedAt: new Date(0),
      userId,
    });

  beforeEach(() => {
    setActivePinia(createPinia());
    useSession.mockReturnValue({ data: ref({ user: { id: userId } }) });
  });

  // The poll is a getter, so one instance answers for whatever the surface points it at. Read off the whole
  // Instance instead, the flag says "this composable has a vote somewhere in flight" — which disables the radio
  // Group of a poll that has none, and keeps it disabled for as long as the other poll's vote takes
  test("reports voting only for the poll it is bound to", async () => {
    expect.hasAssertions();

    const message = createPollMessage("first");
    const otherMessage = createPollMessage("second");
    const { promise: voteReleased, resolve: releaseVote } = Promise.withResolvers<void>();
    server.use(
      trpcMsw.message.votePoll.mutation(async () => {
        await voteReleased;
      }),
    );
    // Shallow so the entity is not deep-proxied — only the swap between polls has to be tracked
    const currentMessage = shallowRef(message);
    const { isVoting, vote } = await useVotePoll(
      () => currentMessage.value,
      () => pollContent,
      false,
    );
    const voting = vote(optionId);

    expect(isVoting.value).toBe(true);

    currentMessage.value = otherMessage;

    expect(isVoting.value).toBe(false);

    releaseVote();
    await voting;

    expect(isVoting.value).toBe(false);
  });
});
