<script setup lang="ts">
import type { MessageComponentProps } from "@/models/message/MessageComponentProps";
import type { StandardMessageEntity } from "@esposter/db-schema";

import { pollMessageContentSchema } from "#shared/models/message/poll/PollMessageContent";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { authClient } from "@/services/auth/authClient";
import { getOptionIdVoteCountMap } from "@/services/message/poll/getOptionIdVoteCountMap";
import { getVoteDescription } from "@/services/message/poll/getVoteDescription";
import { InvalidOperationError, jsonDateParse, Operation } from "@esposter/shared";

interface Props extends MessageComponentProps<StandardMessageEntity> {}

const { active, creator, isPreview = false, message } = defineProps<Props>();
const { data: session } = await authClient.useSession(useFetch);
const pollContent = computed(() => {
  const parsedMessage = jsonDateParse(message.message);
  const parsedPollContent = pollMessageContentSchema.safeParse(parsedMessage);
  if (parsedPollContent.success) return parsedPollContent.data;
  else throw new InvalidOperationError(Operation.Read, message.rowKey, parsedPollContent.error.message);
});
const totalVoteCount = computed(() => Object.keys(pollContent.value.votes).length);
const optionIdVoteCountMap = computed(() => getOptionIdVoteCountMap(pollContent.value.votes));
const userId = computed(() => session.value?.user.id);
const totalVoteDescription = computed(() => getVoteDescription(totalVoteCount.value));
const pollOptionItems = computed(() => pollContent.value.options.map(({ id, label }) => ({ title: label, value: id })));
const { isVoting, vote } = await useVotePoll(
  () => message,
  () => pollContent.value,
  isPreview,
);
</script>

<template>
  <MessageModelMessageTypeListItem :active :is-preview>
    <template #prepend>
      <span text-muted flex h-8 items-center>
        <span class="i-mdi:poll" aria-hidden="true" size-6 />
      </span>
    </template>
    <div flex flex-wrap gap-x-1 min-h-8 items-center>
      <span>{{ creator.name }}</span>
      <span text-muted>created a poll</span>
      <MessageModelMessageCreatedAtDate :created-at="message.createdAt" />
    </div>
    <!-- The poll is a thing of its own inside the message, so it is framed: the question over its answers, each with
      Its share of the votes under it -->
    <section p-3 flex flex-col gap-2 max-w-140 ui-frame>
      <h3 ui-heading>{{ pollContent.question }}</h3>
      <UiRadioGroup
        v-if="userId"
        :model-value="pollContent.votes[userId]"
        :is-disabled="isPreview || isVoting"
        :items="pollOptionItems"
        :label="pollContent.question"
        @update:model-value="
          async (optionId) => {
            if (optionId) await vote(optionId);
          }
        "
      >
        <template #append="{ value }">
          <MessageModelMessageTypePollOption
            :label="pollOptionItems.find((pollOptionItem) => pollOptionItem.value === value)?.title ?? ''"
            :total-vote-count
            :vote-count="optionIdVoteCountMap.get(value) ?? 0"
          />
        </template>
      </UiRadioGroup>
      <!-- A vote can be taken back, as Discord's can, from beside the count it would leave -->
      <div flex gap-2 min-h-8 items-center justify-between>
        <span text-sm text-muted>{{ totalVoteDescription }}</span>
        <UiButton
          v-if="userId && pollContent.votes[userId] && !isPreview"
          :disabled="isVoting"
          :variant="UiButtonVariant.Quiet"
          @click="vote('')"
        >
          Remove vote
        </UiButton>
      </div>
    </section>
    <MessageModelMessageEmojiList :is-preview :message />
  </MessageModelMessageTypeListItem>
</template>
