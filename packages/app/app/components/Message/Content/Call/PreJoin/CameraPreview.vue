<script setup lang="ts">
interface CameraPreviewProps {
  isCameraEnabled: boolean;
  stream: MediaStream | undefined;
}

const { isCameraEnabled, stream } = defineProps<CameraPreviewProps>();
</script>

<template>
  <StyledCard rd-xl max-w-lg w-full aspect-video relative overflow-hidden>
    <video
      v-show="isCameraEnabled && stream"
      autoplay
      muted
      playsinline
      size-full
      object-cover
      :srcObject.prop="stream"
    />
    <div v-if="!isCameraEnabled || !stream" flex size-full items-center justify-center>
      <v-icon icon="mdi-camera-off" size="x-large" color="medium-emphasis" />
    </div>
  </StyledCard>
</template>
