<script setup lang="ts">
interface CameraPreviewProps {
  isCameraEnabled: boolean;
  stream: MediaStream | undefined;
}

const { isCameraEnabled, stream } = defineProps<CameraPreviewProps>();
const videoRef = ref<HTMLVideoElement>();

watch(
  () => stream,
  (newStream) => {
    if (videoRef.value) videoRef.value.srcObject = newStream ?? null;
  },
);
</script>

<template>
  <div bg-surface-variant rd-xl overflow-hidden relative aspect-video w-full max-w-lg>
    <video v-show="isCameraEnabled && stream" ref="videoRef" autoplay muted playsinline size-full object-cover />
    <div v-if="!isCameraEnabled || !stream" size-full flex items-center justify-center>
      <v-icon icon="mdi-camera-off" size="x-large" color="medium-emphasis" />
    </div>
  </div>
</template>
