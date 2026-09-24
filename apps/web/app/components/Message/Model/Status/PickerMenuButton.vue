<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { STATUS_PICKER_POSITION_AREA } from "@/services/message/user/status/constants";

// What the trigger shows is the caller's, such as the reader's own avatar with its status dot
defineSlots<{ default: () => VNode }>();
const isOpen = ref(false);
</script>

<template>
  <UiPopover
    v-model:is-open="isOpen"
    label="Set status"
    :position-area="STATUS_PICKER_POSITION_AREA"
    :variant="UiButtonVariant.Quiet"
    px-0
  >
    <template #trigger><slot /></template>
    <template #default="{ close }">
      <!-- Mounted only while open, so each open seeds its draft from the status as it then stands -->
      <MessageModelStatusPickerForm v-if="isOpen" @save="close()" />
    </template>
  </UiPopover>
</template>
