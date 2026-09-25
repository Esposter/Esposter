<script setup lang="ts">
import { useToday } from "@/composables/ui/useToday";
import { useUiDisplay } from "@/composables/ui/useUiDisplay";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { CALENDAR_WEEK_COUNT } from "@/services/ui/constants";
import { getStartOfWeek } from "@/util/date/getStartOfWeek";

interface Props {
  // A span of days in the from and to models rather than one day: the first press sets its start and the second its
  // End, and a wide screen shows two months side by side so a span across a month's end is picked without paging
  isRange?: true;
  // The grid's accessible name, which says what the day is for: "Due date", "Sent on or after"
  label: string;
  // Days that hold something, each as its ISO date, marked with a dot under the number as a navigator marks the days
  // With events
  markedDates?: string[];
  max?: Temporal.PlainDate;
  min?: Temporal.PlainDate;
}

// A month of days as the WAI-ARIA date grid draws one: a grid of buttons, one stop in the tab order on the focused day,
// Walked by arrow a day or a week at a time, by Home and End to the week's ends and by Page Up and Page Down a month at a
// Time, a year with Shift. Its days are plain dates, so a time zone never moves one
const modelValue = defineModel<Temporal.PlainDate>();
const from = defineModel<Temporal.PlainDate>("from");
const to = defineModel<Temporal.PlainDate>("to");
const { isRange, label, markedDates = [], max, min } = defineProps<Props>();
const headingId = useId();
const root = useTemplateRef("root");
const today = useToday();
const { smAndUp } = useUiDisplay();
const monthCount = computed(() => (isRange && smAndUp.value ? 2 : 1));
const checkIsDisabled = (date: Temporal.PlainDate) =>
  (min !== undefined && Temporal.PlainDate.compare(date, min) < 0) ||
  (max !== undefined && Temporal.PlainDate.compare(date, max) > 0);
const clamp = (date: Temporal.PlainDate) => {
  if (min && Temporal.PlainDate.compare(date, min) < 0) return min;
  else if (max && Temporal.PlainDate.compare(date, max) > 0) return max;
  else return date;
};
// The day that holds the grid's one tab stop, and whose month is shown
const focusedDate = ref(clamp(modelValue.value ?? from.value ?? today.value));
// Which of the months shown holds the focused day, so walking out of the first month moves the focus into the second
// Rather than turning the page, while the buttons turn the page under the focus
const focusedMonthIndex = ref(0);
const shownMonthIndex = computed(() => Math.min(focusedMonthIndex.value, monthCount.value - 1));
// Always six weeks, so the grid keeps its height from one month to the next and the buttons never jump under the pointer
const months = computed(() => {
  const firstMonth = focusedDate.value.toPlainYearMonth().subtract({ months: shownMonthIndex.value });
  return Array.from({ length: monthCount.value }, (_month, monthIndex) => {
    const month = firstMonth.add({ months: monthIndex });
    const start = getStartOfWeek(month.toPlainDate({ day: 1 }));
    const weeks = Array.from({ length: CALENDAR_WEEK_COUNT }, (_week, weekIndex) =>
      Array.from({ length: start.daysInWeek }, (_day, dayIndex) =>
        start.add({ days: weekIndex * start.daysInWeek + dayIndex }),
      ),
    );
    return { month, weeks };
  });
});
const weekdays = computed(() => months.value[0]?.weeks[0] ?? []);
// The day the pointer or the focus is on, which a range still waiting for its end is drawn out to
const previewDate = ref<Temporal.PlainDate>();
const span = computed(() => {
  if (!from.value) return undefined;
  const end = to.value ?? previewDate.value ?? from.value;
  return Temporal.PlainDate.compare(from.value, end) <= 0
    ? { end, start: from.value }
    : { end: from.value, start: end };
});
const checkIsInSpan = (date: Temporal.PlainDate) =>
  span.value !== undefined &&
  Temporal.PlainDate.compare(date, span.value.start) >= 0 &&
  Temporal.PlainDate.compare(date, span.value.end) <= 0;
const checkIsPreviewed = (date: Temporal.PlainDate) =>
  !to.value && previewDate.value !== undefined && checkIsInSpan(date);
// Only a range's picked days are selected; the span out to a day under the pointer is a preview
const checkIsSelected = (date: Temporal.PlainDate) => {
  if (!isRange) return Boolean(modelValue.value?.equals(date));
  else if (to.value) return checkIsInSpan(date);
  else return Boolean(from.value?.equals(date));
};
// Months side by side leave their edges empty, so each day is drawn once, in its own month
const checkIsShown = (date: Temporal.PlainDate, month: Temporal.PlainYearMonth) =>
  monthCount.value === 1 || date.toPlainYearMonth().equals(month);
const checkIsEnd = (date: Temporal.PlainDate) =>
  isRange ? Boolean(from.value?.equals(date) || to.value?.equals(date)) : Boolean(modelValue.value?.equals(date));
