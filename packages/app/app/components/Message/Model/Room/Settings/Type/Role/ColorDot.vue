<script setup lang="ts">
import type { RoomRoleInMessage } from "@esposter/db-schema";

interface Props {
  color: RoomRoleInMessage["color"];
}

const { color } = defineProps<Props>();
</script>

<template>
  <div
    :class="color ? undefined : 'bg-surface'"
    :style="color ? { backgroundColor: color } : undefined"
    rd-full
    size-3
  />
</template>
