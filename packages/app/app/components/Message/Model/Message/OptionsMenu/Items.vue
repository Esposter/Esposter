<script setup lang="ts">
import type { MessageEntity } from "@esposter/db-schema";

interface OptionsMenuItemsProps {
  message: MessageEntity;
}

const { message } = defineProps<OptionsMenuItemsProps>();
const isCreator = await useIsCreator(() => message);
const isEditable = computed(() => isCreator.value && !message.isForward);
const { updateMessageItems } = useMessageActionItems(message, isEditable, isCreator);
</script>

<template>
  <StyledTooltipIconButton
    v-for="{ icon, shortTitle, title, onClick } of updateMessageItems"
    :key="title"
    :button-props="{ class: 'm-0', size: 'small', tile: true }"
    :icon
    :text="shortTitle ?? title"
    @click="onClick?.($event)"
  />
</template>
