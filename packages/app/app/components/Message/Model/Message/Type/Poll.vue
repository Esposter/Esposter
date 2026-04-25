<script setup lang="ts">
import type { MessageComponentProps } from "@/services/message/MessageComponentMap";
import type { StandardMessageEntity } from "@esposter/db-schema";

import { pollMessageContentSchema } from "@/models/message/poll/PollMessageContent";
import { authClient } from "@/services/auth/authClient";
import { useDataStore } from "@/store/message/data";
import { InvalidOperationError, jsonDateParse, Operation } from "@esposter/shared";

interface PollProps extends MessageComponentProps<StandardMessageEntity> {}

const { active, creator, isPreview = false, isSameBatch, message } = defineProps<PollProps>();
const { data: session } = await authClient.useSession(useFetch);
const dataStore = useDataStore();
const { storeUpdateMessage, updateMessage } = dataStore;
const pollContent = computed(() => {
  const parsedMessage = jsonDateParse(message.message);
  const result = pollMessageContentSchema.safeParse(parsedMessage);
  if (!result.success) throw new InvalidOperationError(Operation.Read, message.rowKey, result.error.message);
  return result.data;
});
const totalVotes = computed(() => Object.keys(pollContent.value.votes).length);
const voteCountMap = computed(() => {
  const map = new Map<string, number>();
  for (const optionId of Object.values(pollContent.value.votes)) map.set(optionId, (map.get(optionId) ?? 0) + 1);
  return map;
});
const getVoteDescription = (count: number) => `${count} vote${count === 1 ? "" : "s"}`;
const getVotePercentage = (optionId: string) => {
  const count = voteCountMap.value.get(optionId) ?? 0;
  return totalVotes.value > 0 ? Math.round((count / totalVotes.value) * 100) : 0;
};
const isVoting = ref(false);
const userId = computed(() => session.value?.user.id);
const vote = async (optionId: null | string) => {
  if (!userId.value || isPreview || isVoting.value) return;
  isVoting.value = true;
  const previousMessage = message.message;
  const updatedVotes = { ...pollContent.value.votes };
  if (optionId === null) delete updatedVotes[userId.value];
  else updatedVotes[userId.value] = optionId;
  const updatedMessage = JSON.stringify({ ...pollContent.value, votes: updatedVotes });
  await storeUpdateMessage({ message: updatedMessage, partitionKey: message.partitionKey, rowKey: message.rowKey });
  try {
    await updateMessage({ message: updatedMessage, partitionKey: message.partitionKey, rowKey: message.rowKey });
  } catch (error) {
    await storeUpdateMessage({ message: previousMessage, partitionKey: message.partitionKey, rowKey: message.rowKey });
    throw error;
  } finally {
    isVoting.value = false;
  }
};
</script>

<template>
  <MessageModelMessageTypeListItem :active :is-preview :is-same-batch>
    <template #prepend>
      <v-icon icon="mdi-poll" size="small" />
    </template>
    <span font-bold>{{ creator.name }}</span>
    <span text-gray> created a poll </span>
    <MessageModelMessageCreatedAtDate :created-at="message.createdAt" />
    <v-card mt-2 variant="outlined" w-full>
      <v-card-title>{{ pollContent.question }}</v-card-title>
      <v-card-text>
        <v-radio-group
          v-if="userId"
          :model-value="pollContent.votes[userId]"
          :disabled="isPreview || isVoting"
          color="primary"
          hide-details
          @update:model-value="vote"
        >
          <template v-for="{ id, label } of pollContent.options" :key="id">
            <v-radio :value="id">
              <template #label>
                <div flex w-full>
                  <div flex-1>{{ label }}</div>
                  <div text-caption text-medium-emphasis>
                    {{ getVoteDescription(voteCountMap.get(id) ?? 0) }} · {{ getVotePercentage(id) }}%
                  </div>
                </div>
              </template>
            </v-radio>
            <v-progress-linear :model-value="getVotePercentage(id)" color="primary" mb-3 />
          </template>
          <v-list-subheader>{{ getVoteDescription(totalVotes) }}</v-list-subheader>
        </v-radio-group>
      </v-card-text>
    </v-card>
    <MessageModelMessageEmojiList :is-preview :message />
  </MessageModelMessageTypeListItem>
</template>

<style scoped lang="scss">
:deep(.v-label) {
  width: 100%;
}
</style>
