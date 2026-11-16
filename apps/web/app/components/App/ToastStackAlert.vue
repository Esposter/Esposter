<script setup lang="ts">
import type { Alert } from "#src/models/shared/Alert";

import { useAlertStore } from "#src/store/alert";

interface Props {
  alert: Alert;
}

defineProps<Props>();
const alertStore = useAlertStore();
const { dismissAlert } = alertStore;
</script>

<template>
  <UiToast is-dismissible :status="alert.type" @close="dismissAlert(alert.id)">
    <template v-if="alert.icon" #mark>
      <span :class="alert.icon" :style="{ color: `var(--ui-${alert.type})` }" aria-hidden="true" size-6 />
    </template>
    {{ alert.text }}
  </UiToast>
</template>
