<script setup lang="ts">
import type { UiCalendarEvent } from "@/models/ui/UiCalendarEvent";

import { CALENDAR_WEEK_COUNT } from "@/services/ui/constants";
import { getStartOfWeek } from "@/util/date/getStartOfWeek";

interface Props {
  date: Temporal.PlainDate;
  eventDayMap: Map<string, UiCalendarEvent[]>;
  isCreatable: boolean;
  today: Temporal.PlainDate;
}

const { date, eventDayMap, isCreatable, today } = defineProps<Props>();
const emit = defineEmits<{
  create: [day: Temporal.PlainDate];
  dragStart: [id: string];
  drop: [day: Temporal.PlainDate];
  open: [id: string];
  showDay: [day: Temporal.PlainDate];
}>();
const month = computed(() => date.toPlainYearMonth());
// Six weeks, as the date grid shows them, so the month keeps its height
const days = computed(() => {
  const start = getStartOfWeek(month.value.toPlainDate({ day: 1 }));
  return Array.from({ length: CALENDAR_WEEK_COUNT * start.daysInWeek }, (_day, index) => start.add({ days: index }));
});
const selectedDay = ref<Temporal.PlainDate>();
</script>

<template>
  <div flex flex-col h-full>
    <!-- Each day names its own full date, so the weekdays over them are only for the eye -->
    <div aria-hidden="true" grid cols-7 ui-bar>
      <NuxtTime
        v-for="weekday of days.slice(0, 7)"
        :key="weekday.dayOfWeek"
        :datetime="weekday.toString()"
        time-zone="UTC"
        weekday="short"
        text-sm
        text-muted
        px-2
        py-1
        text-center
      />
    </div>
    <!-- A new month's days fade in over the old one's place, as the navigator's do, so a step reads as a turn of the page -->
    <ol :key="month.toString()" class="month" flex-1 grid cols-7 rows-6 min-h-0>
      <UiEventCalendarMonthDay
        v-for="day of days"
        :key="day.toString()"
        :day
        :events="eventDayMap.get(day.toString()) ?? []"
        :is-creatable
        :is-outside="!day.toPlainYearMonth().equals(month)"
        :is-selected="Boolean(selectedDay?.equals(day))"
        :is-today="day.equals(today)"
        @create="emit('create', day)"
        @drag-start="emit('dragStart', $event)"
        @drop="emit('drop', day)"
        @open="emit('open', $event)"
        @select="selectedDay = day"
        @show-day="emit('showDay', day)"
      />
    </ol>
  </div>
</template>

<style scoped>
.month {
  transition: opacity var(--ui-motion-short);
}

@starting-style {
  .month {
    opacity: 0;
  }
}
</style>
