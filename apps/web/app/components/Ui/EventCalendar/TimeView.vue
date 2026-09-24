<script setup lang="ts">
import type { UiCalendarEvent } from "@/models/ui/UiCalendarEvent";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { CALENDAR_OPENING_HOUR } from "@/services/ui/constants";

interface Props {
  days: Temporal.PlainDate[];
  eventDayMap: Map<string, UiCalendarEvent[]>;
  isCreatable: boolean;
  today: Temporal.PlainDate;
}

// A week or a day of hours: a column per day under a row naming each, beside a gutter of the hours, opened scrolled to
// The start of a working day
const { days, eventDayMap, isCreatable, today } = defineProps<Props>();
const emit = defineEmits<{
  create: [start: Temporal.PlainDateTime];
  dragStart: [id: string];
  drop: [start: Temporal.PlainDateTime];
  open: [id: string];
  showDay: [day: Temporal.PlainDate];
}>();
const scroller = useTemplateRef("scroller");
const hours = Array.from({ length: Temporal.Duration.from({ days: 1 }).total("hours") }, (_hour, hour) => hour);
const gridTemplateColumns = computed(() => `calc(var(--ui-step) * 16) repeat(${days.length}, minmax(0, 1fr))`);

onMounted(() => {
  const hour = scroller.value?.querySelector<HTMLElement>(`[data-hour="${CALENDAR_OPENING_HOUR}"]`);
  if (scroller.value && hour) scroller.value.scrollTop = hour.offsetTop;
});
</script>

<template>
  <div flex flex-col h-full>
    <div grid ui-bar :style="{ gridTemplateColumns }">
      <span />
      <button
        v-for="day of days"
        :key="day.toString()"
        :aria-current="day.equals(today) ? 'date' : undefined"
        class="heading"
        :data-variant="UiButtonVariant.Quiet"
        type="button"
        text-sm
        ui-button
        @click="emit('showDay', day)"
      >
        <span aria-hidden="true">
          <NuxtTime :datetime="day.toString()" time-zone="UTC" weekday="short" />
          {{ day.day }}
        </span>
        <NuxtTime :datetime="day.toString()" date-style="full" time-zone="UTC" sr-only />
      </button>
    </div>
    <!-- Positioned, so an hour's offsetTop is measured from the top of the hours rather than from above the headings -->
    <div ref="scroller" flex-1 min-h-0 of-y-auto relative>
      <div grid :style="{ gridTemplateColumns }">
        <div aria-hidden="true">
          <div v-for="hour of hours" :key="hour" :data-hour="hour" class="hour" pr-2 text-sm text-muted text-right>
            <NuxtTime
              v-if="hour > 0"
              :datetime="today.toZonedDateTime({ plainTime: { hour }, timeZone: 'UTC' }).epochMilliseconds"
              hour="numeric"
              time-zone="UTC"
            />
          </div>
        </div>
        <UiEventCalendarTimeColumn
          v-for="day of days"
          :key="day.toString()"
          :day
          :events="eventDayMap.get(day.toString()) ?? []"
          :is-creatable
          :is-today="day.equals(today)"
          @create="emit('create', $event)"
          @drag-start="emit('dragStart', $event)"
          @drop="emit('drop', $event)"
          @open="emit('open', $event)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* An hour is two slots tall, its label sitting on the line that starts it */
.hour {
  height: calc(var(--ui-step) * 12);
  line-height: 1;
  transform: translateY(-50%);
}

.heading[aria-current="date"] {
  color: var(--ui-accent);
}
</style>
