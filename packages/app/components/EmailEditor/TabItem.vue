<script setup lang="ts">
import type { EmailEditorTabItemCategoryDefinition } from "@/models/emailEditor/EmailEditorTabItemCategoryDefinition";
import type { TabItem } from "@/models/vuetify/TabItem";

import { TabComponentMap } from "@/services/emailEditor/TabComponentMap";

interface TabItemProps {
  item: TabItem;
}

const { item: baseItem } = defineProps<TabItemProps>();
const item = computed(() => baseItem as EmailEditorTabItemCategoryDefinition);
</script>

<template>
  <component :is="TabComponentMap[item.type]" h-full :item />
</template>
