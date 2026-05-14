<script setup lang="ts">
import { useKnockerStore } from "@/store/message/room/call/knocker";

interface PreJoinProps {
  callId: string;
}

const props = defineProps<PreJoinProps>();
const knockerStore = useKnockerStore();
const { knockCall } = knockerStore;
const cameraStream = ref<MediaStream | undefined>();
const isCameraEnabled = ref(false);
const isMicEnabled = ref(true);
const isRequestingJoin = ref(false);
const startCamera = async () => {
  try {
    cameraStream.value = await navigator.mediaDevices.getUserMedia({ video: true });
    isCameraEnabled.value = true;
  } catch {
    isCameraEnabled.value = false;
  }
};
const stopCamera = () => {
  cameraStream.value?.getTracks().forEach((track) => track.stop());
  cameraStream.value = undefined;
  isCameraEnabled.value = false;
};
const toggleCamera = async () => {
  if (isCameraEnabled.value) stopCamera();
  else await startCamera();
};
const toggleMic = () => {
  isMicEnabled.value = !isMicEnabled.value;
};
const requestJoin = async () => {
  isRequestingJoin.value = true;
  await knockCall(props.callId);
  isRequestingJoin.value = false;
};

onMounted(startCamera);
onUnmounted(stopCamera);
</script>

<template>
  <div p-6 bg-background flex flex-col gap-y-8 size-full items-center justify-center>
    <h2 font-medium text-headline-small>Ready to join?</h2>
    <MessageContentCallPreJoinCameraPreview :is-camera-enabled :stream="cameraStream" />
    <MessageContentCallPreJoinMediaControls
      :is-camera-enabled
      :is-mic-enabled
      @toggle-camera="toggleCamera()"
      @toggle-mic="toggleMic()"
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
