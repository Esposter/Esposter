<script setup lang="ts">
import { MESSAGE_DISPLAY_NAME } from "#shared/services/message/constants";

defineEmits<{ grant: [] }>();
</script>

<template>
  <v-alert density="compact" type="warning" variant="tonal">
    You do not have any input devices enabled. You must
    <a text-info underline cursor-pointer @click="$emit('grant')">
      grant {{ MESSAGE_DISPLAY_NAME }} access to your microphone
    </a>
    in order to observe input sensitivity.
  </v-alert>
</template>
