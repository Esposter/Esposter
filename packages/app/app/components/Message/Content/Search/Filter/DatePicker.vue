<script setup lang="ts">
import { dayjs } from "#shared/services/dayjs";

const emit = defineEmits<{ select: [value: string] }>();
const { toJsDate } = useDate();
const date = ref<Date | null>(null);
</script>

<template>
  <v-date-picker
    v-model="date"
    :allowed-dates="
      (value) => {
        const date = toJsDate(value);
        return dayjs(date).isSameOrBefore(new Date(), 'day');
      }
    "
    show-adjacent-months
    @update:model-value="
      (value) => {
        if (!value) return;
        emit('select', value.toISOString());
      }
    "
  />
</template>
