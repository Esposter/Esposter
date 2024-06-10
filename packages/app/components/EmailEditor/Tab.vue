<script setup lang="ts">
import type { EmailEditorTabItemCategoryDefinition } from "@/models/emailEditor/EmailEditorTabItemCategoryDefinition";
import type { TabItem } from "@/models/vuetify/TabItem";

interface TabProps {
  item: TabItem;
}

const { item: baseItem } = defineProps<TabProps>();
const item = computed(() => baseItem as EmailEditorTabItemCategoryDefinition);
</script>

<template>
  <v-tab :prepend-icon="item.icon" :value="item.value" :text="item.type" />
</template>
