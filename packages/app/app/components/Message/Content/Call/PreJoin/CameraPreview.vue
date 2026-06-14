<script setup lang="ts">
interface CameraPreviewProps {
  isCameraEnabled: boolean;
  stream: MediaStream | undefined;
}

const { isCameraEnabled, stream } = defineProps<CameraPreviewProps>();
</script>

<template>
  <StyledCard flex min-h-0 relative overflow-hidden>
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
      <span op-medium-emphasis text-body-medium>Camera is off</span>
    </div>
  </StyledCard>
</template>
