<script setup lang="ts">
import { dayjs } from "#shared/services/dayjs";
import { getTimelineDateLabel } from "@/services/dayjs/getTimelineDateLabel";

interface MessageTimelineProps {
  messageDate: Date;
  nextMessageDate?: Date;
}

const { messageDate, nextMessageDate } = defineProps<MessageTimelineProps>();
const displayDate = computed(() => getTimelineDateLabel(messageDate));
</script>

<template>
  <v-row
    v-if="!nextMessageDate || !dayjs(messageDate).isSame(nextMessageDate, 'day')"
    mt-4
    flex
    flex-none
    items-center
    density="compact"
  >
    <v-col flex-1>
      <v-divider />
    </v-col>
    <div text-center text-title-small>
      {{ displayDate }}
    </div>
    <v-col flex-1>
      <v-divider />
    </v-col>
  </v-row>
</template>
