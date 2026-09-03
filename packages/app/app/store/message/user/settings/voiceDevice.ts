import { LocalStorageKey } from "@/services/shared/LocalStorageKey";

// Hardware device selections stay device-local (a device picked on one machine must not apply on another).
// All other voice prefs are synced via the DB-backed useUserSettingsStore.
export const useVoiceDeviceSettingsStore = defineStore("message/user/settings/voiceDevice", () => {
  const inputDeviceId = useLocalStorage(LocalStorageKey.VoiceInputDeviceId, "");
  const outputDeviceId = useLocalStorage(LocalStorageKey.VoiceOutputDeviceId, "");
  const cameraDeviceId = useLocalStorage(LocalStorageKey.VoiceCameraDeviceId, "");
  return { cameraDeviceId, inputDeviceId, outputDeviceId };
});
