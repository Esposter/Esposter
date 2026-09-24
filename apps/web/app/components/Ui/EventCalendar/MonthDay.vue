<script setup lang="ts">
import type { UiCalendarEvent } from "@/models/ui/UiCalendarEvent";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { CALENDAR_DAY_EVENT_LIMIT, CALENDAR_WORK_WEEK_DAY_COUNT } from "@/services/ui/constants";

interface Props {
  day: Temporal.PlainDate;
  events: UiCalendarEvent[];
  // Whether a double click on the day's empty space makes something on it
  isCreatable: boolean;
  // A day of the month before or after, which fills the grid's edges fainter
  isOutside: boolean;
  isToday: boolean;
}

// One day of a month: its number, which opens the day, the first of its events and a count of the rest, which opens it
// Too. An event dragged over it tints it, and dropped there moves onto it. A weekend is shaded, as Outlook shades the
// Days outside the work week
const { day, events, isCreatable, isOutside, isToday } = defineProps<Props>();
const emit = defineEmits<{ create: []; dragStart: [id: string]; drop: []; open: [id: string]; showDay: [] }>();
const isWeekend = computed(() => day.dayOfWeek > CALENDAR_WORK_WEEK_DAY_COUNT);
const isDropTarget = ref(false);
</script>

<template>
  <li
    class="day"
    :data-date="day.toString()"
    :data-drop-target="isDropTarget || undefined"
    :data-outside="isOutside || undefined"
    :data-weekend="isWeekend || undefined"
    :class="{ 'cursor-cell': isCreatable }"
    p-1
    flex
    flex-col
    gap-1
    min-h-0
    of-hidden
    @dblclick.self="
      () => {
        if (isCreatable) emit('create');
      }
    "
    @dragover.prevent="isDropTarget = true"
    @dragleave="isDropTarget = false"
    @drop.prevent="
      () => {
        isDropTarget = false;
        emit('drop');
      }
    "
  >
    <button
      :aria-current="isToday ? 'date' : undefined"
      class="number"
      :data-variant="UiButtonVariant.Quiet"
      type="button"
      px-0
      text-sm
      size-7
      self-start
      ui-button
      @click="emit('showDay')"
    >
      <span aria-hidden="true">{{ day.day }}</span>
      <NuxtTime :datetime="day.toString()" date-style="full" time-zone="UTC" sr-only />
    </button>
    <UiEventCalendarEvent
      v-for="event of events.slice(0, CALENDAR_DAY_EVENT_LIMIT)"
      :key="event.id"
      :event
      @drag-start="emit('dragStart', event.id)"
      @open="emit('open', event.id)"
    />
    <UiButton
      v-if="events.length > CALENDAR_DAY_EVENT_LIMIT"
      :variant="UiButtonVariant.Quiet"
      text-sm
      self-start
      min-h-6
      @click="emit('showDay')"
    >
      {{ events.length - CALENDAR_DAY_EVENT_LIMIT }} more
    </UiButton>
  </li>
</template>

<style scoped>
/* The days sit on the same dividers a table's cells do, down each column and along each week */
.day {
  box-shadow:
    inset calc(var(--ui-border-width) * -1) 0 0 0 var(--ui-divider),
    inset 0 calc(var(--ui-border-width) * -1) 0 0 var(--ui-divider);
  transition: background-color var(--ui-motion-short);
}

.day[data-weekend] {
  background-color: color-mix(in srgb, var(--ui-background) 20%, transparent);
}

.day[data-outside] {
  background-color: color-mix(in srgb, var(--ui-background) 40%, transparent);
}

.day[data-outside] .number {
  opacity: 0.5;
}

.day[data-drop-target] {
  background-color: color-mix(in srgb, var(--ui-tint) 20%, transparent);
}

/* Today's number is filled in the accent, the one day the eye finds first */
.number[aria-current="date"] {
  background-color: var(--ui-accent);
  color: var(--ui-background);
}
</style>
