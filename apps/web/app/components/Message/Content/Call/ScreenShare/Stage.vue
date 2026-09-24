<script setup lang="ts">
interface Props {
  isInteractive?: false;
  presenterName: string;
  stream: MediaStream;
}

const { isInteractive = true, presenterName, stream } = defineProps<Props>();
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
      rd="[var(--ui-container-radius)]"
      max-h-full
      max-w-full
      relative
      of-hidden
      :class="isInteractive ? 'cursor-pointer' : undefined"
      @click="isInteractive && emit('fullscreen')"
    >
      <!-- Muted so the freshly opened PiP window (no user activation) can autoplay it — getDisplayMedia
      May bundle a system-audio track, and an unmuted <video> won't autoplay there, leaving it blank.
      Screen-share audio is played via LiveKit's audio pipeline, not this element, so nothing is lost. -->
      <video
        ref="video"
        autoplay
        muted
        playsinline
        size-full
        :srcObject.prop="stream"
        @loadedmetadata="updateAspectRatio()"
        @resize="updateAspectRatio()"
      />
      <template v-if="isInteractive">
        <!-- Hovering the share rings it in the accent and names whose screen it is, easing in and out -->
        <div
          class="reveal"
          rd="[var(--ui-container-radius)]"
          op-0
          pointer-events-none
          inset-0
          absolute
          group-hover:op-100
          shadow="[inset_0_0_0_var(--ui-indicator-width)_var(--ui-accent)]"
        />
        <span
          class="reveal"
          text-sm
          m-4
          px-2
          op-0
          flex
          h-8
          items-center
          bottom-0
          left-0
          absolute
          ui-lifted
          group-hover:op-100
        >
          {{ presenterName }}'s screen
        </span>
      </template>
    </div>
  </div>
</template>

<style scoped>
.reveal {
  transition: opacity var(--ui-motion-short);
}
</style>
