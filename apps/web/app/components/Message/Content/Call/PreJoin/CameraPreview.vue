<script setup lang="ts">
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

interface Props {
  isCameraEnabled: boolean;
  stream?: MediaStream;
}

const { isCameraEnabled, stream } = defineProps<Props>();
</script>

<template>
  <div flex min-h-0 relative of-hidden ui-frame>
    <video
      v-show="isCameraEnabled && stream"
      autoplay
      muted
      playsinline
      size-full
      object-cover
      :srcObject.prop="stream"
    />
    <div v-if="!isCameraEnabled || !stream" text-muted flex flex-col gap-2 size-full items-center justify-center>
      <UiIcon :meaning="UiIconMeaning.CameraOff" />
      <p>Camera is off</p>
    </div>
  </div>
</template>
