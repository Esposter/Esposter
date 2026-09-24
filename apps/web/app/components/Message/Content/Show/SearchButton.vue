<script setup lang="ts">
import { RightDrawer } from "@/models/message/RightDrawer";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

const { isOpen, toggle } = useToggleRightDrawer(RightDrawer.Search);
</script>

<template>
  <UiIconButton
    :aria-pressed="isOpen"
    label="Search"
    :meaning="UiIconMeaning.Search"
    :variant="UiButtonVariant.Quiet"
    @click="toggle()"
  />
</template>
