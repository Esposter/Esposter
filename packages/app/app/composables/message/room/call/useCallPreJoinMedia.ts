import { useKnockerStore } from "@/store/message/room/call/knocker";
import { getResultAsync } from "@esposter/shared";

export const useCallPreJoinMedia = () => {
  const knockerStore = useKnockerStore();
  const { joinCallOptions } = storeToRefs(knockerStore);
  // UseUserMedia retains the live camera stream and releases it on scope dispose.
  const {
    start: startCameraStream,
    stop: stopCameraStream,
    stream: cameraStream,
  } = useUserMedia({ constraints: { video: true } });
  // The microphone is only probed for permission, so its stream is released immediately after start.
  const { start: startMicrophoneStream, stop: stopMicrophoneStream } = useUserMedia({ constraints: { audio: true } });
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
    await getResultAsync(startCameraStream).match(
      (stream) => {
        isCameraEnabled.value = Boolean(stream);
      },
      () => {
        isCameraEnabled.value = false;
      },
    );
  };
  const stopCamera = () => {
    stopCameraStream();
    isCameraEnabled.value = false;
  };
  const toggleCamera = async () => {
    if (isCameraEnabled.value) stopCamera();
    else await startCamera();
  };
  const startMicrophone = async () => {
    await getResultAsync(startMicrophoneStream).match(
      (stream) => {
        isMicrophoneEnabled.value = Boolean(stream);
        stopMicrophoneStream();
      },
      () => {
        isMicrophoneEnabled.value = false;
      },
    );
  };
  const toggleMicrophone = async () => {
    if (isMicrophoneEnabled.value) isMicrophoneEnabled.value = false;
    else await startMicrophone();
  };

  onMounted(async () => {
    await Promise.all([startMicrophone(), startCamera()]);
  });

  return {
    cameraStream,
    isCameraEnabled,
    isMicrophoneEnabled,
    toggleCamera,
    toggleMicrophone,
  };
};
