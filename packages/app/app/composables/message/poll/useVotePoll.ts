import type { PollMessageContent } from "@/models/message/poll/PollMessageContent";
import type { StandardMessageEntity } from "@esposter/db-schema";

import { authClient } from "@/services/auth/authClient";
import { useAlertStore } from "@/store/alert";
import { useDataStore } from "@/store/message/data";
import { getResultAsync, noop, withFinalizerAsync } from "@esposter/shared";

export const useVotePoll = async (
  message: () => StandardMessageEntity,
  pollContent: () => PollMessageContent,
  isPreview: boolean,
) => {
  const { data: session } = await authClient.useSession(useFetch);
  const { createAlert } = useAlertStore();
  const dataStore = useDataStore();
  const { storeUpdateMessage, updateMessage } = dataStore;
  const isVoting = ref(false);
  const userId = computed(() => session.value?.user.id);
  // The option id is bound straight to v-radio-group's update:model-value, whose Vuetify emit type is `string | null`
  const vote = async (optionId: null | string) => {
    if (!userId.value || isPreview || isVoting.value) return;
    isVoting.value = true;
    const messageValue = toValue(message);
    const pollContentValue = toValue(pollContent);
    const previousMessage = messageValue.message;
    const updatedVotes = { ...pollContentValue.votes };
    if (optionId) updatedVotes[userId.value] = optionId;
    else delete updatedVotes[userId.value];
    const updatedMessage = JSON.stringify({ ...pollContentValue, votes: updatedVotes });
    await withFinalizerAsync(
      () =>
        getResultAsync(async () => {
          await storeUpdateMessage({
            message: updatedMessage,
            partitionKey: messageValue.partitionKey,
            rowKey: messageValue.rowKey,
          });
          await updateMessage({
            message: updatedMessage,
            partitionKey: messageValue.partitionKey,
            rowKey: messageValue.rowKey,
          });
        }).match(noop, async (error) => {
          // A local store write with no I/O behind it, so it needs no error boundary of its own
          await storeUpdateMessage({
            message: previousMessage,
            partitionKey: messageValue.partitionKey,
            rowKey: messageValue.rowKey,
          });
          // The radio group binds vote directly, so a rethrow here is an unhandled rejection the user never sees
          createAlert(error.message, "error");
        }),
      () => {
        isVoting.value = false;
      },
    );
  };
  return { isVoting, vote };
};
