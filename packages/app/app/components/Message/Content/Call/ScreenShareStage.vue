<script setup lang="ts">
interface CallScreenShareStageProps {
  presenterName: string;
  stream: MediaStream;
}

const { presenterName, stream } = defineProps<CallScreenShareStageProps>();
const stage = useTemplateRef("stage");
const video = useTemplateRef("video");
const { height = 0, width = 0 } = stream.getVideoTracks()[0]?.getSettings() ?? {};
const videoAspectRatio = ref(width && height ? `${width} / ${height}` : "16 / 9");
const updateAspectRatio = () => {
  if (!video.value) return;
  const { videoHeight, videoWidth } = video.value;
  videoAspectRatio.value = `${videoWidth} / ${videoHeight}`;
};
</script>

<template>
  <div m-3 flex flex-1 min-h-0 items-center justify-center>
    <div
      ref="stage"
      class="group"
      :style="{ aspectRatio: videoAspectRatio }"
      rd-2
      max-h-full
      max-w-full
      cursor-pointer
      transition-shadow
      relative
      overflow-hidden
      hover:shadow="[0_0_0_3px_rgb(var(--v-theme-primary)),0_0_16px_6px_rgba(var(--v-theme-primary),0.4)]"
      @click="stage?.requestFullscreen()"
    >
      <video ref="video" autoplay playsinline size-full :srcObject.prop="stream" @loadedmetadata="updateAspectRatio" />
      <StyledCard m-4 px-3 py-2 rd op-0 transition-opacity bottom-0 left-0 absolute group-hover:op-100>
        <span font-medium text-body-small>{{ presenterName }}'s screen</span>
      </StyledCard>
    </div>
  </div>
</template>
