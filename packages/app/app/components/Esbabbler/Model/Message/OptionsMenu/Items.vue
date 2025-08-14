<script setup lang="ts">
import type { MessageEntity } from "#shared/models/db/message/MessageEntity";

import { useMessageActionItems } from "@/composables/esbabbler/useMessageActionItems";
import { authClient } from "@/services/auth/authClient";

interface OptionsMenuItemsProps {
  message: MessageEntity;
}

const { message } = defineProps<OptionsMenuItemsProps>();
const emit = defineEmits<{
  "update:forward": [rowKey: string];
  "update:reply": [rowKey: string];
  "update:update-mode": [value: true];
}>();
const { data: session } = await authClient.useSession(useFetch);
const isCreator = computed(() => session.value?.user.id === message.userId);
const isEditable = computed(() => isCreator.value && !message.isForward);
const { updateMessageItems } = useMessageActionItems(message, isEditable, isCreator, {
  onForward: (rowKey) => emit("update:forward", rowKey),
  onReply: (rowKey) => emit("update:reply", rowKey),
  onUpdateMode: () => emit("update:update-mode", true),
});
</script>

<template>
  <v-tooltip
    v-for="{ icon, shortTitle, title, onClick } of updateMessageItems"
    :key="title"
    :text="shortTitle ?? title"
  >
    <template #activator="{ props }">
      <v-btn m-0="!" rd-none="!" :icon size="small" :="props" @click="onClick" />
    </template>
  </v-tooltip>
</template>
