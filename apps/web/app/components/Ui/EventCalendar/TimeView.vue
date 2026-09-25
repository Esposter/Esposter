<script setup lang="ts">
import type { UiCalendarEvent } from "@/models/ui/UiCalendarEvent";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { CALENDAR_OPENING_HOUR, CALENDAR_SLOT_DURATION } from "@/services/ui/constants";
import { takeOne } from "@esposter/shared";

interface Props {
  days: Temporal.PlainDate[];
  eventDayMap: Map<string, UiCalendarEvent[]>;
  isCreatable: boolean;
  // How far the view steps, which Page Up and Page Down step it too
  step: Temporal.DurationLike;
  today: Temporal.PlainDate;
}
// A week or a day of hours as one grid: a gutter of the hours, then a column per day under a heading naming it, the
// Headings held over the hours as they scroll. It opens scrolled to the start of a working day, and a click on a slot
// Selects it. Its slots are one stop in the tab order, walked by the arrows a slot or a day at a time, by Home and End
// To the day's ends and by Page Up and Page Down a view at a time; the slot walked to is selected, and its day becomes
// The day shown, so a step off the first or the last day steps the view
const date = defineModel<Temporal.PlainDate>("date", { required: true });
const { days, eventDayMap, isCreatable, step, today } = defineProps<Props>();
const emit = defineEmits<{
  create: [start: Temporal.PlainDateTime];
  dragStart: [id: string];
  drop: [start: Temporal.PlainDateTime];
  nudge: [id: string, duration: Temporal.Duration];
  open: [id: string];
  showDay: [day: Temporal.PlainDate];
}>();
const scroller = useTemplateRef("scroller");
const grid = useTemplateRef("grid");
const header = useTemplateRef("header");
const hours = Array.from({ length: Temporal.Duration.from({ days: 1 }).total("hours") }, (_hour, hour) => hour);
// The gutter is as wide as its longest hour, whichever way the reader's locale writes one
const gridTemplateColumns = computed(() => `auto repeat(${days.length}, minmax(0, 1fr))`);
const selectedSlot = ref<Temporal.PlainDateTime>();
// The slot holding the tab stop: the selected one while its day is shown, otherwise the start of the working day on the
// Day shown, or on the first day where a work week does not show it
const focusedSlot = computed(() => {
  if (selectedSlot.value && days.some((day) => selectedSlot.value?.toPlainDate().equals(day)))
    return selectedSlot.value;
  const day = days.find((shownDay) => shownDay.equals(date.value)) ?? takeOne(days, 0);
  return day.toPlainDateTime({ hour: CALENDAR_OPENING_HOUR });
});
const midnight = Temporal.PlainTime.from({ hour: 0 });
const lastSlotStart = midnight.subtract(CALENDAR_SLOT_DURATION);
// A key held with Alt, Ctrl or Meta moves nowhere, left to whatever binds that chord — Alt+Left is the browser's Back
const getNextSlot = (event: KeyboardEvent, slot: Temporal.PlainDateTime) => {
  if (event.altKey || event.ctrlKey || event.metaKey) return undefined;
  const day = slot.toPlainDate();
  const firstDay = takeOne(days, 0);
  const lastDay = takeOne(days, days.length - 1);
  switch (event.key) {
    // A slot stays on its own day, whose ends Home and End go to
    case "ArrowDown":
      return slot.toPlainTime().equals(lastSlotStart) ? slot : slot.add(CALENDAR_SLOT_DURATION);
    // Before the first day or past the last is the last or the first day of the view before or after, so a work week
    // Steps over the weekend it leaves out
    case "ArrowLeft":
      return day.equals(firstDay)
        ? lastDay.subtract(step).toPlainDateTime(slot.toPlainTime())
        : slot.subtract({ days: 1 });
    case "ArrowRight":
      return day.equals(lastDay) ? firstDay.add(step).toPlainDateTime(slot.toPlainTime()) : slot.add({ days: 1 });
    case "ArrowUp":
      return slot.toPlainTime().equals(midnight) ? slot : slot.subtract(CALENDAR_SLOT_DURATION);
    case "End":
      return day.toPlainDateTime(lastSlotStart);
    case "Home":
      return day.toPlainDateTime(midnight);
    case "PageDown":
      return slot.add(step);
    case "PageUp":
      return slot.subtract(step);
    default:
      return undefined;
  }
};
const onGridKeydown = useGridKeyboard({
  getCellSelector: (slot) => `[role="gridcell"][data-slot="${String(slot)}"]`,
  getFocusedCell: () => focusedSlot.value,
  getNextCell: (event, slot) => getNextSlot(event, slot),
  root: grid,
  setFocusedCell: (slot) => {
    selectedSlot.value = slot;
    date.value = slot.toPlainDate();
  },
});

