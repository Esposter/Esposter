<script setup lang="ts">
import type { MessageComponentProps } from "@/models/message/MessageComponentProps";
import type { StandardMessageEntity } from "@esposter/db-schema";

import { pollMessageContentSchema } from "#shared/models/message/poll/PollMessageContent";
import { useVotePoll } from "@/composables/message/poll/useVotePoll";
import { authClient } from "@/services/auth/authClient";
import { getVoteCountMap } from "@/services/message/poll/getVoteCountMap";
import { getVoteDescription } from "@/services/message/poll/getVoteDescription";
import { InvalidOperationError, jsonDateParse, Operation } from "@esposter/shared";

interface PollProps extends MessageComponentProps<StandardMessageEntity> {}

const { active, creator, isPreview = false, isSameBatch, message } = defineProps<PollProps>();
const { data: session } = await authClient.useSession(useFetch);
const pollContent = computed(() => {
  const parsedMessage = jsonDateParse(message.message);
  const result = pollMessageContentSchema.safeParse(parsedMessage);
  if (!result.success) throw new InvalidOperationError(Operation.Read, message.rowKey, result.error.message);
  return result.data;
});
const totalVotes = computed(() => Object.keys(pollContent.value.votes).length);
const voteCountMap = computed(() => getVoteCountMap(pollContent.value.votes));
const getVotePercentage = (optionId: string) => {
  const count = voteCountMap.value.get(optionId) ?? 0;
  return totalVotes.value > 0 ? Math.round((count / totalVotes.value) * 100) : 0;
};
const userId = computed(() => session.value?.user.id);
const { isVoting, vote } = await useVotePoll(
  () => message,
  () => pollContent.value,
  isPreview,
);
</script>

<template>
  <MessageModelMessageTypeListItem :active :is-preview :is-same-batch>
    <template #prepend>
      <v-icon icon="mdi-poll" size="small" />
    </template>
    <span font-bold>{{ creator.name }}</span>
    <span text-gray> created a poll </span>
    <MessageModelMessageCreatedAtDate :created-at="message.createdAt" />
    <v-card variant="outlined" mt-2 w-full>
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
                  <div text-hint>
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

<style scoped>
:deep(.v-label) {
  width: 100%;
}
</style>
