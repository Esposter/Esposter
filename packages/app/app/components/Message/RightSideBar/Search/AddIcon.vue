<script setup lang="ts">
interface MessageRightSideBarSearchAddIconProps {
  isHovering: boolean;
}

// The affordance every search row shares: a plus that only shows itself under the pointer, kept mounted at
// Zero opacity so the row's height never changes as the pointer crosses it
const { isHovering } = defineProps<MessageRightSideBarSearchAddIconProps>();
</script>

<template>
  <v-icon :op="isHovering ? undefined : '0!'" icon="mdi-plus" />
</template>
