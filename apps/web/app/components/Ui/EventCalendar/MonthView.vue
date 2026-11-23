<script setup lang="ts">
import type { UiCalendarEvent } from "#src/models/ui/UiCalendarEvent";
import type { UiCalendarSlotEmits } from "#src/models/ui/UiCalendarSlotEmits";

import { CALENDAR_FIRST_DAY_OF_WEEK, CALENDAR_NO_EVENTS } from "#src/services/ui/constants";
import { getNextGridDate } from "#src/util/date/getNextGridDate";
import { createCalendar } from "@vuetify/v0";

interface Props {
  eventDayMap: Map<string, UiCalendarEvent[]>;
  isCreatable: boolean;
  // The calendar's clock, which its events fade against
  now: Temporal.ZonedDateTime;
  today: Temporal.PlainDate;
}
// The month as a grid of days with one stop in the tab order, walked as the date grid is walked: the arrows a day or a
// Week, Home and End to the week's ends, Page Up and Page Down a month. The day walked to is selected and becomes the
// Day shown, so a step off the month turns the page
const date = defineModel<Temporal.PlainDate>("date", { required: true });
defineProps<Props>();
const emit = defineEmits<
  { create: [day: Temporal.PlainDate]; drop: [day: Temporal.PlainDate]; showDay: [day: Temporal.PlainDate] } & Pick<
    UiCalendarSlotEmits,
    "dragStart" | "nudge" | "open"
  >
>();
const grid = useTemplateRef("grid");
const month = computed(() => date.value.toPlainYearMonth());
// The month's six weeks, Monday first, from a grid with no value: the selected day is the view's own, not the grid's
const calendar = createCalendar({
  firstDayOfWeek: CALENDAR_FIRST_DAY_OF_WEEK,
  fixedWeeks: true,
  month: () => month.value.toString(),
});
const weeks = computed(() =>
  calendar.month.value.weeks.map((week) =>
    week.map(({ iso, outside }) => ({ date: Temporal.PlainDate.from(iso), outside })),
  ),
);
const selectedDay = ref<Temporal.PlainDate>();
// The day holding the tab stop: the selected one while the month shows it, otherwise the day shown
const focusedDay = computed(() =>
  selectedDay.value && weeks.value.flat().some(({ date: day }) => selectedDay.value?.equals(day))
    ? selectedDay.value
    : date.value,
);
const onGridKeydown = useGridKeyboard({
  getCellSelector: (day) => `[role="gridcell"][data-date="${String(day)}"]`,
  getFocusedCell: () => focusedDay.value,
  getNextCell: (event, day) => getNextGridDate(event, day),
  root: grid,
  setFocusedCell: (day) => {
    selectedDay.value = day;
    date.value = day;
  },
});
</script>

<template>
  <div flex flex-col h-full>
    <!-- Each day names its own full date, so the weekdays over them are only for the eye -->
    <div aria-hidden="true" grid cols-7 ui-bar>
      <NuxtTime
        v-for="{ date: weekday } of weeks[0]"
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
    <!-- A new month's days fade in over the old one's place, as the navigator's do, so a step reads as a turn of
      the page. A week is a row for assistive technology alone, so the days still lay out on the one grid of seven
      columns -->
    <div
      ref="grid"
      :key="month.toString()"
      class="month"
      aria-label="Month"
      role="grid"
      tabindex="-1"
      flex-1
      grid
      cols-7
      rows-6
      min-h-0
      @keydown="onGridKeydown($event)"
    >
      <div v-for="week of weeks" :key="week[0]?.date.toString()" role="row" contents>
        <UiEventCalendarMonthDay
          v-for="{ date: day, outside } of week"
          :key="day.toString()"
          :day
          :events="eventDayMap.get(day.toString()) ?? CALENDAR_NO_EVENTS"
          :is-creatable
          :is-focused="day.equals(focusedDay)"
          :now
          :is-outside="outside"
          :is-selected="Boolean(selectedDay?.equals(day))"
          :is-today="day.equals(today)"
          @create="emit('create', day)"
          @drag-start="emit('dragStart', $event)"
          @drop="emit('drop', day)"
          @nudge="(id, duration) => emit('nudge', id, duration)"
          @open="emit('open', $event)"
          @select="selectedDay = day"
          @show-day="emit('showDay', day)"
        />
      </div>
    </div>
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
