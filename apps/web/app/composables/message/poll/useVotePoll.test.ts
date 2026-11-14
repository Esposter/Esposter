// @vitest-environment nuxt
import type { PollMessageContent } from "#shared/models/message/poll/PollMessageContent";

import { useVotePoll } from "@/composables/message/poll/useVotePoll";
import { useSession } from "@/services/auth/authClient.test";
import { createOptimisticMessage } from "@/services/message/createOptimisticMessage";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { MessageType } from "@esposter/db-schema";
import { v7 } from "uuid";
import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock(import("@/services/auth/authClient"), () => import("@/services/auth/authClient.test"));

describe(useVotePoll, () => {
  const { trpcMsw } = setupMswTrpc();
  const roomId = v7();
  const userId = v7();
  const optionId = v7();
  const pollContent: PollMessageContent = {
    options: [{ id: optionId, label: "label" }],
    question: "question",
    votes: {},
  };
  // A vote names the message by its room-assigned id, which an optimistic bubble does not have yet
  const createPollMessage = (id: number) => ({
    ...createOptimisticMessage({ message: JSON.stringify(pollContent), roomId, type: MessageType.Poll }, userId),
    id,
  });

  beforeEach(() => {
    useSession.mockReturnValue({ data: ref({ user: { id: userId } }) });
  });

  // The server withdraws a vote on an empty option id, so taking one back is that id and never a missing field
  test("withdraws with an empty option id", async () => {
    expect.hasAssertions();

    const message = createPollMessage(1);
    const votePoll = vi.fn<(input: { id: number; optionId: string; roomId: string }) => void>();
    trpcMsw.message.votePoll.mutation(({ input }) => {
      votePoll(input);
    });
    const { vote } = await useVotePoll(
      () => message,
      () => ({ ...pollContent, votes: { [userId]: optionId } }),
      false,
    );
    await vote("");

    expect(votePoll).toHaveBeenCalledExactlyOnceWith({ id: message.id, optionId: "", roomId });
  });

  // The poll is a getter, so one instance answers for whatever the surface points it at. Read off the whole
  // Instance instead, the flag says "this composable has a vote somewhere in flight" — which disables the radio
  // Group of a poll that has none, and keeps it disabled for as long as the other poll's vote takes
  test("reports voting only for the poll it is bound to", async () => {
    expect.hasAssertions();

    const message = createPollMessage(1);
    const otherMessage = createPollMessage(2);
    const { promise: voteReleased, resolve: releaseVote } = Promise.withResolvers<void>();
    trpcMsw.message.votePoll.mutation(async () => {
      await voteReleased;
    });
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
