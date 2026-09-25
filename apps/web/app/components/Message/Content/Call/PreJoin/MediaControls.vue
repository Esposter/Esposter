<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

interface Props {
  isCameraEnabled: boolean;
  isMicrophoneEnabled: boolean;
}

const { isCameraEnabled, isMicrophoneEnabled } = defineProps<Props>();
const emit = defineEmits<{ toggleCamera: []; toggleMicrophone: [] }>();
</script>

<template>
  <div flex gap-3 justify-center>
    <UiIconButton
      :meaning="isMicrophoneEnabled ? UiIconMeaning.Microphone : UiIconMeaning.MicrophoneOff"
      :label="isMicrophoneEnabled ? 'Mute microphone' : 'Unmute microphone'"
      :variant="isMicrophoneEnabled ? undefined : UiButtonVariant.Danger"
      @click="emit('toggleMicrophone')"
    />
    <UiIconButton
      :meaning="isCameraEnabled ? UiIconMeaning.Camera : UiIconMeaning.CameraOff"
      :label="isCameraEnabled ? 'Turn off camera' : 'Turn on camera'"
      :variant="isCameraEnabled ? undefined : UiButtonVariant.Danger"
      @click="emit('toggleCamera')"
    />
  </div>
</template>
