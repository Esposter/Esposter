<script setup lang="ts">
import type { CalendarOptions } from "@fullcalendar/vue3";

import { EMPTY_TEXT_REGEX } from "@/util/text/constants";
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/vue3/daygrid";
import interactionPlugin from "@fullcalendar/vue3/interaction";
import monarchThemePlugin from "@fullcalendar/vue3/themes/monarch";
import timeGridPlugin from "@fullcalendar/vue3/timegrid";
import "@fullcalendar/vue3/skeleton.css";
import "@fullcalendar/vue3/themes/monarch/palettes/green.css";
import "@fullcalendar/vue3/themes/monarch/theme.css";

interface StyledCalendarProps {
  calendarOptions?: CalendarOptions;
}

const { calendarOptions } = defineProps<StyledCalendarProps>();
</script>

<template>
  <FullCalendar
    :options="{
      ...calendarOptions,
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, monarchThemePlugin],
      headerToolbar: {
        left: 'title',
        right: 'prevYear,prev,next,nextYear today',
      },
      footerToolbar: {
        right: 'dayGridMonth,timeGridWeek,timeGridDay',
      },
      editable: true,
    }"
  >
    <template #eventContent="{ event, timeText }">
      <v-tooltip>
        <template #activator="{ props }">
          <div flex gap-1 w-full items-center overflow-hidden :="props">
            <div>{{ timeText }}</div>
            <div truncate>{{ event.title }}</div>
          </div>
        </template>
        <div font-bold text-center>
          {{ event.title }}
        </div>
        <div
          v-if="event.extendedProps.description && !EMPTY_TEXT_REGEX.test(event.extendedProps.description)"
          class="rich-text-content"
          pt-2
          v-html="event.extendedProps.description"
        />
      </v-tooltip>
    </template>
  </FullCalendar>
</template>
