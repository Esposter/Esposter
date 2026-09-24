<script setup lang="ts">
import { RightDrawer } from "@/models/message/RightDrawer";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

const { isOpen, toggle } = useToggleRightDrawer(RightDrawer.Threads);
</script>

<template>
  <UiIconButton
    :aria-pressed="isOpen"
    label="Followed Threads"
    :meaning="UiIconMeaning.Comment"
    :variant="UiButtonVariant.Quiet"
    @click="toggle()"
  />
</template>
