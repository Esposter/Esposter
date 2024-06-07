<script setup lang="ts">
import type { TabItem } from "@/models/vuetify/TabItem";
import type { TabItemCategoryDefinition } from "@/models/vuetify/TabItemCategoryDefinition";

interface TabsWindowItemProps {
  item: TabItem;
}

defineSlots<{ default: (props: Record<string, never>) => unknown }>();
const { item: baseItem } = defineProps<TabsWindowItemProps>();
const item = computed(() => baseItem as TabItemCategoryDefinition);
</script>

<template>
  <v-tabs-window-item :value="item.value">
    <slot />
  </v-tabs-window-item>
</template>
