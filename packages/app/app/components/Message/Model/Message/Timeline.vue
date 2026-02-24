<script setup lang="ts">
import { dayjs } from "#shared/services/dayjs";

interface MessageTimelineProps {
  messageDate: Date;
  nextMessageDate?: Date;
}

const { messageDate, nextMessageDate } = defineProps<MessageTimelineProps>();
const messageDateDayjs = computed(() => dayjs(messageDate));
const areDifferentDays = computed(() => !nextMessageDate || !messageDateDayjs.value.isSame(nextMessageDate, "day"));
const displayDate = computed(() => {
  if (messageDateDayjs.value.isToday()) return "Today";
  else if (messageDateDayjs.value.isYesterday()) return "Yesterday";
  else return messageDateDayjs.value.format("dddd, MMMM Do");
});
</script>

<template>
  <v-row v-if="areDifferentDays" mt-4="!" flex items-center flex-none no-gutters>
    <v-col flex-1>
      <v-divider />
    </v-col>
    <div class="text-title-small" text-center>
      {{ displayDate }}
    </div>
    <v-col flex-1>
      <v-divider />
    </v-col>
  </v-row>
</template>
