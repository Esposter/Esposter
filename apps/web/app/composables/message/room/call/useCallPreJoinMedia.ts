import { MutationStatus } from "@/models/shared/MutationStatus";
import { useKnockerStore } from "@/store/message/room/call/knocker";
import { useVoiceDeviceSettingsStore } from "@/store/message/user/settings/voiceDevice";

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
  // `useUserMedia` retains the live camera stream and releases it on scope dispose.
  const {
    start: startCameraStream,
    stop: stopCameraStream,
    stream: cameraStream,
  } = useUserMedia({ constraints: cameraConstraints });
  // The microphone is only probed for permission, so its stream is released immediately after start.
  const { start: startMicrophoneStream, stop: stopMicrophoneStream } = useUserMedia({
    constraints: microphoneConstraints,
  });
  const { executeQuery } = useMutation();
  let isDisposed = false;
  onScopeDispose(() => {
    isDisposed = true;
  });
  // A device's stream is requested once while it is pending: the mount probe and a toggle that lands during it share
  // One call, since a second request overwrites the first stream and leaves its tracks running.
  // A refused or unavailable device is logged rather than dropped: the reason is only in the error, and the pre-join
  // Screen is where a wrong device id or a blocked permission is diagnosed.
  const startDevice = (key: string, start: () => Promise<MediaStream | undefined>) =>
    executeQuery(start, { isExclusive: true, key, onError: console.error });
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
    const outcome = await startDevice("camera", startCameraStream);
    // A page left during the permission prompt has no owner for the stream that prompt then delivers, so it is stopped here
    if (isDisposed) {
      stopCameraStream();
      return;
    }
    isCameraEnabled.value = outcome.status === MutationStatus.Succeeded && Boolean(outcome.result);
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
    const outcome = await startDevice("microphone", startMicrophoneStream);
    stopMicrophoneStream();
    return outcome;
  };
  // The probe reports only that the microphone is unavailable. A success leaves the join option alone, because the
  // Member may have muted while the permission prompt was up, and that choice is the one the join keeps
  const probeMicrophone = async () => {
    const { status } = await startMicrophone();
    if (status !== MutationStatus.Succeeded) isMicrophoneEnabled.value = false;
  };
  const toggleMicrophone = async () => {
    if (isMicrophoneEnabled.value) {
      isMicrophoneEnabled.value = false;
      return;
    }
    const { status } = await startMicrophone();
    isMicrophoneEnabled.value = status === MutationStatus.Succeeded;
  };

  onMounted(async () => {
    await Promise.all([probeMicrophone(), startCamera()]);
  });

  return { cameraStream, isCameraEnabled, isMicrophoneEnabled, toggleCamera, toggleMicrophone };
};
