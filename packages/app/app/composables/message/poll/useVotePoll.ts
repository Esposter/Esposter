import type { PollMessageContent } from "#shared/models/message/poll/PollMessageContent";
import type { StandardMessageEntity } from "@esposter/db-schema";

import { getSynchronizedFunction } from "#shared/util/function/getSynchronizedFunction";
import { authClient } from "@/services/auth/authClient";
import { useDataStore } from "@/store/message/data";
import { getResultAsync, noop } from "@esposter/shared";

export const useVotePoll = async (
  message: () => StandardMessageEntity,
  pollContent: () => PollMessageContent,
  isPreview: boolean,
) => {
  const { $trpc } = useNuxtApp();
  // Single-flight per poll: a second vote while one is in flight is dropped rather than racing it
  const { checkIsPending, executeMutation } = useMutation();
  const { data: session } = await authClient.useSession(useFetch);
  const dataStore = useDataStore();
  const { storeUpdateMessage } = dataStore;
  const userId = computed(() => session.value?.user.id);
  // Scoped to the poll bound right now rather than to anything this instance has in flight — `message` is a
  // Getter, so the surface can re-point at another poll, and a whole-instance flag would disable a radio group
  // Whose own vote landed long ago
  const isVoting = computed(() => checkIsPending(toValue(message).rowKey));
  // The option id is bound straight to v-radio-group's update:model-value, whose Vuetify emit type is `string | null`
  const vote = async (optionId: null | string) => {
    if (!userId.value || isPreview) return;

    const votingUserId = userId.value;
    const messageValue = toValue(message);
    const pollContentValue = toValue(pollContent);
    const updatedVotes = { ...pollContentValue.votes };
    if (optionId) updatedVotes[votingUserId] = optionId;
    else delete updatedVotes[votingUserId];
    const updatedMessage = JSON.stringify({ ...pollContentValue, votes: updatedVotes });
    // A vote is not an edit, so it goes to votePoll rather than updateMessage: the server owns the votes map and
    // Only the option id travels. The onUpdateMessage subscription echoes the authoritative poll back to every
    // Client including this one, so nothing is written here after the call succeeds.
    await executeMutation(
      () =>
        $trpc.message.votePoll.mutate({
          optionId: optionId ?? "",
          partitionKey: messageValue.partitionKey,
          rowKey: messageValue.rowKey,
        }),
      {
        // The snapshot is taken inside applyOptimistic, so the rollback can only ever restore the body as it was
        // Before this vote was applied
        applyOptimistic: async () => {
          const previousMessage = messageValue.message;
          await storeUpdateMessage({
            message: updatedMessage,
            partitionKey: messageValue.partitionKey,
            rowKey: messageValue.rowKey,
          });
          // The rollback slot is synchronous and belongs to useMutation, so the store write is handed to the
          // Sanctioned fire-and-forget primitive rather than dropped
          return getSynchronizedFunction(() =>
            getResultAsync(() =>
              storeUpdateMessage({
                message: previousMessage,
                partitionKey: messageValue.partitionKey,
                rowKey: messageValue.rowKey,
              }),
            ).match(noop, console.error),
          );
        },
        isExclusive: true,
        key: messageValue.rowKey,
      },
    );
  };
  return { isVoting, vote };
};
