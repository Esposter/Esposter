<script setup lang="ts">
import type { SerializableValue } from "@esposter/azure";

import { getPlainDate } from "@esposter/shared";

const emit = defineEmits<{ select: [value: SerializableValue] }>();
const { toJsDate } = useVDate();
const date = ref<Date>();
// A search filter cannot name a day that has not happened. Declared here rather than inline in the template
// Because a template expression cannot see a language global.
const checkIsNotFuture = (value: unknown) =>
  Temporal.PlainDate.compare(getPlainDate(toJsDate(value)), Temporal.Now.plainDateISO()) <= 0;
</script>

<template>
  <v-date-picker
    v-model="date"
    :allowed-dates="checkIsNotFuture"
    show-adjacent-months
    @update:model-value="
      (value) => {
        if (!value) return;
        emit('select', value);
      }
    "
  />
</template>
