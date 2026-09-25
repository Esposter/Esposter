<script setup lang="ts">
import type { UiCalendarEvent } from "@/models/ui/UiCalendarEvent";
import type { UiCommand } from "@/models/ui/UiCommand";
import type { UiMenuItem } from "@/models/ui/UiMenuItem";

import { useCommands } from "@/composables/ui/useCommands";
import { useToday } from "@/composables/ui/useToday";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiCalendarView, UiCalendarViews } from "@/models/ui/UiCalendarView";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { CALENDAR_OPENING_HOUR, CALENDAR_SLOT_DURATION, CALENDAR_WORK_WEEK_DAY_COUNT } from "@/services/ui/constants";
import { UiCalendarViewIconMeaningMap } from "@/services/ui/UiCalendarViewIconMeaningMap";
import { getStartOfWeek } from "@/util/date/getStartOfWeek";
import { exhaustiveGuard, getZonedDateTime } from "@esposter/shared";

interface Props {
  events: UiCalendarEvent[];
  // The calendar's accessible name, which says whose events it holds
  label: string;
  // What a double click on an empty day or slot, or Enter on one, makes there, as Outlook's does. A prop rather than an emit, so a
  // Calendar nothing can be created on never draws its days as something to press
  onCreate?: (start: Date) => void;
}

// Events laid out in time, as Outlook lays them out: a day, a work week or a week of hours, or a month of days, beside
// A month navigator that marks the days holding events. It steps a view or a year at a time with today one press away,
// And Outlook's shortcuts switch the view. An event opens on a click and moves by a drag onto another day, which keeps
// Its time, or onto another slot of the hours, or by Alt and an arrow. Which view and which day are models, so a page
// Can keep them
const view = defineModel<UiCalendarView>("view", { default: UiCalendarView.Month });
const date = defineModel<Temporal.PlainDate>("date", { default: () => Temporal.Now.plainDateISO() });
const { events, label, onCreate } = defineProps<Props>();
const emit = defineEmits<{ move: [id: string, start: Date]; open: [id: string] }>();
const today = useToday();
const viewItems: UiMenuItem<UiCalendarView>[] = UiCalendarViews.map((value) => ({ title: value, value }));
const step = computed<Temporal.DurationLike>(() => {
  switch (view.value) {
    case UiCalendarView.Day:
      return { days: 1 };
    case UiCalendarView.Month:
      return { months: 1 };
    case UiCalendarView.Week:
    case UiCalendarView.WorkWeek:
      return { weeks: 1 };
    default:
      return exhaustiveGuard(view.value);
  }
});
const days = computed(() => {
  if (view.value === UiCalendarView.Day) return [date.value];
  const start = getStartOfWeek(date.value);
  const dayCount = view.value === UiCalendarView.WorkWeek ? CALENDAR_WORK_WEEK_DAY_COUNT : start.daysInWeek;
  return Array.from({ length: dayCount }, (_day, index) => start.add({ days: index }));
});
// Every event under the day it starts on where the reader is, earliest first
const eventDayMap = computed(() => {
  const newEventDayMap = new Map<string, UiCalendarEvent[]>();
  for (const event of events.toSorted((first, second) => first.start.getTime() - second.start.getTime())) {
    const key = getZonedDateTime(event.start).toPlainDate().toString();
    newEventDayMap.set(key, [...(newEventDayMap.get(key) ?? []), event]);
  }
  return newEventDayMap;
});
const markedDates = computed(() => [...eventDayMap.value.keys()]);
const section = useTemplateRef("section");
const draggedId = ref("");
// The event last moved, read out in a polite live region as its new time, so a move from the keyboard is heard
const movedEvent = ref<Pick<UiCalendarEvent, "start" | "title">>();
// A day keeps the event's own time; a slot of the hours is the new time whole
const move = (id: string, target: Temporal.PlainDate | Temporal.PlainDateTime) => {
  const event = events.find((calendarEvent) => calendarEvent.id === id);
  if (!event) return;
  const timeZone = Temporal.Now.timeZoneId();
  const zonedDateTime =
    target instanceof Temporal.PlainDate
      ? target.toZonedDateTime({ plainTime: getZonedDateTime(event.start).toPlainTime(), timeZone })
      : target.toZonedDateTime(timeZone);
  const start = new Date(zonedDateTime.epochMilliseconds);
  if (start.getTime() === event.start.getTime()) return;
  emit("move", event.id, start);
  movedEvent.value = { start, title: event.title };
};
const drop = (target: Temporal.PlainDate | Temporal.PlainDateTime) => {
  const id = draggedId.value;
  draggedId.value = "";
  move(id, target);
};
// Alt and an arrow move an event by a day or a week, onto the same time of that day, or by a slot of the hours, onto
// That slot, through the move a drop makes. The view follows it to its new day, and the focus stays on it there
const nudge = async (id: string, duration: Temporal.Duration) => {
  const event = events.find((calendarEvent) => calendarEvent.id === id);
  if (!event) return;
  const plainDateTime = getZonedDateTime(event.start).toPlainDateTime();
  const target =
    duration.days || duration.weeks
      ? plainDateTime.toPlainDate().add(duration)
      : plainDateTime
          .round({
            roundingIncrement: CALENDAR_SLOT_DURATION.total("minutes"),
            roundingMode: "floor",
            smallestUnit: "minute",
          })
          .add(duration);
  move(id, target);
  date.value = target instanceof Temporal.PlainDate ? target : target.toPlainDate();
  await nextTick();
  section.value?.querySelector<HTMLElement>(`[data-event-id="${id}"]`)?.focus();
};
// A day of the month has no time of its own, so what is made on one starts with the working day
const create = (target: Temporal.PlainDate | Temporal.PlainDateTime) => {
  const timeZone = Temporal.Now.timeZoneId();
  const zonedDateTime =
    target instanceof Temporal.PlainDate
      ? target.toZonedDateTime({ plainTime: { hour: CALENDAR_OPENING_HOUR }, timeZone })
      : target.toZonedDateTime(timeZone);
  onCreate?.(new Date(zonedDateTime.epochMilliseconds));
};
const showDay = (day: Temporal.PlainDate) => {
  date.value = day;
  view.value = UiCalendarView.Day;
};
// Outlook numbers its views from the shortest; stepping and today are Google Calendar's single keys, which Outlook has
// No equivalent of
useCommands((): UiCommand[] => [
  ...UiCalendarViews.map((calendarView, index) => ({
    group: "Calendar",
    id: `calendar-view-${calendarView}`,
    meaning: UiCalendarViewIconMeaningMap[calendarView],
    run: () => {
      view.value = calendarView;
    },
    shortcut: `ctrl+alt+${index + 1}`,
    title: `Show ${calendarView.toLowerCase()}`,
  })),
  {
    group: "Calendar",
    id: "calendar-today",
    meaning: UiIconMeaning.Date,
    run: () => {
      date.value = today.value;
    },
    shortcut: "t",
    title: "Go to today",
  },
  {
    group: "Calendar",
    id: "calendar-next",
    meaning: UiIconMeaning.Next,
    run: () => {
      date.value = date.value.add(step.value);
    },
    shortcut: "j",
    title: `Next ${view.value.toLowerCase()}`,
  },
  {
    group: "Calendar",
    id: "calendar-previous",
    meaning: UiIconMeaning.Previous,
    run: () => {
      date.value = date.value.subtract(step.value);
    },
    shortcut: "k",
    title: `Previous ${view.value.toLowerCase()}`,
  },
]);
</script>

