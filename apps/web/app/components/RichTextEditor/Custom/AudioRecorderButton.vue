<script setup lang="ts">
import { MimeType } from "#shared/models/file/MimeType";
import { formatDate } from "#shared/util/date/formatDate";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { AUDIO_MESSAGE_DATE_FORMAT, AUDIO_RECORDER_TIMER_INTERVAL_MS } from "@/services/richTextEditor/constants";

const emit = defineEmits<{ "upload-file": [files: File[]] }>();
// Counted from the recording's own start rather than in ticks, since the interval runs from mount and its phase is
// Unrelated to when a recording begins. AUDIO_RECORDER_TIMER_INTERVAL_MS is a second
const elapsedSeconds = ref(0);
let startedAtMs = 0;
const { data, start, state, stop } = useMediaRecorder({
  constraints: { audio: true },
  onError: () => {
    elapsedSeconds.value = 0;
  },
  onStart: () => {
    startedAtMs = Date.now();
    elapsedSeconds.value = 0;
  },
  onStop: () => {
    elapsedSeconds.value = 0;

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
const formattedTimer = computed(() => {
  const minutes = Math.floor(elapsedSeconds.value / 60);
  const seconds = elapsedSeconds.value % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
});

useWorkerInterval(() => {
  if (isRecording.value)
    elapsedSeconds.value = Math.floor((Date.now() - startedAtMs) / AUDIO_RECORDER_TIMER_INTERVAL_MS);
}, AUDIO_RECORDER_TIMER_INTERVAL_MS);
</script>

<template>
  <div flex gap-x-2 items-center>
    <span v-if="isRecording" text-error>
      {{ formattedTimer }}
    </span>
    <UiIconButton
      :label="isRecording ? 'Stop recording' : 'Record audio message'"
      :meaning="isRecording ? UiIconMeaning.Stop : UiIconMeaning.Record"
      :variant="isRecording ? UiButtonVariant.Danger : undefined"
      @click="
        () => {
          if (isRecording) stop();
          else start();
        }
      "
    />
  </div>
</template>
