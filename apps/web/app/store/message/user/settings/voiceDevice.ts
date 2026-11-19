import { LocalStorageKey } from "#src/services/shared/LocalStorageKey";
import { getResultAsync } from "@esposter/shared";

// Hardware device selections stay device-local (a device picked on one machine must not apply on another).
// All other voice prefs are synced via the DB-backed useUserSettingsStore.
export const useVoiceDeviceSettingsStore = defineStore("message/user/settings/voiceDevice", () => {
  const inputDeviceId = useLocalStorage(LocalStorageKey.VoiceInputDeviceId, "");
  const outputDeviceId = useLocalStorage(LocalStorageKey.VoiceOutputDeviceId, "");
  const cameraDeviceId = useLocalStorage(LocalStorageKey.VoiceCameraDeviceId, "");
  // One enumeration and one devicechange listener serve every device picker and the input sensitivity panel, so each
  // Of them reads the same list rather than enumerating and listening for its own
  const { audioInputs, audioOutputs, ensurePermissions, permissionGranted, videoInputs } = useDevicesList();
  const microphoneConstraints = computed<MediaStreamConstraints>(() => ({
    audio: inputDeviceId.value ? { deviceId: inputDeviceId.value } : {},
  }));
  const { start: startMicrophone, stop: stopMicrophone } = useUserMedia({ constraints: microphoneConstraints });
  // The microphone is one stream for every panel that reads its level. The first holder asks for it and a later one
  // Joins that request; the last holder to let go closes it, and a request still pending closes once it lands
  const microphoneHolders = new Set<symbol>();
  let microphoneRequest: Promise<MediaStream | undefined> | undefined;
  let isMicrophoneSettled = false;
  const closeMicrophone = () => {
    microphoneRequest = undefined;
    isMicrophoneSettled = false;
    stopMicrophone();
  };
  const holdMicrophone = (holder: symbol) => {
    microphoneHolders.add(holder);
    microphoneRequest ??= getResultAsync(() => startMicrophone()).match(
      (stream) => {
        isMicrophoneSettled = true;
        if (microphoneHolders.size === 0) closeMicrophone();
        return stream;
      },
      (error) => {
        closeMicrophone();
        console.error(error);
        return undefined;
      },
    );
    return microphoneRequest;
  };
  const releaseMicrophone = (holder: symbol) => {
    microphoneHolders.delete(holder);
    if (microphoneHolders.size === 0 && isMicrophoneSettled) closeMicrophone();
  };
  return {
    audioInputs,
    audioOutputs,
    cameraDeviceId,
    ensurePermissions,
    holdMicrophone,
    inputDeviceId,
    outputDeviceId,
    permissionGranted,
    releaseMicrophone,
    videoInputs,
  };
});
