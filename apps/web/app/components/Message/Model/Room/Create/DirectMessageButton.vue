<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

const isOpen = ref(false);
</script>

<template>
  <!-- Stopped, since it sits in the heading row that folds the list away on a click -->
  <UiIconButton
    label="New message"
    :meaning="UiIconMeaning.Create"
    :variant="UiButtonVariant.Quiet"
    @click.stop="isOpen = true"
  />
  <MessageModelRoomCreateDirectMessageDialog v-model="isOpen" />
</template>
