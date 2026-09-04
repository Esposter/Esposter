<script setup lang="ts">
import type { MessageComponentProps } from "@/models/message/MessageComponentProps";
import type { StandardMessageEntity } from "@esposter/db-schema";

import { pollMessageContentSchema } from "#shared/models/message/poll/PollMessageContent";
import { authClient } from "@/services/auth/authClient";
import { getOptionIdVoteCountMap } from "@/services/message/poll/getOptionIdVoteCountMap";
import { getVoteDescription } from "@/services/message/poll/getVoteDescription";
import { InvalidOperationError, jsonDateParse, Operation } from "@esposter/shared";

interface PollProps extends MessageComponentProps<StandardMessageEntity> {}

const { active, creator, isPreview = false, message } = defineProps<PollProps>();
const { data: session } = await authClient.useSession(useFetch);
const pollContent = computed(() => {
  const parsedMessage = jsonDateParse(message.message);
  const result = pollMessageContentSchema.safeParse(parsedMessage);
  if (!result.success) throw new InvalidOperationError(Operation.Read, message.rowKey, result.error.message);
  return result.data;
});
const totalVoteCount = computed(() => Object.keys(pollContent.value.votes).length);
const optionIdVoteCountMap = computed(() => getOptionIdVoteCountMap(pollContent.value.votes));
const userId = computed(() => session.value?.user.id);
const totalVoteDescription = computed(() => getVoteDescription(totalVoteCount.value));
const { isVoting, vote } = await useVotePoll(
  () => message,
  () => pollContent.value,
  isPreview,
);
</script>

<template>
  <MessageModelMessageTypeListItem :active :is-preview>
    <template #prepend>
      <v-icon icon="mdi-poll" size="small" />
    </template>
    <span font-bold>{{ creator.name }}</span>
    <span op-medium-emphasis> created a poll </span>
    <MessageModelMessageCreatedAtDate :created-at="message.createdAt" />
    <v-card variant="outlined" mt-2 w-full>
      <v-card-title>{{ pollContent.question }}</v-card-title>
      <v-card-text>
        <v-radio-group
          v-if="userId"
          :model-value="pollContent.votes[userId]"
          :disabled="isPreview || isVoting"
          color="primary"
          @update:model-value="vote"
        >
          <MessageModelMessageTypePollOption
            v-for="{ id, label } of pollContent.options"
            :id
            :key="id"
            :label
            :total-vote-count
            :vote-count="optionIdVoteCountMap.get(id) ?? 0"
          />
          <v-list-subheader>{{ totalVoteDescription }}</v-list-subheader>
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
