<script setup lang="ts">
import type { CallFeature } from "@/models/message/room/call/CallFeature";

interface Props extends CallFeature {}

const { description, icon, title } = defineProps<Props>();
</script>

<template>
  <v-sheet p-4 rd-2 flex flex-col gap-y-2>
    <v-icon color="primary" :icon size="large" />
    <span font-medium text-body-medium>{{ title }}</span>
    <span text-hint>{{ description }}</span>
  </v-sheet>
</template>
