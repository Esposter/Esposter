import { useKnockerStore } from "@/store/message/room/call/knocker";
import { useVoiceDeviceSettingsStore } from "@/store/message/user/settings/voice";
import { getResultAsync } from "@esposter/shared";

export const useCallPreJoinMedia = () => {
  const knockerStore = useKnockerStore();
  const { joinCallOptions } = storeToRefs(knockerStore);
  const voiceDeviceSettingsStore = useVoiceDeviceSettingsStore();
  const { cameraDeviceId, inputDeviceId } = storeToRefs(voiceDeviceSettingsStore);
  const cameraConstraints = computed<MediaStreamConstraints>(() => ({
    video: { deviceId: cameraDeviceId.value || undefined },
  }));
  const microphoneConstraints = computed<MediaStreamConstraints>(() => ({
    audio: { deviceId: inputDeviceId.value || undefined },
  }));
  // UseUserMedia retains the live camera stream and releases it on scope dispose.
  const {
    start: startCameraStream,
    stop: stopCameraStream,
    stream: cameraStream,
  } = useUserMedia({ constraints: cameraConstraints });
  // The microphone is only probed for permission, so its stream is released immediately after start.
  const { start: startMicrophoneStream, stop: stopMicrophoneStream } = useUserMedia({
    constraints: microphoneConstraints,
  });
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
