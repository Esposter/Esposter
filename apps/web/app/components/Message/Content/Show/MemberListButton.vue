<script setup lang="ts">
import { RightDrawer } from "@/models/message/RightDrawer";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

const { isOpen, toggle } = useToggleRightDrawer(RightDrawer.Member);
</script>

<template>
  <UiIconButton
    :aria-pressed="isOpen"
    label="Member List"
    :meaning="UiIconMeaning.Members"
    :variant="UiButtonVariant.Quiet"
    @click="toggle()"
  />
</template>
