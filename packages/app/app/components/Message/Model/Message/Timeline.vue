<script setup lang="ts">
import { getTimelineDateLabel } from "@/util/date/getTimelineDateLabel";
import { checkIsSameDay } from "@esposter/shared";

interface Props {
  messageDate: Date;
  nextMessageDate?: Date;
}

const { messageDate, nextMessageDate } = defineProps<Props>();
const displayDate = computed(() => getTimelineDateLabel(messageDate));
</script>

<template>
  <v-row
    v-if="!nextMessageDate || !checkIsSameDay(messageDate, nextMessageDate)"
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
