<script setup lang="ts">
import type { RoomRoleInMessage } from "@esposter/db-schema";

interface Props {
  color: RoomRoleInMessage["color"];
}

const { color } = defineProps<Props>();
</script>

<template>
  <!-- Unconditional: a role carrying its own colour sets it inline, which outranks this -->
  <div class="color-dot" :style="color ? { backgroundColor: color } : undefined" rd-full size-3 />
</template>

<style scoped>
.color-dot {
  background-color: rgb(var(--v-theme-surface));
}
</style>
