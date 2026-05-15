import { getResultAsync } from "@esposter/shared";
import { useKnockerStore } from "@/store/message/room/call/knocker";

export const useCallPreJoinMedia = () => {
  const knockerStore = useKnockerStore();
  const { joinCallOptions } = storeToRefs(knockerStore);
  const cameraStream = ref<MediaStream>();
  const isCameraEnabled = computed({
    get: () => joinCallOptions.value.isCameraEnabled,
    set: (value) => {
      joinCallOptions.value = { ...joinCallOptions.value, isCameraEnabled: value };
    },
  });
  const isMicrophoneEnabled = computed({
    get: () => joinCallOptions.value.isMicrophoneEnabled,
    set: (value) => {
      joinCallOptions.value = { ...joinCallOptions.value, isMicrophoneEnabled: value };
    },
  });
  const startCamera = async () => {
    await getResultAsync(() => window.navigator.mediaDevices.getUserMedia({ video: true })).match(
      (stream) => {
        cameraStream.value = stream;
        isCameraEnabled.value = true;
      },
      () => {
        isCameraEnabled.value = false;
      },
    );
  };
  const stopCameraStream = () => {
    const stream = cameraStream.value;
    if (stream) for (const track of stream.getTracks()) track.stop();

    cameraStream.value = undefined;
  };
  const stopCamera = () => {
    stopCameraStream();
    isCameraEnabled.value = false;
  };
  const toggleCamera = async () => {
    if (isCameraEnabled.value) stopCamera();
    else await startCamera();
  };
  const toggleMicrophone = () => {
    isMicrophoneEnabled.value = !isMicrophoneEnabled.value;
  };

  onMounted(async () => {
    await startCamera();
  });
  onUnmounted(() => {
    stopCameraStream();
  });

  return {
    cameraStream,
    isCameraEnabled,
    isMicrophoneEnabled,
    toggleCamera,
    toggleMicrophone,
  };
};
