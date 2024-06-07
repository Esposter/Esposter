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
  <v-tooltip :text="item.text">
    <template #activator="{ props }">
      <v-tab :value="item.value" :="props">
        <v-icon :icon="item.icon" />
      </v-tab>
    </template>
  </v-tooltip>
</template>
