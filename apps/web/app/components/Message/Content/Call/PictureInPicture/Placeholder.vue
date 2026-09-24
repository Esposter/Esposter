<script setup lang="ts">
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { useMediaStore } from "@/store/message/room/call/media";

const mediaStore = useMediaStore();
const { isPoppedOut } = storeToRefs(mediaStore);
</script>

<template>
  <UiEmptyState
    description="The call moved to a picture-in-picture window."
    :meaning="UiIconMeaning.External"
    title="Your call is in a mini player"
    flex-1
  >
    <UiButton @click="isPoppedOut = false">
      <UiIcon :meaning="UiIconMeaning.Expand" />
      Bring call back here
    </UiButton>
  </UiEmptyState>
</template>
