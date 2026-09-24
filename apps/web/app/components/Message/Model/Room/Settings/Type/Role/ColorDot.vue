<script setup lang="ts">
import type { RoomRoleInMessage } from "@esposter/db-schema";

interface Props {
  color: RoomRoleInMessage["color"];
}

const { color } = defineProps<Props>();
</script>

<template>
  <!-- Unconditional: a role carrying its own colour sets it inline, which outranks the muted fallback -->
  <span :style="color ? { backgroundColor: color } : undefined" bg-muted size-3 rd="[var(--ui-pill-radius)]" />
</template>
