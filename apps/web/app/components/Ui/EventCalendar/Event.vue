<script setup lang="ts">
import type { UiCalendarEvent } from "@/models/ui/UiCalendarEvent";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { CALENDAR_SLOT_DURATION } from "@/services/ui/constants";
import { EMPTY_TEXT_REGEX } from "@/util/text/constants";
import { mergeProps } from "vue";

interface Props {
  event: UiCalendarEvent;
  // Drawn as a block filling the room it is placed in, its title over its time, as the hours draw one; otherwise a line,
  // Its time before its title, as a day of the month lists one
  isBlock?: true;
}
// One event as a block of the accent: its time and its title, its description on hover, opened by a click or Enter,
// Dragged to move it, and moved by Alt and an arrow as well
const { event, isBlock } = defineProps<Props>();
const emit = defineEmits<{ dragStart: []; nudge: [duration: Temporal.Duration]; open: [] }>();
// Faded once it has started, as Outlook fades what is behind the current time. Read once as the event draws, which
// Only the browser does, so the fade never has to agree with a server render
const isPast = computed(() => event.start.getTime() < Date.now());
// Alt and an arrow move the event a day across, and down or up a slot of the hours or a week of the month
const getNudgeDuration = (key: string) => {
  const downDuration = isBlock ? CALENDAR_SLOT_DURATION : Temporal.Duration.from({ weeks: 1 });
  switch (key) {
    case "ArrowDown":
      return downDuration;
    case "ArrowLeft":
      return Temporal.Duration.from({ days: -1 });
    case "ArrowRight":
      return Temporal.Duration.from({ days: 1 });
    case "ArrowUp":
      return downDuration.negated();
    default:
      return undefined;
  }
};
</script>

<template>
  <UiTooltip :label="event.title">
    <template #default="{ activatorProps }">
      <button
        :="
          mergeProps(activatorProps, {
            onDragstart: (dragEvent: DragEvent) => {
              // A drag carries nothing without data in some browsers, so the id rides along even though it is read here
              dragEvent.dataTransfer?.setData('text/plain', event.id);
              if (dragEvent.dataTransfer) dragEvent.dataTransfer.effectAllowed = 'move';
              emit('dragStart');
            },
          })
        "
        class="event"
        :data-block="isBlock"
        :data-event-id="event.id"
        :data-past="isPast || undefined"
        :data-variant="UiButtonVariant.Quiet"
        draggable="true"
        type="button"
        text-sm
        text-text
        ui-button
        px-1
        min-h-6
        w-full
        justify-start
        @click="emit('open')"
        @keydown.alt="
          (keyboardEvent: KeyboardEvent) => {
            const duration = getNudgeDuration(keyboardEvent.key);
            if (!duration) return;
            keyboardEvent.preventDefault();
            emit('nudge', duration);
          }
        "
      >
        <!-- A day of the month is too narrow on a phone for the time beside the title, so the time is only read out
          there; the title is what tells one event from another -->
        <NuxtTime
          :datetime="event.start"
          class="time"
          :class="isBlock ? undefined : 'sr-only sm:not-sr-only'"
          hour="numeric"
          minute="2-digit"
          text-muted
          shrink-0
        />
        <span truncate>{{ event.title }}</span>
      </button>
    </template>
    <template #content>
      <div text-heading-color>{{ event.title }}</div>
      <div
        v-if="event.description && !EMPTY_TEXT_REGEX.test(event.description)"
        class="rich-text-content"
        pt-2
        v-html="event.description"
      />
    </template>
  </UiTooltip>
</template>

<style scoped>
/* A block of the accent with a solid edge down its start, so an event reads apart from the day it sits in */
.event {
  background-color: color-mix(in srgb, var(--ui-accent) 16%, transparent);
  box-shadow: inset var(--ui-indicator-width) 0 0 0 var(--ui-accent);
}

/* A block reads down from its top edge, its title first, as Outlook's hours draw one */
.event[data-block] {
  align-items: stretch;
  flex-direction: column;
  gap: 0;
  height: 100%;
  justify-content: flex-start;
}

.event[data-block] .time {
  order: 1;
}

.event[data-past] {
  opacity: 0.6;
}
</style>
