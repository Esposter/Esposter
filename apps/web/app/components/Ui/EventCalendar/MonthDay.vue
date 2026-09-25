<script setup lang="ts">
import type { UiCalendarEvent } from "@/models/ui/UiCalendarEvent";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { CALENDAR_DAY_EVENT_LIMIT, CALENDAR_WORK_WEEK_DAY_COUNT } from "@/services/ui/constants";

interface Props {
  day: Temporal.PlainDate;
  events: UiCalendarEvent[];
  // Whether a double click on the day's empty space, or Enter on the day, makes something on it
  isCreatable: boolean;
  // The day holding the month's one stop in the tab order
  isFocused: boolean;
  // A day of the month before or after, which fills the grid's edges fainter
  isOutside: boolean;
  // The day a click on its empty space picked, which Outlook fills as the one a new event would go on
  isSelected: boolean;
  isToday: boolean;
}

// One day of a month, a cell of the month's grid: its number, which opens the day, the first of its events and a count
// Of the rest, which opens it too. A click on its empty space selects it, and an event dragged over it tints it and
// Dropped there moves onto it. A weekend is shaded, as Outlook shades the days outside the work week
const { day, events, isCreatable, isFocused, isOutside, isSelected, isToday } = defineProps<Props>();
const emit = defineEmits<{
  create: [];
  dragStart: [id: string];
  drop: [];
  nudge: [id: string, duration: Temporal.Duration];
  open: [id: string];
  select: [];
  showDay: [];
}>();
const isWeekend = computed(() => day.dayOfWeek > CALENDAR_WORK_WEEK_DAY_COUNT);
const isDropTarget = ref(false);
</script>

<template>
  <!-- eslint-disable-next-line vuejs-accessibility/interactive-supports-focus -- the grid's roving focus sets the cell's tabindex -->
  <div
    class="day"
    :aria-selected="isSelected"
    :data-date="day.toString()"
    :data-drop-target="isDropTarget || undefined"
    :data-outside="isOutside || undefined"
    :data-selected="isSelected || undefined"
    :data-today="isToday || undefined"
    :data-weekend="isWeekend || undefined"
    :class="{ 'cursor-cell': isCreatable }"
    role="gridcell"
    :tabindex="isFocused ? 0 : -1"
    hover:bg="[color-mix(in_srgb,var(--ui-tint)_10%,transparent)]"
    p-1
    flex
    flex-col
    gap-1
    min-h-0
    of-hidden
    @click.self="emit('select')"
    @dblclick.self="
      () => {
        if (isCreatable) emit('create');
      }
    "
    @keydown.enter.self.prevent="
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
      tabindex="-1"
      type="button"
      text-sm
      ui-button
      px-0
      size-7
      self-start
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
      @nudge="emit('nudge', event.id, $event)"
      @open="emit('open', event.id)"
    />
    <UiButton
      v-if="events.length > CALENDAR_DAY_EVENT_LIMIT"
      :variant="UiButtonVariant.Quiet"
      text-sm
      min-h-6
      self-start
      @click="emit('showDay')"
    >
      {{ events.length - CALENDAR_DAY_EVENT_LIMIT }} more
    </UiButton>
  </div>
</template>

<style scoped>
/* The days sit on the same dividers a table's cells do, down each column and along each week. The frame around the grid
   owns its outer edge, so the last day of a week's row draws no line after it and the last week's days none under them.
   Today carries the accent's indicator bar along its top, the mark a tab list puts on the current tab */
.day {
  --line-end-color: var(--ui-divider);
  --line-bottom-color: var(--ui-divider);
  --mark-color: transparent;
  box-shadow:
    inset calc(var(--ui-border-width) * -1) 0 0 0 var(--line-end-color),
    inset 0 calc(var(--ui-border-width) * -1) 0 0 var(--line-bottom-color),
    inset 0 var(--ui-indicator-width) 0 0 var(--mark-color);
  transition:
    background-color var(--ui-motion-short),
    box-shadow var(--ui-motion-short);
}

.day:last-child {
  --line-end-color: transparent;
}

[role="row"]:last-child > .day {
  --line-bottom-color: transparent;
}

.day[data-today] {
  --mark-color: var(--ui-accent);
}

/* The shading is an image over the day's own colour, so the hover tint still shows through it */
.day[data-weekend] {
  background-image: linear-gradient(color-mix(in srgb, var(--ui-background) 20%, transparent) 0 0);
}

.day[data-outside] {
  background-image: linear-gradient(color-mix(in srgb, var(--ui-background) 40%, transparent) 0 0);
}

.day[data-outside] .number {
  opacity: 0.5;
}

/* A keyboard on the day or on one of its events tints the whole day, so the reader sees which day they are on */
.day:focus-visible,
.day:has(:focus-visible) {
  background-color: color-mix(in srgb, var(--ui-tint) 10%, transparent);
}

/* Selected as a data table's row is, filled in the accent, and ringed in it where the row has a block down its edge */
.day[data-selected] {
  background-color: color-mix(in srgb, var(--ui-accent) 20%, transparent);
  box-shadow:
    inset 0 0 0 var(--ui-border-width) var(--ui-accent),
    inset 0 var(--ui-indicator-width) 0 0 var(--mark-color);
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
