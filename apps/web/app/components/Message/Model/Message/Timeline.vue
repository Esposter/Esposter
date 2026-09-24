<script setup lang="ts">
import { checkIsSameDay } from "@/util/date/checkIsSameDay";
import { getTimelineDateLabel } from "@/util/date/getTimelineDateLabel";

interface Props {
  messageDate: Date;
  nextMessageDate?: Date;
}

const { messageDate, nextMessageDate } = defineProps<Props>();
const displayDate = computed(() => getTimelineDateLabel(messageDate));
</script>

<template>
  <!-- A day's first message is headed by its date on a line across the list, as Discord divides a day -->
  <div
    v-if="!nextMessageDate || !checkIsSameDay(messageDate, nextMessageDate)"
    role="separator"
    :aria-label="displayDate"
    mt-4
    px-4
    flex
    flex-none
    gap-2
    items-center
  >
    <span bg-divider flex-1 h="[var(--ui-border-width)]" />
    <span text-sm text-muted>{{ displayDate }}</span>
    <span bg-divider flex-1 h="[var(--ui-border-width)]" />
  </div>
</template>
