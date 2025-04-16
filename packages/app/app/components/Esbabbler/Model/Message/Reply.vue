<script setup lang="ts">
import { useMessageStore } from "@/store/esbabbler/message";

interface ReplyProps {
  replyRowKey: string;
}

const { replyRowKey } = defineProps<ReplyProps>();
const messageStore = useMessageStore();
const { creatorMap, replyMap } = storeToRefs(messageStore);
const reply = computed(() => replyMap.value.get(replyRowKey));
const creator = computed(() => (reply.value ? creatorMap.value.get(reply.value.userId) : undefined));
</script>

<template>
  <div relative flex items-center>
    <div flex items-center gap-1>
      <template v-if="reply && creator">
        <StyledAvatar :image="creator.image" :name="creator.name" :avatar-props="{ size: 'x-small' }" />
        <span text-xs text-gray font-bold>{{ creator.name }}</span>
        <span text-xs v-html="reply.message" />
      </template>
      <template v-else>
        <v-icon size="x-small" icon="mdi-reply" />
        <span text-xs italic>Original message was deleted</span>
      </template>
    </div>
  </div>
</template>
