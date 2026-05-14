<script setup lang="ts">
import type { CallFeature } from "@/models/message/room/call/CallFeature";

interface CallFeatureCardProps extends CallFeature {}

const { description, icon, title } = defineProps<CallFeatureCardProps>();
</script>

<template>
  <div p-4 rd-2 bg-surface flex flex-col gap-y-2>
    <v-icon color="primary" :icon size="large" />
    <span font-medium text-body-medium>{{ title }}</span>
    <span text-medium-emphasis text-body-small>{{ description }}</span>
  </div>
</template>