<template>
  <!-- A drag cancelled or dropped outside the calendar never reaches move, so its id would otherwise move the event on
    The next drop of a file or text. dragend fires after drop, so a real move has already read it -->
  <section ref="section" :aria-label="label" flex gap-4 h-full min-h-0 @dragend="draggedId = ''">
    <!-- Outlook's navigator: the month around the day shown, each day holding an event marked, a click going there -->
    <aside shrink-0 flex-col w-72 hidden lg:flex>
      <UiCalendar v-model="date" label="Go to a day" :marked-dates />
    </aside>
    <div flex flex-1 flex-col gap-3 min-w-0>
      <header flex flex-wrap gap-2 items-center>
        <!-- Read out as the reader steps, since the days change under the buttons without focus moving -->
        <h2 aria-live="polite" flex-1 min-w-0 truncate ui-title>
          <NuxtTime v-if="view === UiCalendarView.Day" :datetime="date.toString()" date-style="full" time-zone="UTC" />
          <NuxtTime v-else :datetime="date.toString()" month="long" time-zone="UTC" year="numeric" />
        </h2>
        <div flex gap-1 items-center>
          <UiIconButton
            label="Previous year"
            :meaning="UiIconMeaning.SkipBackward"
            :variant="UiButtonVariant.Quiet"
            @click="date = date.subtract({ years: 1 })"
          />
          <UiIconButton
            :label="`Previous ${view.toLowerCase()}`"
            :meaning="UiIconMeaning.Previous"
            :variant="UiButtonVariant.Quiet"
            @click="date = date.subtract(step)"
          />
          <UiButton :disabled="date.equals(today)" :variant="UiButtonVariant.Quiet" @click="date = today">
            Today
          </UiButton>
          <UiIconButton
            :label="`Next ${view.toLowerCase()}`"
            :meaning="UiIconMeaning.Next"
            :variant="UiButtonVariant.Quiet"
            @click="date = date.add(step)"
          />
          <UiIconButton
            label="Next year"
            :meaning="UiIconMeaning.SkipForward"
            :variant="UiButtonVariant.Quiet"
            @click="date = date.add({ years: 1 })"
          />
        </div>
        <UiToggleGroup v-model="view" :items="viewItems" label="View" />
      </header>
      <!-- Which day an event falls on is the reader's own time zone, which only the browser knows -->
      <ClientOnly>
        <div flex-1 min-h-0 of-hidden ui-frame>
          <UiEventCalendarMonthView
            v-if="view === UiCalendarView.Month"
            v-model:date="date"
            :event-day-map
            :is-creatable="Boolean(onCreate)"
            :today
            @create="create($event)"
            @drag-start="draggedId = $event"
            @drop="drop($event)"
            @nudge="(id, duration) => nudge(id, duration)"
            @open="emit('open', $event)"
            @show-day="showDay($event)"
          />
          <UiEventCalendarTimeView
            v-else
            v-model:date="date"
            :days
            :event-day-map
            :is-creatable="Boolean(onCreate)"
            :step
            :today
            @create="create($event)"
            @drag-start="draggedId = $event"
            @drop="drop($event)"
            @nudge="(id, duration) => nudge(id, duration)"
            @open="emit('open', $event)"
            @show-day="showDay($event)"
          />
        </div>
        <template #fallback>
          <UiSkeleton flex-1 />
        </template>
      </ClientOnly>
      <div aria-live="polite" sr-only>
        <template v-if="movedEvent">
          {{ movedEvent.title }} moved to
          <NuxtTime :datetime="movedEvent.start" date-style="full" time-style="short" />
        </template>
      </div>
    </div>
  </section>
</template>
