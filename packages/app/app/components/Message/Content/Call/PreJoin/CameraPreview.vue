<script setup lang="ts">
interface CameraPreviewProps {
  isCameraEnabled: boolean;
  stream: MediaStream | undefined;
}

const { isCameraEnabled, stream } = defineProps<CameraPreviewProps>();
const video = useTemplateRef("video");

watch(
  () => stream,
  (newStream) => {
    if (video.value) video.value.srcObject = newStream ?? null;
  },
);
</script>

<template>
  <StyledCard rd-xl max-w-lg w-full aspect-video relative overflow-hidden>
    <video v-show="isCameraEnabled && stream" ref="video" autoplay muted playsinline size-full object-cover />
    <div v-if="!isCameraEnabled || !stream" flex size-full items-center justify-center>
      <v-icon icon="mdi-camera-off" size="x-large" color="medium-emphasis" />
    </div>
  </StyledCard>
</template>
