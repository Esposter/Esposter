<script setup lang="ts">
import { RightDrawer } from "@/models/message/RightDrawer";

const { isOpen, toggle } = useToggleRightDrawer(RightDrawer.Threads);
</script>

<template>
  <StyledTooltipIconButton
    :button-props="{ size: 'small' }"
    icon="mdi-forum-outline"
    :text="`${isOpen ? 'Hide' : 'Show'} Followed Threads`"
    :tooltip-props="{ location: 'bottom' }"
    @click="toggle"
  />
</template>
