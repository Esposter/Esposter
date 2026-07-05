<script setup lang="ts">
const isOpen = defineModel<boolean>({ default: false });
</script>

<template>
  <StyledTooltipIconButton
    :button-props="{ ripple: false, size: 'small' }"
    icon="mdi-plus"
    text="New Message"
    @click.stop="isOpen = true"
  />
  <MessageModelRoomCreateDirectMessageDialog v-model="isOpen" />
</template>
