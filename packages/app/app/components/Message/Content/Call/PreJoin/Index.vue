<script setup lang="ts">
import { useKnockerStore } from "@/store/message/room/call/knocker";

interface PreJoinProps {
  callId: string;
}

const props = defineProps<PreJoinProps>();
const knockerStore = useKnockerStore();
const { knockCall } = knockerStore;
const isRequestingJoin = ref(false);
const { cameraStream, isCameraEnabled, isMicrophoneEnabled, joinCallOptions, toggleCamera, toggleMicrophone } =
  useCallPreJoinMedia();
const requestJoin = async () => {
  isRequestingJoin.value = true;
  await knockCall(props.callId, joinCallOptions.value);
  isRequestingJoin.value = false;
};
</script>

<template>
  <div p-6 bg-background flex flex-col gap-y-8 size-full items-center justify-center>
    <h2 font-medium text-headline-small>Ready to join?</h2>
    <MessageContentCallPreJoinCameraPreview :is-camera-enabled :stream="cameraStream" />
    <MessageContentCallPreJoinMediaControls
      :is-camera-enabled
      :is-microphone-enabled
      @toggle-camera="toggleCamera()"
      @toggle-microphone="toggleMicrophone()"
    />
    <v-btn
      :loading="isRequestingJoin"
      color="primary"
      size="large"
      text="Request to join"
      variant="elevated"
      @click="requestJoin()"
    />
  </div>
</template>
