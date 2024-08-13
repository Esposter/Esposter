<script setup lang="ts">
import type { CalendarOptions } from "@fullcalendar/core";

import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import FullCalendar from "@fullcalendar/vue3";

interface StyledCalendarProps {
  calendarOptions?: CalendarOptions;
}

const { calendarOptions } = defineProps<StyledCalendarProps>();
</script>

<template>
  <FullCalendar
    :options="{
      ...calendarOptions,
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
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
          <div w-full flex items-center overflow-hidden :="props">
            <div class="fc-daygrid-event-dot" />
            <div class="fc-event-time">{{ timeText }}</div>
            <div class="fc-event-title">{{ event.title }}</div>
          </div>
        </template>
        <div text-center font-bold>
          {{ event.title }}
        </div>
        <div v-if="event.extendedProps.description" pt-2>
          {{ event.extendedProps.description }}
        </div>
      </v-tooltip>
    </template>
  </FullCalendar>
</template>

<style scoped lang="scss">
:deep(.fc-icon) {
  display: flex;
}
</style>
