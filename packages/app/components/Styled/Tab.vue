<script setup lang="ts">
import type { TabItem } from "@/models/vuetify/TabItem";
import type { TabItemCategoryDefinition } from "@/models/vuetify/TabItemCategoryDefinition";

interface TabProps {
  item: TabItem;
}

const { item: baseItem } = defineProps<TabProps>();
const item = computed(() => baseItem as TabItemCategoryDefinition);
</script>

<template>
  <v-tab :prepend-icon="item.icon" :value="item.value" :text="item.text" />
</template>
