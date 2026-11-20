// @vitest-environment nuxt
import type { PollMessageContent } from "#shared/models/message/poll/PollMessageContent";

import { useVotePoll } from "#src/composables/message/poll/useVotePoll";
import { useSession } from "#src/services/auth/authClient.test";
import { createOptimisticMessage } from "#src/services/message/createOptimisticMessage";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useDataStore } from "#src/store/message/data";
import { MessageType } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { flushPromises } from "@vue/test-utils";
import { v7 } from "uuid";
import { beforeEach, describe, expect, test, vi } from "vitest";

describe(useVotePoll, () => {
  const { trpcMsw } = setupMswTrpc();
  const roomId = v7();
  const userId = v7();
  const otherUserId = v7();
  const otherRoomId = v7();
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
      return message;
    });
    const { vote } = await useVotePoll(() => message, false);
    vote("");
    await flushPromises();

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
      return message;
    });
    // Shallow so the entity is not deep-proxied — only the swap between polls has to be tracked
    const currentMessage = shallowRef(message);
    const { isVoting, vote } = await useVotePoll(() => currentMessage.value, false);
    vote(optionId);

    expect(isVoting.value).toBe(true);

    currentMessage.value = otherMessage;

    expect(isVoting.value).toBe(false);

    releaseVote();
    await flushPromises();

    expect(isVoting.value).toBe(false);
  });

  // A message id is only unique within its room, so a poll with the same id in another room is not voting while this one is
  test("reports voting only for the room the vote was cast in", async () => {
    expect.hasAssertions();

    const message = createPollMessage(1);
    const otherRoomMessage = { ...createPollMessage(1), roomId: otherRoomId };
    const { promise: voteReleased, resolve: releaseVote } = Promise.withResolvers<void>();
    trpcMsw.message.votePoll.mutation(async () => {
      await voteReleased;
      return message;
    });
    const currentMessage = shallowRef(message);
    const { isVoting, vote } = await useVotePoll(() => currentMessage.value, false);
    vote(optionId);
    currentMessage.value = otherRoomMessage;

    expect(isVoting.value).toBe(false);

    releaseVote();
    await flushPromises();
  });

  // A refused vote changes nothing. The optimistic apply used to restore the poll as it stood before the vote, and that
  // Restore landed over a newer poll the room had sent while the vote was in flight
  test("a refused vote leaves a newer poll the room sent in place", async () => {
    expect.hasAssertions();

    const { promise: refusalReleased, resolve: releaseRefusal } = Promise.withResolvers<void>();
    trpcMsw.message.votePoll.mutation(async () => {
      await refusalReleased;
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });
    const dataStore = useDataStore();
    const { getSlice, storeUpdateMessage } = dataStore;
    const message = { ...createPollMessage(1), version: 1 };
    getSlice(roomId).items.value = [message];
    const { vote } = await useVotePoll(() => message, false);
    vote(optionId);
    const newerPoll = JSON.stringify({ ...pollContent, votes: { [otherUserId]: optionId } });
    await storeUpdateMessage({ id: message.id, message: newerPoll, roomId, version: 2 });
    releaseRefusal();
    await flushPromises();

    expect(takeOne(getSlice(roomId).items.value).message).toBe(newerPoll);
  });

  // The room answers a vote with the poll it stores. A newer poll can reach the screen before that answer lands, and an
  // Answer that names the older version must not put its poll back over it
  test("a vote answer naming an older version that lands last keeps the newer poll", async () => {
    expect.hasAssertions();

    const { promise: answerReleased, resolve: releaseAnswer } = Promise.withResolvers<void>();
    trpcMsw.message.votePoll.mutation(async () => {
      await answerReleased;
      return {
        ...createPollMessage(1),
        message: JSON.stringify({ ...pollContent, votes: { [userId]: optionId } }),
        version: 2,
      };
    });
    const dataStore = useDataStore();
    const { getSlice, storeUpdateMessage } = dataStore;
    const message = { ...createPollMessage(1), version: 1 };
    getSlice(roomId).items.value = [message];
    const { vote } = await useVotePoll(() => message, false);
    vote(optionId);
    const newerPoll = JSON.stringify({ ...pollContent, votes: { [otherUserId]: optionId } });
    await storeUpdateMessage({ id: message.id, message: newerPoll, roomId, version: 3 });
    releaseAnswer();
    await flushPromises();

    expect(takeOne(getSlice(roomId).items.value).message).toBe(newerPoll);
  });
});
