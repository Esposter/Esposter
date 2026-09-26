<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { useCallStore } from "@/store/message/room/call";
import { useMediaStore } from "@/store/message/room/call/media";

const callStore = useCallStore();
const { toggleCamera } = callStore;
const mediaStore = useMediaStore();
const { isCameraEnabled } = storeToRefs(mediaStore);
</script>

<template>
  <UiIconButton
    :meaning="isCameraEnabled ? UiIconMeaning.Camera : UiIconMeaning.CameraOff"
    :label="isCameraEnabled ? 'Turn Camera Off' : 'Turn Camera On'"
    :variant="isCameraEnabled ? undefined : UiButtonVariant.Danger"
    @click="toggleCamera()"
  />
</template>
