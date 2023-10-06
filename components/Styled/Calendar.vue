<script setup lang="ts">
import type { CalendarOptions } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import FullCalendar from "@fullcalendar/vue3";

interface StyledCalendarProps {
  calendarOptions?: CalendarOptions;
}

const { calendarOptions } = defineProps<StyledCalendarProps>();
const { info } = useColors();
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
      <v-tooltip location="top">
        <template #activator="{ props }">
          <div class="tooltip text-white" w-full text-center rd-1 :="props">
            {{ timeText }}
            {{ event.title }}
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
.tooltip {
  background-color: v-bind(info);
}

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
