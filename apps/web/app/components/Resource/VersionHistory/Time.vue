<script setup lang="ts">
import { RESOURCE_DATE_TIME_ATTRIBUTES } from "@/services/resource/constants";

interface Props {
  datetime: Date;
}

const { datetime } = defineProps<Props>();
</script>

<!-- A row reads at a glance as "3 days ago", and the exact moment is a hover away -->
<template>
  <UiTooltip label="">
    <template #default="{ activatorProps }">
      <NuxtTime :="activatorProps" :datetime relative tabindex="0" />
    </template>
    <template #content>
      <NuxtTime :="RESOURCE_DATE_TIME_ATTRIBUTES" :datetime />
    </template>
  </UiTooltip>
</template>
