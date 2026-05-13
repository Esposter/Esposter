<script setup lang="ts">
interface CallScreenShareStageProps {
  presenterName: string;
  stream: MediaStream;
}

const { presenterName, stream } = defineProps<CallScreenShareStageProps>();
</script>

<template>
  <div bg-black flex flex-1 items-center justify-center min-h-0 relative>
    <video autoplay playsinline object-contain size-full :srcObject.prop="stream" />
    <div m-4 px-3 py-2 rd bg-surface-opacity-80 bottom-0 left-0 absolute>
      <span text-body-small font-medium>{{ presenterName }}'s screen</span>
    </div>
  </div>
</template>
