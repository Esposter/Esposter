<script setup lang="ts">
import { useEsbabblerStore } from "@/store/esbabbler";
import { useMessageStore } from "@/store/esbabbler/message";

interface ReplyProps {
  replyRowKey: string;
}

const { replyRowKey } = defineProps<ReplyProps>();
const esbabblerStore = useEsbabblerStore();
const { userMap } = storeToRefs(esbabblerStore);
const messageStore = useMessageStore();
const { replyMap } = storeToRefs(messageStore);
const reply = computed(() => replyMap.value.get(replyRowKey));
const creator = computed(() => (reply.value ? userMap.value.get(reply.value.userId) : undefined));
</script>

<template>
  <div flex items-center gap-1>
    <template v-if="reply && creator">
      <StyledAvatar :image="creator.image" :name="creator.name" :avatar-props="{ size: 'x-small' }" />
      <span text-xs text-gray font-bold>{{ creator.name }}</span>
      <span text-xs v-html="reply.message" />
    </template>
    <template v-else>
      <v-icon pb-0.75 size="x-small" icon="mdi-reply" />
      <span pb-0.75 text-xs italic>Original message was deleted</span>
    </template>
  </div>
</template>
