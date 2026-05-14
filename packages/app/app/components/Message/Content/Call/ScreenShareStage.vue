<script setup lang="ts">
interface CallScreenShareStageProps {
  presenterName: string;
  stream: MediaStream;
}

const { presenterName, stream } = defineProps<CallScreenShareStageProps>();
</script>

<template>
  <div bg-black flex flex-1 min-h-0 items-center justify-center relative>
    <video autoplay playsinline size-full object-contain :srcObject.prop="stream" />
    <div m-4 px-3 py-2 rd bg-surface-opacity-80 bottom-0 left-0 absolute>
      <span font-medium text-body-small>{{ presenterName }}'s screen</span>
    </div>
  </div>
</template>
