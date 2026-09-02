<script setup lang="ts">
import { getMessageDateLabel } from "@/util/date/getMessageDateLabel";

interface CreatedAtDateProps {
  createdAt: Date;
}

const { createdAt } = defineProps<CreatedAtDateProps>();
const displayCreatedAt = computed(() => getMessageDateLabel(createdAt));
</script>

<template>
  <span text-hint>{{ displayCreatedAt }}</span>
</template>
