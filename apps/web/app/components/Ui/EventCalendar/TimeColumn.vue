<script setup lang="ts">
import type { UiCalendarEvent } from "@/models/ui/UiCalendarEvent";

import {
  CALENDAR_CLOSING_HOUR,
  CALENDAR_OPENING_HOUR,
  CALENDAR_SLOT_DURATION,
  CALENDAR_WORK_WEEK_DAY_COUNT,
} from "@/services/ui/constants";
import { getZonedDateTime } from "@esposter/shared";

interface Props {
  day: Temporal.PlainDate;
  events: UiCalendarEvent[];
  // The slot holding the hours' one stop in the tab order, on whichever day it is
  focusedSlot: Temporal.PlainDateTime;
  // Whether a double click on an empty slot, or Enter on one, makes something at its time
  isCreatable: boolean;
  isToday: boolean;
  // The slot a click last picked, on whichever day it is
  selectedSlot?: Temporal.PlainDateTime;
}
// One day of hours: a slot per half hour to select, or to drop an event on, each event an hour tall at its time, events
// In the same slot side by side, and on today a line in the accent at the current time. The hours outside the working
// Day and the whole of a weekend are shaded, as Outlook shades them
const { day, events, focusedSlot, isCreatable, isToday, selectedSlot } = defineProps<Props>();
const emit = defineEmits<{
  create: [start: Temporal.PlainDateTime];
  dragStart: [id: string];
  drop: [start: Temporal.PlainDateTime];
  nudge: [id: string, duration: Temporal.Duration];
  open: [id: string];
  select: [start: Temporal.PlainDateTime];
}>();
const isWeekend = computed(() => day.dayOfWeek > CALENDAR_WORK_WEEK_DAY_COUNT);
const midnight = Temporal.PlainTime.from({ hour: 0 });
const slotMinutes = CALENDAR_SLOT_DURATION.total("minutes");
const slotStarts = Array.from(
  { length: Temporal.Duration.from({ days: 1 }).total("minutes") / slotMinutes },
  (_slot, index) => midnight.add({ minutes: index * slotMinutes }),
);
const dropTargetIndex = ref(-1);
// How many slots into the day a time is, a fraction of one past the slot it falls in
const getSlotOffset = (plainTime: Temporal.PlainTime) => plainTime.since(midnight).total("minutes") / slotMinutes;
// Where each event sits: its slot, and its place among the others that share the slot
const placedEvents = computed(() => {
  const slotEventsMap = Map.groupBy(events, (event) =>
    Math.floor(getSlotOffset(getZonedDateTime(event.start).toPlainTime())),
  );
  return [...slotEventsMap].flatMap(([slotIndex, slotEvents]) =>
    slotEvents.map((event, index) => ({ count: slotEvents.length, event, index, slotIndex })),
  );
});
// Which of the day's slots a slot is, or -1 on another day
const getSlotIndex = (slot?: Temporal.PlainDateTime) =>
  slot?.toPlainDate().equals(day) ? Math.floor(getSlotOffset(slot.toPlainTime())) : -1;
const selectedIndex = computed(() => getSlotIndex(selectedSlot));
const focusedIndex = computed(() => getSlotIndex(focusedSlot));
const { now } = useCalendarClock();
const nowSlotOffset = computed(() => getSlotOffset(now.value.toPlainTime()));
</script>

