<script setup lang="ts">
import { RESOURCE_DATE_TIME_ATTRIBUTES } from "@/services/resource/constants";

interface Props {
  datetime: Date;
}

const { datetime } = defineProps<Props>();
</script>

<!-- A row reads at a glance as "3 days ago", and the exact moment is a hover away -->
<template>
  <v-tooltip location="top">
    <template #activator="{ props: tooltipActivatorProps }">
      <NuxtTime :="tooltipActivatorProps" :datetime relative />
    </template>
    <NuxtTime :="RESOURCE_DATE_TIME_ATTRIBUTES" :datetime />
  </v-tooltip>
</template>