onMounted(() => {
  const hour = scroller.value?.querySelector<HTMLElement>(`[data-hour="${CALENDAR_OPENING_HOUR}"]`);
  // The headings are held over the top of the hours, so the working day starts under them rather than behind them
  if (scroller.value && hour) scroller.value.scrollTop = hour.offsetTop - (header.value?.offsetHeight ?? 0);
});
</script>

<template>
  <!-- Positioned, so an hour's offsetTop is measured from the top of the grid it scrolls -->
  <div ref="scroller" h-full relative of-y-auto>
    <!-- A new week's days fade in over the old one's place, as a new month's do -->
    <div :key="days[0]?.toString()" class="hours" grid :style="{ gridTemplateColumns }">
      <!-- One row across the grid on its columns, so a heading always sits over its day, scrollbar or not -->
      <div ref="header" class="header" ui-bar>
        <span />
        <div
          v-for="day of days"
          :key="day.toString()"
          :data-today="day.equals(today) || undefined"
          class="heading"
          p-1
          ui-guide
        >
          <button
            :aria-current="day.equals(today) ? 'date' : undefined"
            :data-variant="UiButtonVariant.Quiet"
            type="button"
            ui-button
            px-1
            w-full
            @click="emit('showDay', day)"
          >
            <!-- The weekday over the date, as Outlook stacks them, so a narrow week still fits both -->
            <span aria-hidden="true" flex flex-col items-center>
              <NuxtTime :datetime="day.toString()" time-zone="UTC" weekday="short" text-sm />
              <span class="number" ui-title>{{ day.day }}</span>
            </span>
            <NuxtTime :datetime="day.toString()" date-style="full" time-zone="UTC" sr-only />
          </button>
        </div>
      </div>
      <div aria-hidden="true">
        <div v-for="hour of hours" :key="hour" :data-hour="hour" class="hour" text-sm text-muted px-2 text-right>
          <NuxtTime
            v-if="hour > 0"
            :datetime="today.toZonedDateTime({ plainTime: { hour }, timeZone: 'UTC' }).epochMilliseconds"
            hour="numeric"
            time-zone="UTC"
          />
        </div>
      </div>
      <!-- The days' columns are the grid's rows for assistive technology, in a wrapper the layout sees through -->
      <div ref="grid" aria-label="Hours" role="grid" tabindex="-1" contents @keydown="onGridKeydown($event)">
        <UiEventCalendarTimeColumn
          v-for="day of days"
          :key="day.toString()"
          :day
          :events="eventDayMap.get(day.toString()) ?? []"
          :focused-slot
          :is-creatable
          :is-today="day.equals(today)"
          :selected-slot
          @create="emit('create', $event)"
          @drag-start="emit('dragStart', $event)"
          @drop="emit('drop', $event)"
          @nudge="(id, duration) => emit('nudge', id, duration)"
          @open="emit('open', $event)"
          @select="selectedSlot = $event"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Half an hour is six steps, which every column's slots and the gutter's hours read, so the two never drift apart */
.hours {
  --slot-height: calc(var(--ui-step) * 6);
  transition: opacity var(--ui-motion-short);
}

@starting-style {
  .hours {
    opacity: 0;
  }
}

/* Over the hours as they scroll under it, on the frame's own panel so nothing shows through */
.header {
  background-color: var(--ui-panel);
  display: grid;
  grid-column: 1 / -1;
  grid-template-columns: subgrid;
  position: sticky;
  top: 0;
  z-index: 1;
}

/* Today's heading carries the accent's indicator bar on the header's line, the mark a tab list puts under the current
   tab, and its number is filled in the accent as a month fills today's */
.heading[data-today] {
  box-shadow:
    inset var(--ui-border-width) 0 0 0 var(--ui-divider),
    inset 0 calc(var(--ui-indicator-width) * -1) 0 0 var(--ui-accent);
}

.heading[data-today] .number {
  background-color: var(--ui-accent);
  border-radius: var(--ui-pill-radius);
  color: var(--ui-background);
  padding-inline: var(--ui-step);
}

/* An hour is two slots tall, its label sitting on the line that starts it */
.hour {
  height: calc(var(--slot-height) * 2);
  line-height: 1;
  transform: translateY(-50%);
}
</style>
