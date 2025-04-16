<script setup lang="ts">
import { useMessageStore } from "@/store/esbabbler/message";

interface ReplyMessageProps {
  replyToMessageRowKey: string;
}

const { replyToMessageRowKey } = defineProps<ReplyMessageProps>();
const messageStore = useMessageStore();
const { creatorMap, replyMap } = storeToRefs(messageStore);
const reply = computed(() => replyMap.value.get(replyToMessageRowKey));
const creator = computed(() => (reply.value ? creatorMap.value.get(reply.value.userId) : undefined));
</script>

<template>
  <div relative flex items-center>
    <template v-if="reply && creator">
      <div flex items-center gap-1>
        <StyledAvatar :image="creator.image" :name="creator.name" :avatar-props="{ size: 'x-small' }" />
        <span text-xs text-gray font-bold>{{ creator.name }}</span>
        <span text-xs v-html="reply.message" />
      </div>
    </template>
    <template v-else>
      <v-icon mr-1 size="x-small" icon="mdi-reply" />
      <span text-xs italic>Original message was deleted</span>
    </template>
  </div>
</template>
