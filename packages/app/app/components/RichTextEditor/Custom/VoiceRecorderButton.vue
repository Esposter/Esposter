<script setup lang="ts">
import { dayjs } from "#shared/services/dayjs";
import { useAlertStore } from "@/store/alert";
import { clearInterval, setInterval } from "worker-timers";

const emit = defineEmits<{ "upload-file": [files: File[]] }>();
const timer = ref(0);
let timerInterval: null | ReturnType<typeof setInterval> = null;
const { data, start, state, stop } = useMediaRecorder({
  constraints: { audio: true },
  onStart: () => {
    timer.value = 0;
    timerInterval = setInterval(() => {
      timer.value++;
    }, 1000);
  },
  onStop: () => {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = null;

    if (data.value.length === 0) return;

    const type = "audio/webm";
    const blob = new Blob(data.value, { type });
    const file = new File([blob], `Voice Message - ${dayjs().format("YYYY-MM-DD HH:mm:ss")}.webm`, { type });
    emit("upload-file", [file]);
  },
});
const isRecording = computed(() => state.value === "recording");
const formattedTimer = computed(() => {
  const minutes = Math.floor(timer.value / 60);
  const seconds = timer.value % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
});
</script>

<template>
  <v-tooltip :text="isRecording ? 'Stop Recording' : 'Record Voice Message'">
    <template #activator="{ props }">
      <div flex items-center>
        <span v-if="isRecording" mr-2 text-caption text-error font-bold>
          {{ formattedTimer }}
        </span>
        <v-btn
          :="props"
          :color="isRecording ? 'error' : undefined"
          :icon="isRecording ? 'mdi-stop-circle-outline' : 'mdi-microphone'"
          size="small"
          @click="
            () => {
              if (isRecording) stop();
              else start();
            }
          "
        />
      </div>
    </template>
  </v-tooltip>
</template>
