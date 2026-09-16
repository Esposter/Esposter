<script setup lang="ts">
import type { RoomRoleInMessage } from "@esposter/db-schema";

interface Props {
  color: RoomRoleInMessage["color"];
}

const { color } = defineProps<Props>();
</script>

<template>
  <!-- Unconditional: a role carrying its own colour sets it inline, which outranks the surface fallback -->
  <div :style="color ? { backgroundColor: color } : undefined" rd-full bg-surface size-3 />
</template>
