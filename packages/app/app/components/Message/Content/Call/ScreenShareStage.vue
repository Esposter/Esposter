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
      class="stage"
      :style="{ aspectRatio: videoAspectRatio }"
      rd-2
      max-h-full
      max-w-full
      cursor-pointer
      relative
      overflow-hidden
      @click="stage?.requestFullscreen()"
    >
      <video ref="video" autoplay playsinline size-full :srcObject.prop="stream" @loadedmetadata="updateAspectRatio" />
      <StyledCard m-4 px-3 py-2 rd bottom-0 left-0 absolute>
        <span font-medium text-body-small>{{ presenterName }}'s screen</span>
      </StyledCard>
    </div>
  </div>
</template>

<style scoped>
.stage {
  transition: box-shadow 0.15s ease;
}
.stage:hover {
  box-shadow:
    0 0 0 3px rgb(var(--v-theme-primary)),
    0 0 16px 6px rgba(var(--v-theme-primary), 0.4);
}
</style>