// The tab stop moves to the day, and the months shown move only as far as they must to hold it
const setFocusedDate = (date: Temporal.PlainDate) => {
  const newFocusedDate = clamp(date);
  const monthDifference = focusedDate.value
    .toPlainYearMonth()
    .until(newFocusedDate.toPlainYearMonth(), { largestUnit: "months" }).months;
  focusedMonthIndex.value = Math.min(Math.max(shownMonthIndex.value + monthDifference, 0), monthCount.value - 1);
  focusedDate.value = newFocusedDate;
};
const focusDate = async (date: Temporal.PlainDate) => {
  setFocusedDate(date);
  await nextTick();
  root.value?.querySelector<HTMLButtonElement>(`button[data-date="${focusedDate.value}"]`)?.focus();
};
const getNextDate = (event: KeyboardEvent, date: Temporal.PlainDate) => {
  switch (event.key) {
    case "ArrowDown":
      return date.add({ weeks: 1 });
    case "ArrowLeft":
      return date.subtract({ days: 1 });
    case "ArrowRight":
      return date.add({ days: 1 });
    case "ArrowUp":
      return date.subtract({ weeks: 1 });
    case "End":
      return getStartOfWeek(date).add({ days: date.daysInWeek - 1 });
    case "Home":
      return getStartOfWeek(date);
    case "PageDown":
      return event.shiftKey ? date.add({ years: 1 }) : date.add({ months: 1 });
    case "PageUp":
      return event.shiftKey ? date.subtract({ years: 1 }) : date.subtract({ months: 1 });
    default:
      return undefined;
  }
};
// A range's first press starts it and the second ends it, a day before the start becoming the start; a press after the
// End starts a new one
const choose = (date: Temporal.PlainDate) => {
  if (!isRange) modelValue.value = date;
  else if (!from.value || to.value) {
    previewDate.value = undefined;
    from.value = date;
    to.value = undefined;
  } else if (Temporal.PlainDate.compare(date, from.value) < 0) {
    to.value = from.value;
    from.value = date;
  } else to.value = date;
};

watch(modelValue, (newModelValue) => {
  if (newModelValue) focusedDate.value = clamp(newModelValue);
});
</script>

<template>
  <div ref="root" flex gap-4>
    <div v-for="({ month, weeks }, index) of months" :key="index" flex flex-1 flex-col gap-2>
      <header flex gap-1 items-center>
        <UiIconButton
          v-if="index === 0"
          label="Previous month"
          :meaning="UiIconMeaning.Previous"
          :variant="UiButtonVariant.Quiet"
          @click="focusedDate = clamp(focusedDate.subtract({ months: 1 }))"
        />
        <!-- Read out as the month changes, since the days themselves change under the focus without moving it -->
        <h2 :id="`${headingId}-${index}`" aria-live="polite" text-center flex-1 ui-heading>
          <NuxtTime :datetime="month.toPlainDate({ day: 1 }).toString()" month="long" time-zone="UTC" year="numeric" />
        </h2>
        <UiIconButton
          v-if="index === months.length - 1"
          label="Next month"
          :meaning="UiIconMeaning.Next"
          :variant="UiButtonVariant.Quiet"
          @click="focusedDate = clamp(focusedDate.add({ months: 1 }))"
        />
      </header>
      <table
        :aria-label="label"
        :aria-describedby="`${headingId}-${index}`"
        :aria-multiselectable="isRange"
        role="grid"
        tabindex="-1"
        @keydown="
          (event: KeyboardEvent) => {
            // Escape lets go of the end a range is waiting for and keeps its start
            if (event.key === 'Escape') previewDate = undefined;
            const nextDate = getNextDate(event, focusedDate);
            if (!nextDate) return;
            event.preventDefault();
            focusDate(nextDate);
          }
        "
        @mouseleave="previewDate = undefined"
      >
        <thead>
          <tr>
            <th v-for="weekday of weekdays" :key="weekday.dayOfWeek" scope="col" ui-body>
              <NuxtTime :datetime="weekday.toString()" time-zone="UTC" weekday="short" text-muted />
            </th>
          </tr>
        </thead>
        <!-- A new month's days fade in over the old one's place, so a jump reads as a turn of the page -->
        <tbody :key="month.toString()" class="month">
          <tr v-for="week of weeks" :key="week[0]?.toString()">
            <td
              v-for="date of week"
              :key="date.toString()"
              :aria-selected="checkIsShown(date, month) ? checkIsSelected(date) : undefined"
              role="gridcell"
              p-0
            >
              <button
                v-if="checkIsShown(date, month)"
                :aria-current="date.equals(today) ? 'date' : undefined"
                :aria-disabled="checkIsDisabled(date) || undefined"
                class="day aria-disabled:line-through aria-disabled:cursor-default aria-disabled:op-disabled"
                :data-date="date.toString()"
                :data-end="checkIsEnd(date) || undefined"
                :data-in-span="checkIsInSpan(date) || undefined"
                :data-outside="!date.toPlainYearMonth().equals(month) || undefined"
                :data-marked="markedDates.includes(date.toString()) || undefined"
                :data-preview="checkIsPreviewed(date) || undefined"
                :data-variant="UiButtonVariant.Quiet"
                :tabindex="date.equals(focusedDate) ? 0 : -1"
                type="button"
                ui-button
                px-0
                size-9
                @click="
                  () => {
                    setFocusedDate(date);
                    if (!checkIsDisabled(date)) choose(date);
                  }
                "
                @focus="previewDate = date"
                @mouseenter="previewDate = date"
              >
                <span aria-hidden="true">{{ date.day }}</span>
                <NuxtTime :datetime="date.toString()" date-style="full" time-zone="UTC" sr-only />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
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
