<script setup lang="ts">
import { MimeType } from "#shared/models/file/MimeType";
import { formatDate } from "#shared/util/date/formatDate";
import { AUDIO_MESSAGE_DATE_FORMAT, AUDIO_RECORDER_TIMER_INTERVAL_MS } from "@/services/richTextEditor/constants";
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
    }, AUDIO_RECORDER_TIMER_INTERVAL_MS);
  },
  onStop: () => {
    resetTimer();

    if (data.value.length === 0) return;

    const blob = new Blob(data.value, { type: MimeType.AudioWebm });
    // eslint-disable-next-line no-restricted-syntax -- a filename, not text a reader sees
    const file = new File([blob], `Audio Message - ${formatDate(new Date(), AUDIO_MESSAGE_DATE_FORMAT)}.webm`, {
      type: MimeType.AudioWebm,
    });
    emit("upload-file", [file]);
  },
});
const isRecording = computed(() => state.value === "recording");
const recordButtonProps = computed(() => ({
  color: isRecording.value ? "error" : undefined,
  size: "small" as const,
}));
const formattedTimer = computed(() => {
  const minutes = Math.floor(timer.value / 60);
  const seconds = timer.value % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
});
</script>

<template>
  <div flex gap-x-2 items-center>
    <span v-if="isRecording" font-bold>
      {{ formattedTimer }}
    </span>
    <StyledTooltipIconButton
      :button-props="recordButtonProps"
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
