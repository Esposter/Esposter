<script setup lang="ts">
import dayjs from "dayjs";

interface MessageTimelineProps {
  currentMessageDate: Date;
  nextMessageDate: Date | undefined;
}

const props = defineProps<MessageTimelineProps>();
const { currentMessageDate, nextMessageDate } = $(toRefs(props));
const { border } = useColors();
const currentMessageDateDayjs = $computed(() => dayjs(currentMessageDate));
const areDifferentDays = $computed(() => !nextMessageDate || !currentMessageDateDayjs.isSame(nextMessageDate, "day"));
const displayDate = $computed(() => {
  if (currentMessageDateDayjs.isToday()) return "Today";
  if (currentMessageDateDayjs.isYesterday()) return "Yesterday";
  return currentMessageDateDayjs.format("dddd, MMMM Do");
});
</script>

<template>
  <v-container v-if="areDifferentDays" px="0!" fluid>
    <v-row display="flex" items="center" no-gutters>
      <v-col flex="1">
        <v-divider />
      </v-col>
      <div class="text-subtitle-2 border" px="4" py="2" rd="full" text="center">
        {{ displayDate }}
      </div>
      <v-col flex="1">
        <v-divider />
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped lang="scss">
.border {
  border: 1px solid v-bind(border);
}
</style>
