<script setup lang="ts">
import { RightDrawer } from "#src/models/message/RightDrawer";
import { UiButtonVariant } from "#src/models/ui/UiButtonVariant";
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";

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
