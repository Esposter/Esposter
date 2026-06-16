<script setup lang="ts">
interface CallScreenShareStageProps {
  isInteractive?: false;
  presenterName: string;
  stream: MediaStream;
}

const { isInteractive = true, presenterName, stream } = defineProps<CallScreenShareStageProps>();
const emit = defineEmits<{ fullscreen: [] }>();
const video = useTemplateRef("video");
const videoAspectRatio = ref("16 / 9");
const updateAspectRatio = () => {
  if (!video.value) return;
  const { videoHeight, videoWidth } = video.value;
  videoAspectRatio.value = `${videoWidth} / ${videoHeight}`;
};
</script>

<template>
  <div flex flex-1 min-h-0 min-w-0 items-center justify-center>
    <div
      class="group"
      :style="{ aspectRatio: videoAspectRatio }"
      rd-lg
      max-h-full
      max-w-full
      relative
      overflow-hidden
      :class="isInteractive ? 'cursor-pointer' : undefined"
      @click="isInteractive && emit('fullscreen')"
    >
      <video
        ref="video"
        autoplay
        playsinline
        size-full
        :srcObject.prop="stream"
        @loadedmetadata="updateAspectRatio"
        @resize="updateAspectRatio"
      />
      <template v-if="isInteractive">
        <div
          rd-lg
          op-0
          pointer-events-none
          transition-opacity
          inset-0
          absolute
          group-hover:op-100
          shadow="[inset_0_0_0_2px_rgb(var(--v-theme-primary))]"
        />
        <StyledCard m-4 px-3 py-2 rd op-0 transition-opacity bottom-0 left-0 absolute group-hover:op-100>
          <span font-medium text-body-small>{{ presenterName }}'s screen</span>
        </StyledCard>
      </template>
    </div>
  </div>
</template>
