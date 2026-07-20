import type { PollMessageContent } from "@/models/message/poll/PollMessageContent";
import type { StandardMessageEntity } from "@esposter/db-schema";

import { authClient } from "@/services/auth/authClient";
import { useDataStore } from "@/store/message/data";
import { getResultAsync, noop, withFinalizerAsync } from "@esposter/shared";

export const useVotePoll = async (
  message: () => StandardMessageEntity,
  pollContent: () => PollMessageContent,
  isPreview: boolean,
) => {
  const { data: session } = await authClient.useSession(useFetch);
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
          await getResultAsync(() =>
            storeUpdateMessage({
              message: previousMessage,
              partitionKey: messageValue.partitionKey,
              rowKey: messageValue.rowKey,
            }),
          ).match(noop, console.error);
          throw error;
        }),
      () => {
        isVoting.value = false;
      },
    );
  };
  return { isVoting, vote };
};
