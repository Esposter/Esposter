<script setup lang="ts">
interface CallScreenShareStageProps {
  presenterName: string;
  stream: MediaStream;
}

const { presenterName, stream } = defineProps<CallScreenShareStageProps>();

const containerRef = ref<HTMLDivElement>();
</script>

<template>
  <div
    ref="containerRef"
    p-3
    b-1
    b-transparent
    rd-2
    b-solid
    flex
    flex-1
    cursor-pointer
    transition-colors
    relative
    overflow-hidden
    hover:b-primary
    @click="containerRef?.requestFullscreen()"
  >
    <video autoplay playsinline size-full object-contain :srcObject.prop="stream" />
    <StyledCard px-3 py-2 rd bottom-0 left-0 absolute>
      <span font-medium text-body-small>{{ presenterName }}'s screen</span>
    </StyledCard>
  </div>
</template>
