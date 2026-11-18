<script setup lang="ts">
import { UiButtonVariant } from "#src/models/ui/UiButtonVariant";
import { RightDrawerToggleMap } from "#src/services/message/RightDrawerToggleMap";

interface Props {
  drawer: keyof typeof RightDrawerToggleMap;
}

const { drawer } = defineProps<Props>();
const { isOpen, toggle } = useToggleRightDrawer(drawer);
</script>

<template>
  <UiIconButton
    :aria-pressed="isOpen"
    :label="RightDrawerToggleMap[drawer].title"
    :meaning="RightDrawerToggleMap[drawer].meaning"
    :variant="UiButtonVariant.Quiet"
    @click="toggle()"
  />
</template>
