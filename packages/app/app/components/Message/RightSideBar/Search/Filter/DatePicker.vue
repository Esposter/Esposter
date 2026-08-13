<script setup lang="ts">
import type { SerializableValue } from "@esposter/db-schema";

import { dayjs } from "#shared/services/dayjs";

const emit = defineEmits<{ select: [value: SerializableValue] }>();
const { toJsDate } = useVDate();
const date = ref<Date>();
</script>

<template>
  <v-date-picker
    v-model="date"
    :allowed-dates="(value) => dayjs(toJsDate(value)).isSameOrBefore(new Date(), 'day')"
    show-adjacent-months
    @update:model-value="
      (value) => {
        if (!value) return;
        emit('select', value);
      }
    "
  />
</template>
