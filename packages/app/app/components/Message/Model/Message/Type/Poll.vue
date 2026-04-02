<script setup lang="ts">
import type { MessageComponentProps } from "@/services/message/MessageComponentMap";
import type { StandardMessageEntity } from "@esposter/db-schema";

import { pollMessageContentSchema } from "@/models/message/poll/PollMessageContent";
import { authClient } from "@/services/auth/authClient";
import { useDataStore } from "@/store/message/data";
import { InvalidOperationError, jsonDateParse, Operation } from "@esposter/shared";

interface PollProps extends MessageComponentProps<StandardMessageEntity> {}

const { active, creator, isPreview = false, isSameBatch, message } = defineProps<PollProps>();
const session = authClient.useSession();
const dataStore = useDataStore();
const { storeUpdateMessage, updateMessage } = dataStore;

const pollContent = computed(() => {
  const parsedMessage = jsonDateParse(message.message);
  const result = pollMessageContentSchema.safeParse(parsedMessage);
  if (!result.success) throw new InvalidOperationError(Operation.Read, message.rowKey, result.error.message);
  return result.data;
});

const totalVotes = computed(() => Object.keys(pollContent.value.votes).length);
const currentUserId = computed(() => session.value.data?.user.id ?? "");
const currentVoteOptionId = computed(() => pollContent.value.votes[currentUserId.value] ?? null);
const voteCountMap = computed(() => {
  const map: Record<string, number> = {};
  for (const optionId of Object.values(pollContent.value.votes)) map[optionId] = (map[optionId] ?? 0) + 1;
  return map;
});
const isVoting = ref(false);
const vote = async (optionId: string) => {
  if (!currentUserId.value || isPreview || isVoting.value) return;
  isVoting.value = true;
  const previousMessage = message.message;
  const updatedVotes = { ...pollContent.value.votes };
  if (updatedVotes[currentUserId.value] === optionId) delete updatedVotes[currentUserId.value];
  else updatedVotes[currentUserId.value] = optionId;
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
    <span text-gray> created a poll</span>
    <MessageModelMessageCreatedAtDate :created-at="message.createdAt" />
    <v-card mt-2 variant="outlined" w-full>
      <v-card-text>
        <p font-semibold mb-3>{{ pollContent.question }}</p>
        <div flex flex-col gap-2>
          <v-btn
            v-for="{ id, label } of pollContent.options"
            :key="id"
            :color="currentVoteOptionId === id ? 'primary' : undefined"
            :disabled="isPreview || !currentUserId || isVoting"
            block
            variant="tonal"
            @click="vote(id)"
          >
            <span>{{ label }}</span>
            <span ml-auto opacity-70>{{ voteCountMap[id] ?? 0 }}</span>
          </v-btn>
        </div>
        <p mt-2 text-sm text-gray>{{ totalVotes }} vote{{ totalVotes !== 1 ? "s" : "" }}</p>
      </v-card-text>
    </v-card>
    <MessageModelMessageEmojiList :is-preview :message />
  </MessageModelMessageTypeListItem>
</template>
