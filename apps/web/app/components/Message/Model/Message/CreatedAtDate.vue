<script setup lang="ts">
import { getMessageDateLabel } from "@/util/date/getMessageDateLabel";

interface Props {
  createdAt: Date;
}

const { createdAt } = defineProps<Props>();
const displayCreatedAt = computed(() => getMessageDateLabel(createdAt));
</script>

<template>
  <span text-hint>{{ displayCreatedAt }}</span>
</template>
