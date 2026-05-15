import type { JoinCallOptions } from "@/models/message/room/call/JoinCallOptions";

import { getResultAsync } from "@esposter/shared";

export const useCallPreJoinMedia = () => {
  const cameraStream = ref<MediaStream>();
  const isCameraEnabled = ref(false);
  const isMicrophoneEnabled = ref(true);
  const joinCallOptions = computed<JoinCallOptions>(() => ({
    isCameraEnabled: isCameraEnabled.value,
    isMicrophoneEnabled: isMicrophoneEnabled.value,
  }));
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
  const stopCamera = () => {
    const stream = cameraStream.value;
    if (stream) for (const track of stream.getTracks()) track.stop();

    cameraStream.value = undefined;
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
    stopCamera();
  });

  return {
    cameraStream,
    isCameraEnabled,
    isMicrophoneEnabled,
    joinCallOptions,
    toggleCamera,
    toggleMicrophone,
  };
};
