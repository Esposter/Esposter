<script setup lang="ts">
interface CameraPreviewProps {
  isCameraEnabled: boolean;
  stream: MediaStream | undefined;
}

const { isCameraEnabled, stream } = defineProps<CameraPreviewProps>();
</script>

<template>
  <StyledCard aspect-video relative overflow-hidden>
    <video
      v-show="isCameraEnabled && stream"
      autoplay
      muted
      playsinline
      size-full
      object-cover
      :srcObject.prop="stream"
    />
    <div v-if="!isCameraEnabled || !stream" flex flex-col gap-y-3 size-full items-center justify-center>
      <v-icon icon="mdi-camera-off" size="x-large" color="medium-emphasis" />
      <span text-body-medium op-medium-emphasis>Camera is off</span>
    </div>
  </StyledCard>
</template>
