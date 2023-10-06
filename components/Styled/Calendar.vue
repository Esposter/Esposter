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
  />
</template>

<style scoped lang="scss">
:deep(.fc-icon) {
  display: flex;
}

:deep(.fc-col-header),
:deep(.fc-daygrid-body),
:deep(.fc-scrollgrid-sync-table) {
  width: 100% !important;
  height: 100% !important;
}
</style>
