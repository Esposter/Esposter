import type { PollMessageContent } from "#shared/models/message/poll/PollMessageContent";
import type { ClientMessage } from "@/models/message/ClientMessage";

import { useDataStore } from "@/store/message/data";
import { getResultAsync, getSynchronizedFunction, noop } from "@esposter/shared";

export const useVotePoll = async (
  message: () => ClientMessage,
  pollContent: () => PollMessageContent,
  isPreview: boolean,
) => {
  const { $trpc } = useNuxtApp();
  // Single-flight per poll: a second vote while one is in flight is dropped rather than racing it
  const { checkIsPending, executeMutation } = useMutation();
  const { data: session } = await useAuthSession();
  const dataStore = useDataStore();
  const { storeUpdateMessage } = dataStore;
  // Scoped to the poll bound right now rather than to anything this instance has in flight — `message` is a
  // Getter, so the surface can re-point at another poll, and a whole-instance flag would disable a radio group
  // Whose own vote landed long ago
  const isVoting = computed(() => checkIsPending(toValue(message).id));
  // An empty option id withdraws the reader's vote, as the server takes it
  const vote = async (optionId: string) => {
    const votingUserId = session.value?.user.id;
    if (!votingUserId || isPreview) return;

    const messageValue = toValue(message);
    const pollContentValue = toValue(pollContent);
    const { [votingUserId]: _previousOptionId, ...otherVotes } = pollContentValue.votes;
    const updatedMessage = JSON.stringify({
      ...pollContentValue,
      votes: optionId ? { ...otherVotes, [votingUserId]: optionId } : otherVotes,
    });
    // A vote is not an edit, so it goes to votePoll rather than updateMessage: the server owns the votes map and
    // Only the option id travels. The onUpdateMessage subscription echoes the authoritative poll back to every
    // Client including this one, so nothing is written here after the call succeeds.
    await executeMutation(
      () => $trpc.message.votePoll.mutate({ id: messageValue.id, optionId, roomId: messageValue.roomId }),
      {
        // The snapshot is taken inside applyOptimistic, so the rollback can only ever restore the body as it was
        // Before this vote was applied
        applyOptimistic: async () => {
          const previousMessage = messageValue.message;
          await storeUpdateMessage({ id: messageValue.id, message: updatedMessage, roomId: messageValue.roomId });
          // The rollback slot is synchronous and belongs to useMutation, so the store write is handed to the
          // Sanctioned fire-and-forget primitive rather than dropped
          return getSynchronizedFunction(() =>
            getResultAsync(() =>
              storeUpdateMessage({ id: messageValue.id, message: previousMessage, roomId: messageValue.roomId }),
            ).match(noop, console.error),
          );
        },
        isExclusive: true,
        key: messageValue.id,
      },
    );
  };
  return { isVoting, vote };
};
