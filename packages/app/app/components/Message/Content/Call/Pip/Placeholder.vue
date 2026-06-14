<script setup lang="ts">
import { useMediaStore } from "@/store/message/room/call/media";

const mediaStore = useMediaStore();
const { isPoppedOut } = storeToRefs(mediaStore);
</script>

<template>
  <div p-8 text-center flex flex-1 flex-col gap-y-4 items-center justify-center>
    <v-icon icon="mdi-picture-in-picture-bottom-right" size="64" text-primary />
    <div flex flex-col gap-y-1>
      <span text-h6>Your call is in a mini player</span>
      <span text-gray text-body-small>The call moved to a picture-in-picture window.</span>
    </div>
    <v-btn color="primary" variant="tonal" prepend-icon="mdi-arrow-expand" @click="isPoppedOut = false">
      Bring call back here
    </v-btn>
  </div>
</template>