<template>
  <div class="column" :data-date="day.toString()" :data-weekend="isWeekend || undefined" role="row" ui-guide relative>
    <!-- eslint-disable-next-line vuejs-accessibility/interactive-supports-focus -- the grid's roving focus sets the cell's tabindex -->
    <div
      v-for="(slotStart, index) of slotStarts"
      :key="index"
      :aria-selected="selectedIndex === index"
      class="slot"
      :data-drop-target="dropTargetIndex === index || undefined"
      :data-hour-start="slotStart.minute === 0 || undefined"
      :data-off-hours="slotStart.hour < CALENDAR_OPENING_HOUR || slotStart.hour >= CALENDAR_CLOSING_HOUR || undefined"
      :data-selected="selectedIndex === index || undefined"
      :data-slot="day.toPlainDateTime(slotStart).toString()"
      :class="{ 'cursor-cell': isCreatable }"
      role="gridcell"
      :tabindex="focusedIndex === index ? 0 : -1"
      hover:bg="[color-mix(in_srgb,var(--ui-tint)_10%,transparent)]"
      @click="emit('select', day.toPlainDateTime(slotStart))"
      @dblclick="
        () => {
          if (isCreatable) emit('create', day.toPlainDateTime(slotStart));
        }
      "
      @keydown.enter.prevent="
        () => {
          if (isCreatable) emit('create', day.toPlainDateTime(slotStart));
        }
      "
      @dragover.prevent="dropTargetIndex = index"
      @dragleave="dropTargetIndex = -1"
      @drop.prevent="
        () => {
          dropTargetIndex = -1;
          emit('drop', day.toPlainDateTime(slotStart));
        }
      "
    >
      <!-- An empty slot is named by its day and time, which only the slot holding the tab stop is ever focused to read -->
      <NuxtTime
        v-if="focusedIndex === index"
        :datetime="day.toPlainDateTime(slotStart).toZonedDateTime('UTC').epochMilliseconds"
        date-style="full"
        time-style="short"
        time-zone="UTC"
        sr-only
      />
    </div>
    <div
      v-for="{ count, event, index, slotIndex } of placedEvents"
      :key="event.id"
      :style="{
        left: `${(index / count) * 100}%`,
        top: `calc(var(--slot-height) * ${slotIndex})`,
        width: `${100 / count}%`,
      }"
      class="placed"
      p-0.5
      absolute
    >
      <UiEventCalendarEvent
        :event
        is-block
        @drag-start="emit('dragStart', event.id)"
        @nudge="emit('nudge', event.id, $event)"
        @open="emit('open', event.id)"
      />
    </div>
    <div
      v-if="isToday"
      class="now"
      :style="{ top: `calc(var(--slot-height) * ${nowSlotOffset})` }"
      inset-x-0
      absolute
    />
  </div>
</template>

<style scoped>
/* A slot's height is the grid's, which the gutter's hours read too. The column's line down its start is its guide */
.slot {
  --line-color: color-mix(in srgb, var(--ui-divider) 50%, transparent);
  box-shadow: inset 0 var(--ui-border-width) 0 0 var(--line-color);
  height: var(--slot-height);
  transition:
    background-color var(--ui-motion-short),
    box-shadow var(--ui-motion-short);
}

/* A line at the start of every hour, fainter at the half hour between, as a ruled page. The first hour starts on the
   headings' own line, so it draws none of its own */
.slot[data-hour-start] {
  --line-color: var(--ui-divider);
}

.slot:first-child {
  --line-color: transparent;
}

/* The shading is an image over the slot's own colour, so the hover tint still shows through it */
.column[data-weekend],
.slot[data-off-hours] {
  background-image: linear-gradient(color-mix(in srgb, var(--ui-background) 20%, transparent) 0 0);
}

/* Selected as a data table's row is, filled in the accent, and ringed in it where the row has a block down its edge */
.slot[data-selected] {
  background-color: color-mix(in srgb, var(--ui-accent) 20%, transparent);
  box-shadow: inset 0 0 0 var(--ui-border-width) var(--ui-accent);
}

.slot[data-drop-target] {
  background-color: color-mix(in srgb, var(--ui-tint) 20%, transparent);
}

/* An hour tall, the slot it starts in and the next */
.placed {
  height: calc(var(--slot-height) * 2);
}

/* The current time, a line in the accent across today with a block at its start */
.now {
  background-color: var(--ui-accent);
  height: calc(var(--ui-border-width) * 2);
  pointer-events: none;
}

.now::before {
  background-color: var(--ui-accent);
  content: "";
  height: calc(var(--ui-step) * 2);
  left: calc(var(--ui-step) * -1);
  position: absolute;
  top: calc(var(--ui-step) * -1 + var(--ui-border-width));
  width: calc(var(--ui-step) * 2);
}
</style>
