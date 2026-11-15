<script setup lang="ts">
import { UiButtonVariant } from "#src/models/ui/UiButtonVariant";
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { useCallStore } from "#src/store/message/room/call/index";
import { useMediaStore } from "#src/store/message/room/call/media";

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
