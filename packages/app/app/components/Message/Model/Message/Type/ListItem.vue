<script setup lang="ts">
import type { MessageComponentProps } from "@/services/message/MessageComponentMap";
import type { VListItem } from "vuetify/components";

interface ListItemProps extends Pick<MessageComponentProps, "isPreview"> {
  active?: boolean;
}

const { active, isPreview = false } = defineProps<ListItemProps>();
const slots = defineSlots<Record<keyof VListItem["$slots"], () => VNode>>();
</script>

<template>
  <v-list-item :style="isPreview ? { pointerEvents: 'none', userSelect: 'none' } : undefined" :active>
    <template v-for="(_slot, name) of slots" #[name]="scope">
      <slot :name :="{ ...scope }" />
    </template>
  </v-list-item>
</template>
