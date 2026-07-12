<script setup lang="ts">
import type { AppNotificationAction } from "@/models/notification/AppNotificationAction";

interface AppNotificationActionButtonProps {
  action: AppNotificationAction;
}

const { action } = defineProps<AppNotificationActionButtonProps>();
</script>

<template>
  <v-btn size="small" variant="tonal" :to="action.to" @click="action.handler?.()">{{ action.title }}</v-btn>
</template>
