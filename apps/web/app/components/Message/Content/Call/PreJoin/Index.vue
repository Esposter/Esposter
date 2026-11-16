<script setup lang="ts">
interface Props {
  callId: string;
  isCreator: boolean;
}

defineProps<Props>();
const { cameraStream, isCameraEnabled, isMicrophoneEnabled, toggleCamera, toggleMicrophone } = useCallPreJoinMedia();
</script>

<!-- The ready room: the reader's own camera across most of the width with its two switches over its foot, as Meet's
     is, and beside it the one thing to do next -->
<template>
  <div p-6 flex flex-col gap-6 size-full of-y-auto lg:flex-row>
    <div flex grow-2 basis-0 min-h-0 min-w-0 relative>
      <MessageContentCallPreJoinCameraPreview size-full :is-camera-enabled :stream="cameraStream" />
      <MessageContentCallPreJoinMediaControls
        :is-camera-enabled
        :is-microphone-enabled
        inset-x-0
        bottom-4
        absolute
        @toggle-camera="toggleCamera()"
        @toggle-microphone="toggleMicrophone()"
      />
    </div>
    <div text-center flex grow basis-0 flex-col gap-4 items-center justify-center>
      <h1 ui-title>Ready to join?</h1>
      <p text-muted>
        {{
          isCreator ? "Start the call when you're ready." : "You'll wait in the ready room until someone admits you."
        }}
      </p>
      <MessageContentCallPreJoinEntryButton :call-id :is-creator />
    </div>
  </div>
</template>
