<script setup lang="ts">
import { UiButtonVariant } from "#src/models/ui/UiButtonVariant";

interface Props {
  date: Temporal.PlainDate;
  // Whether the day is today, which the button rings
  isCurrent: boolean;
  isDisabled: boolean;
  // Whether the day is the one a single pick holds, or either end of a range
  isEnd: boolean;
  // Whether the day holds the grid's one tab stop
  isFocused: boolean;
  // Whether the day lies between a range's ends
  isInSpan: boolean;
  // Whether the day holds something, marked with a dot under its number
  isMarked: boolean;
  // Whether the day is in a month other than the one shown beside it, which fades it
  isOutside: boolean;
  // Whether a range still waiting for its end is drawn out to the day, under the pointer or focus
  isPreviewed: boolean;
}
// One day of the grid. A press always reaches the grid, which decides what it does to the focus and the selection, and
// The focus or the pointer on the day is a preview the grid draws
defineProps<Props>();
const emit = defineEmits<{ press: []; preview: [date: Temporal.PlainDate] }>();
</script>

<template>
  <button
    :aria-current="isCurrent ? 'date' : undefined"
    :aria-disabled="isDisabled || undefined"
    class="day aria-disabled:line-through aria-disabled:cursor-default aria-disabled:op-disabled"
    :data-date="date.toString()"
    :data-end="isEnd || undefined"
    :data-in-span="isInSpan || undefined"
    :data-outside="isOutside || undefined"
    :data-marked="isMarked || undefined"
    :data-preview="isPreviewed || undefined"
    :data-variant="UiButtonVariant.Quiet"
    :tabindex="isFocused ? 0 : -1"
    type="button"
    ui-button
    px-0
    size-9
    @click="emit('press')"
    @focus="emit('preview', date)"
    @mouseenter="emit('preview', date)"
  >
    <span aria-hidden="true">{{ date.day }}</span>
    <NuxtTime :datetime="date.toString()" date-style="full" time-zone="UTC" sr-only />
  </button>
</template>

<style scoped>
/* Another month's days fill the grid's edges, fainter, so the six weeks keep their shape */
.day[data-outside] {
  opacity: 0.5;
}

/* Today is ringed in the accent */
.day[aria-current="date"] {
  box-shadow: inset 0 0 0 var(--ui-border-width) var(--ui-accent);
}

.day[data-marked] {
  position: relative;
}

.day[data-marked]::after {
  background-color: currentColor;
  border-radius: var(--ui-control-radius);
  bottom: var(--ui-step);
  content: "";
  height: var(--ui-step);
  left: 50%;
  position: absolute;
  transform: translateX(-50%);
  width: var(--ui-step);
}

/* The days between a range's ends are one band in the accent, square so it reads as a span rather than a row of
   choices; a span still waiting for its end is the lighter tint out to the day under the pointer */
.day[data-in-span]:not([data-end]) {
  background-color: color-mix(in srgb, var(--ui-accent) 20%, transparent);
  border-radius: 0;
  color: var(--ui-text);
  opacity: 1;
}

.day[data-preview]:not([data-end]) {
  background-color: color-mix(in srgb, var(--ui-tint) 10%, transparent);
}

/* A single day, or a range's two ends, filled in the accent as a pressed toggle is */
.day[data-end] {
  background-color: var(--ui-accent);
  color: var(--ui-background);
  opacity: 1;
}
</style>
