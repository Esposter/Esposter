<script setup lang="ts">
import type { MessageComponentProps } from "@/services/message/MessageComponentMap";

interface ListItemProps extends Pick<MessageComponentProps, "isPreview"> {
  active?: boolean;
}

defineSlots<{ default?: () => VNode }>();
const { active, isPreview = false } = defineProps<ListItemProps>();
</script>

<template>
  <v-list-item :style="isPreview ? { pointerEvents: 'none', userSelect: 'none' } : undefined" :active>
    <slot />
  </v-list-item>
</template>
