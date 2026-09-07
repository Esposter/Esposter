<script setup lang="ts">
import type { MenuItem } from "@/models/shared/MenuItem";

import { checkIsDivider } from "@/services/shared/checkIsDivider";
import { mergeProps } from "vue";

interface Props {
  items: MenuItem[];
}

const { items } = defineProps<Props>();
</script>

<template>
  <template v-for="(item, index) of items" :key="index">
    <v-divider v-if="checkIsDivider(item)" thickness="2" vertical h-6 self-center />
    <v-tooltip v-else :text="item.title">
      <template #activator="{ props: tooltipProps }">
        <!-- item.title would otherwise land on the button as a native title attribute, doubling the tooltip -->
        <v-btn density="comfortable" tile :="mergeProps(item, tooltipProps)" :title="undefined" />
      </template>
    </v-tooltip>
  </template>
</template>
