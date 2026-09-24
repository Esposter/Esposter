<script setup lang="ts">
import type { UiCalendarEvent } from "@/models/ui/UiCalendarEvent";

import {
  CALENDAR_CLOCK_INTERVAL_MS,
  CALENDAR_CLOSING_HOUR,
  CALENDAR_OPENING_HOUR,
  CALENDAR_SLOT_DURATION,
  CALENDAR_WORK_WEEK_DAY_COUNT,
} from "@/services/ui/constants";
import { getZonedDateTime } from "@esposter/shared";

interface Props {
  day: Temporal.PlainDate;
  events: UiCalendarEvent[];
  // Whether a double click on an empty slot makes something at its time
  isCreatable: boolean;
  isToday: boolean;
}

// One day of hours: a slot per half hour to drop an event on, each event an hour tall at its time, events in the same
// Slot side by side, and on today a line in the accent at the current time. The hours outside the working day and the
// Whole of a weekend are shaded, as Outlook shades them
const { day, events, isCreatable, isToday } = defineProps<Props>();
const emit = defineEmits<{
  create: [start: Temporal.PlainDateTime];
  dragStart: [id: string];
  drop: [start: Temporal.PlainDateTime];
  open: [id: string];
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
  const slotEventsMap = new Map<number, UiCalendarEvent[]>();
  for (const event of events) {
    const slotIndex = Math.floor(getSlotOffset(getZonedDateTime(event.start).toPlainTime()));
    slotEventsMap.set(slotIndex, [...(slotEventsMap.get(slotIndex) ?? []), event]);
  }
  return [...slotEventsMap].flatMap(([slotIndex, slotEvents]) =>
    slotEvents.map((event, index) => ({ count: slotEvents.length, event, index, slotIndex })),
  );
});
const now = useNow({
  scheduler: (callback) => useIntervalFn(callback, CALENDAR_CLOCK_INTERVAL_MS),
});
const nowSlotOffset = computed(() => getSlotOffset(getZonedDateTime(now.value).toPlainTime()));
</script>

<template>
  <div class="column" :data-date="day.toString()" :data-weekend="isWeekend || undefined" relative>
    <div
      v-for="(slotStart, index) of slotStarts"
      :key="index"
      class="slot"
      :data-drop-target="dropTargetIndex === index || undefined"
      :data-hour-start="slotStart.minute === 0 || undefined"
      :data-off-hours="slotStart.hour < CALENDAR_OPENING_HOUR || slotStart.hour >= CALENDAR_CLOSING_HOUR || undefined"
      :class="{ 'cursor-cell': isCreatable }"
      @dblclick="
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
    />
    <div
      v-for="{ count, event, index, slotIndex } of placedEvents"
      :key="event.id"
      :style="{
        left: `${(index / count) * 100}%`,
        top: `calc(var(--slot-height) * ${slotIndex})`,
        width: `${100 / count}%`,
      }"
      class="placed"
      px-0.5
      absolute
    >
      <UiEventCalendarEvent :event @drag-start="emit('dragStart', event.id)" @open="emit('open', event.id)" />
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
.column {
  --slot-height: calc(var(--ui-step) * 6);
  box-shadow: inset var(--ui-border-width) 0 0 0 var(--ui-divider);
}

/* A line at the start of every hour, fainter at the half hour between, as a ruled page */
.slot {
  height: var(--slot-height);
  transition: background-color var(--ui-motion-short);
}

.slot[data-hour-start] {
  box-shadow: inset 0 var(--ui-border-width) 0 0 var(--ui-divider);
}

.column[data-weekend],
.slot[data-off-hours] {
  background-color: color-mix(in srgb, var(--ui-background) 20%, transparent);
}

.slot[data-drop-target] {
  background-color: color-mix(in srgb, var(--ui-tint) 20%, transparent);
}

/* An hour tall, the slot it starts in and the next */
.placed {
  height: calc(var(--slot-height) * 2);
}

.placed :deep(.event) {
  align-items: flex-start;
  height: 100%;
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
