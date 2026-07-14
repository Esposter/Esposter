<script setup lang="ts">
import { MESSAGE_DISPLAY_NAME } from "#shared/services/message/constants";

defineEmits<{ grant: [] }>();
</script>

<template>
  <v-alert density="compact" type="warning" variant="tonal">
    You do not have any input devices enabled. You must
    <span text-info underline cursor-pointer @click="$emit('grant')">
      grant {{ MESSAGE_DISPLAY_NAME }} access to your microphone
    </span>
    in order to observe input sensitivity.
  </v-alert>
</template>
