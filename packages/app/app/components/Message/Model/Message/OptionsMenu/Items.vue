<script setup lang="ts">
import type { MessageEntity } from "@esposter/db-schema";

interface OptionsMenuItemsProps {
  message: MessageEntity;
}

const { message } = defineProps<OptionsMenuItemsProps>();
const emit = defineEmits<{
  "update:forward": [rowKey: string];
  "update:pin": [value: true];
  "update:reply": [rowKey: string];
  "update:update-mode": [value: true];
}>();
const isMessageCreator = await useIsMessageCreator(() => message);
const isEditable = computed(() => isMessageCreator.value && !message.isForward);
const { updateMessageItems } = useMessageActionItems(message, isEditable, isMessageCreator, {
  onForward: (rowKey) => emit("update:forward", rowKey),
  onPin: (value) => emit("update:pin", value),
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
      <v-btn m-0 :icon size="small" tile :="props" @click="onClick" />
    </template>
  </v-tooltip>
</template>
