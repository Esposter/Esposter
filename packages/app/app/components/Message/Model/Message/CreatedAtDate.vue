<script setup lang="ts">
import { dayjs } from "#shared/services/dayjs";

interface CreatedAtDateProps {
  createdAt: Date;
}

const { createdAt } = defineProps<CreatedAtDateProps>();
const createdAtDayjs = computed(() => dayjs(createdAt));
const displayCreatedAtShort = computed(() => createdAtDayjs.value.format("H:mm"));
const displayCreatedAt = computed(() => {
  if (createdAtDayjs.value.isToday()) return displayCreatedAtShort.value;
  else if (createdAtDayjs.value.isYesterday()) return `Yesterday at ${displayCreatedAtShort.value}`;
  else return createdAtDayjs.value.format("DD/MM/YYYY H:mm");
});
</script>

<template>
  <span text-gray text-xs>{{ displayCreatedAt }}</span>
</template>
