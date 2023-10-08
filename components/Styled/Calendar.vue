<script setup lang="ts">
import type { CalendarOptions } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
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
      plugins: [dayGridPlugin, timeGridPlugin],
      headerToolbar: {
        left: 'title',
        right: 'prevYear,prev,next,nextYear today',
      },
      footerToolbar: {
        right: 'dayGridMonth,timeGridWeek,timeGridDay',
      },
    }"
  >
    <template #eventContent="{ event, timeText }">
      <v-tooltip>
        <template #activator="{ props }">
          <div px-2 w-full h-full flex items-center overflow-hidden :="props">
            <span>{{ timeText }}</span>
            <span pl-2 font-bold>{{ event.title }}</span>
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
