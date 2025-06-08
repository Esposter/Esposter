<script setup lang="ts">
import { dayjs } from "#shared/services/dayjs";

interface MessageTimelineProps {
  currentMessageDate: Date;
  nextMessageDate?: Date;
}

const { currentMessageDate, nextMessageDate } = defineProps<MessageTimelineProps>();
const currentMessageDateDayjs = computed(() => dayjs(currentMessageDate));
const areDifferentDays = computed(
  () => !nextMessageDate || !currentMessageDateDayjs.value.isSame(nextMessageDate, "day"),
);
const displayDate = computed(() => {
  if (currentMessageDateDayjs.value.isToday()) return "Today";
  if (currentMessageDateDayjs.value.isYesterday()) return "Yesterday";
  return currentMessageDateDayjs.value.format("dddd, MMMM Do");
});
</script>

<template>
  <v-row v-if="areDifferentDays" mt-4="!" flex flex-none items-center no-gutters>
    <v-col flex-1>
      <v-divider />
    </v-col>
    <div class="text-subtitle-2" text-center>
      {{ displayDate }}
    </div>
    <v-col flex-1>
      <v-divider />
    </v-col>
  </v-row>
</template>
