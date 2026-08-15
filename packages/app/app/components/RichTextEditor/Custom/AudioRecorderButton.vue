<script setup lang="ts">
import { MimeType } from "#shared/models/file/MimeType";
import { dayjs } from "#shared/services/dayjs";
import { AUDIO_RECORDER_TIMER_INTERVAL } from "@/services/richTextEditor/constants";
import { clearInterval, setInterval } from "worker-timers";

const emit = defineEmits<{ "upload-file": [files: File[]] }>();
const timer = ref(0);
let timerInterval: number | undefined;
const resetTimer = () => {
  timer.value = 0;
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = undefined;
};
const { data, start, state, stop } = useMediaRecorder({
  constraints: { audio: true },
  onError: () => {
    resetTimer();
  },
  onStart: () => {
    timerInterval = setInterval(() => {
      timer.value++;
    }, AUDIO_RECORDER_TIMER_INTERVAL);
  },
  onStop: () => {
    resetTimer();

    if (data.value.length === 0) return;

    const blob = new Blob(data.value, { type: MimeType.AudioWebm });
    const file = new File([blob], `Audio Message - ${dayjs().format("YYYY-MM-DD HH:mm:ss")}.webm`, {
      type: MimeType.AudioWebm,
    });
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
  <div flex items-center>
    <span v-if="isRecording" font-bold pr-2>
      {{ formattedTimer }}
    </span>
    <StyledTooltipIconButton
      :button-props="{ color: isRecording ? 'error' : undefined, size: 'small' }"
      :icon="isRecording ? 'mdi-stop-circle-outline' : 'mdi-microphone'"
      :text="isRecording ? 'Stop Recording' : 'Record Audio Message'"
      @click="
        () => {
          if (isRecording) stop();
          else start();
        }
      "
    />
  </div>
</template>
