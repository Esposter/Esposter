<script setup lang="ts">
import { useCallStore } from "@/store/message/room/call";

const props = defineProps<{ callId: string }>();

const callStore = useCallStore();
const { knockCall } = callStore;

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
  <div bg-background flex flex-col items-center justify-center size-full gap-y-8 p-6>
    <h2 text-headline-small font-medium>Ready to join?</h2>
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
