<script setup lang="ts">
import type { SerializableValue } from "@esposter/azure";

const emit = defineEmits<{ select: [value: SerializableValue] }>();
// A search filter cannot name a day that has not happened
const today = Temporal.Now.plainDateISO();
// The filter reads an instant: the start of the chosen day where the reader is
const select = (date: Temporal.PlainDate) => {
  emit("select", new Date(date.toZonedDateTime(Temporal.Now.timeZoneId()).epochMilliseconds));
};
</script>

<template>
  <UiCalendar
    label="Day"
    :max="today"
    @update:model-value="
      (value) => {
        if (value) select(value);
      }
    "
  />
</template>
