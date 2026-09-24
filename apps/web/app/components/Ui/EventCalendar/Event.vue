<script setup lang="ts">
import type { UiCalendarEvent } from "@/models/ui/UiCalendarEvent";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { EMPTY_TEXT_REGEX } from "@/util/text/constants";
import { mergeProps } from "vue";

interface Props {
  event: UiCalendarEvent;
}

// One event as a block of the accent: its time and its title, its description on hover, opened by a click or Enter and
// Dragged to move it
const { event } = defineProps<Props>();
const emit = defineEmits<{ dragStart: []; open: [] }>();
// Faded once it has started, as Outlook fades what is behind the current time. Read once as the event draws, which
// Only the browser does, so the fade never has to agree with a server render
const isPast = computed(() => event.start.getTime() < Date.now());
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
      >
        <NuxtTime :datetime="event.start" hour="numeric" minute="2-digit" text-muted shrink-0 />
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

.event[data-past] {
  opacity: 0.6;
}
</style>
