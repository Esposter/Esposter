<script setup lang="ts">
import { RightDrawer } from "@/models/message/RightDrawer";

const { isOpen, toggle } = useToggleRightDrawer(RightDrawer.Member);
</script>

<template>
  <StyledTooltipIconButton
    :button-props="{ size: 'small' }"
    icon="mdi-account-multiple"
    :text="`${isOpen ? 'Hide' : 'Show'} Member List`"
    :tooltip-props="{ location: 'bottom' }"
    @click="toggle"
  />
</template>
