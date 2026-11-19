import { LocalStorageKey } from "#src/services/shared/LocalStorageKey";

// Hardware device selections stay device-local (a device picked on one machine must not apply on another).
// All other voice prefs are synced via the DB-backed useUserSettingsStore.
export const useVoiceDeviceSettingsStore = defineStore("message/user/settings/voiceDevice", () => {
  const inputDeviceId = useLocalStorage(LocalStorageKey.VoiceInputDeviceId, "");
  const outputDeviceId = useLocalStorage(LocalStorageKey.VoiceOutputDeviceId, "");
  const cameraDeviceId = useLocalStorage(LocalStorageKey.VoiceCameraDeviceId, "");
  // One enumeration and one devicechange listener serve every device picker and the input sensitivity panel, so each
  // of them reads the same list rather than enumerating and listening for its own
  const { audioInputs, audioOutputs, ensurePermissions, permissionGranted, videoInputs } = useDevicesList();
  return {
    audioInputs,
    audioOutputs,
    cameraDeviceId,
    ensurePermissions,
    inputDeviceId,
    outputDeviceId,
    permissionGranted,
    videoInputs,
  };
});
