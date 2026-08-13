<script setup lang="ts">
import { RightDrawer } from "@/models/message/RightDrawer";

const { toggle } = useToggleRightDrawer(RightDrawer.Search);
</script>

<template>
  <StyledTooltipIconButton
    :button-props="{ size: 'small' }"
    icon="mdi-magnify"
    text="Search"
    :tooltip-props="{ location: 'bottom' }"
    @click="toggle"
  />
</template>
