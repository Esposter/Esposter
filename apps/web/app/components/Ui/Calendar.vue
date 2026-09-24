<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { CALENDAR_WEEK_COUNT } from "@/services/ui/constants";
import { getStartOfWeek } from "@/util/date/getStartOfWeek";

interface Props {
  // The grid's accessible name, which says what the day is for: "Due date", "Sent on or after"
  label: string;
  max?: Temporal.PlainDate;
  min?: Temporal.PlainDate;
}

// A month of days as the WAI-ARIA date grid draws one: a grid of buttons, one stop in the tab order on the focused day,
// Walked by arrow a day or a week at a time, by Home and End to the week's ends and by Page Up and Page Down a month at a
// Time, a year with Shift. Its days are plain dates, so a time zone never moves one
const modelValue = defineModel<Temporal.PlainDate>();
const { label, max, min } = defineProps<Props>();
const headingId = useId();
const grid = useTemplateRef("grid");
const today = Temporal.Now.plainDateISO();
const checkIsDisabled = (date: Temporal.PlainDate) =>
  (min !== undefined && Temporal.PlainDate.compare(date, min) < 0) ||
  (max !== undefined && Temporal.PlainDate.compare(date, max) > 0);
const clamp = (date: Temporal.PlainDate) => {
  if (min && Temporal.PlainDate.compare(date, min) < 0) return min;
  else if (max && Temporal.PlainDate.compare(date, max) > 0) return max;
  else return date;
};
// The day that holds the grid's one tab stop, and whose month is shown
const focusedDate = ref(clamp(modelValue.value ?? today));
const month = computed(() => focusedDate.value.toPlainYearMonth());
// Always six weeks, so the grid keeps its height from one month to the next and the buttons never jump under the pointer
const weeks = computed(() => {
  const start = getStartOfWeek(month.value.toPlainDate({ day: 1 }));
  return Array.from({ length: CALENDAR_WEEK_COUNT }, (_week, weekIndex) =>
    Array.from({ length: start.daysInWeek }, (_day, dayIndex) =>
      start.add({ days: weekIndex * start.daysInWeek + dayIndex }),
    ),
  );
});
const weekdays = computed(() => weeks.value[0] ?? []);
const focusDate = async (date: Temporal.PlainDate) => {
  focusedDate.value = clamp(date);
  await nextTick();
  grid.value?.querySelector<HTMLButtonElement>(`[data-date="${focusedDate.value.toString()}"]`)?.focus();
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

watch(modelValue, (newModelValue) => {
  if (newModelValue) focusedDate.value = clamp(newModelValue);
});
</script>

<template>
  <div flex flex-col gap-2>
    <header flex gap-1 items-center>
      <UiIconButton
        label="Previous month"
        :meaning="UiIconMeaning.Previous"
        :variant="UiButtonVariant.Quiet"
        @click="focusedDate = clamp(focusedDate.subtract({ months: 1 }))"
      />
      <!-- Read out as the month changes, since the days themselves change under the focus without moving it -->
      <h2 :id="headingId" aria-live="polite" text-center flex-1 ui-heading>
        <NuxtTime :datetime="month.toPlainDate({ day: 1 }).toString()" month="long" time-zone="UTC" year="numeric" />
      </h2>
      <UiIconButton
        label="Next month"
        :meaning="UiIconMeaning.Next"
        :variant="UiButtonVariant.Quiet"
        @click="focusedDate = clamp(focusedDate.add({ months: 1 }))"
      />
    </header>
    <table
      ref="grid"
      :aria-label="label"
      :aria-describedby="headingId"
      role="grid"
      @keydown="
        (event: KeyboardEvent) => {
          const nextDate = getNextDate(event, focusedDate);
          if (!nextDate) return;
          event.preventDefault();
          focusDate(nextDate);
        }
      "
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
            :aria-selected="modelValue?.equals(date) ?? false"
            role="gridcell"
            p-0
          >
            <button
              :aria-current="date.equals(today) ? 'date' : undefined"
              :aria-disabled="checkIsDisabled(date) || undefined"
              class="day aria-disabled:cursor-default aria-disabled:op-disabled aria-disabled:line-through"
              :data-date="date.toString()"
              :data-outside="!date.toPlainYearMonth().equals(month) || undefined"
              :data-selected="modelValue?.equals(date) || undefined"
              :data-variant="UiButtonVariant.Quiet"
              :tabindex="date.equals(focusedDate) ? 0 : -1"
              type="button"
              px-0
              size-9
              ui-button
              @click="
                () => {
                  focusedDate = date;
                  if (!checkIsDisabled(date)) modelValue = date;
                }
              "
            >
              <span aria-hidden="true">{{ date.day }}</span>
              <NuxtTime :datetime="date.toString()" date-style="full" time-zone="UTC" sr-only />
            </button>
          </td>
        </tr>
      </tbody>
    </table>
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

/* Today is ringed in the accent, and the chosen day filled with it, as a pressed toggle is */
.day[aria-current="date"] {
  box-shadow: inset 0 0 0 var(--ui-border-width) var(--ui-accent);
}

.day[data-selected] {
  background-color: var(--ui-accent);
  color: var(--ui-background);
  opacity: 1;
}
</style>
