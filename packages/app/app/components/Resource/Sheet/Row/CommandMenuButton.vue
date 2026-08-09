<script setup lang="ts" generic="TValue extends PropertyKey">
import type { SelectItemCategoryDefinition } from "@/models/vuetify/SelectItemCategoryDefinition";

import { DENSE_ICON_BUTTON_PROPS } from "@/services/shared/constants";

interface CommandMenuButtonProps<TValue> {
  icon: string;
  items: SelectItemCategoryDefinition<TValue>[];
  text: string;
}

const { icon, items, text } = defineProps<CommandMenuButtonProps<TValue>>();
const emit = defineEmits<{ select: [value: TValue] }>();
</script>

<template>
  <StyledTooltipMenuIconButton :button-props="DENSE_ICON_BUTTON_PROPS" :icon :text>
    <v-list density="compact">
      <v-list-item v-for="{ title, value } of items" :key="value" :title @click="emit('select', value)" />
    </v-list>
  </StyledTooltipMenuIconButton>
</template>
