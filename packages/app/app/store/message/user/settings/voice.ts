// Hardware device selections stay device-local (a device picked on one machine must not apply on another).
// All other voice prefs are synced via the DB-backed useUserSettingsStore.
export const useVoiceDeviceSettingsStore = defineStore("message/user/settings/voiceDevice", () => {
  const inputDeviceId = useLocalStorage("user-settings-voice-input-device-id", "");
  const outputDeviceId = useLocalStorage("user-settings-voice-output-device-id", "");
  const cameraDeviceId = useLocalStorage("user-settings-voice-camera-device-id", "");
  return { cameraDeviceId, inputDeviceId, outputDeviceId };
});
