// Central registry for every localStorage key (RoutePath-style) so keys can never overlap.
// Values are kept byte-identical to their historical strings to preserve existing persisted data.
export const LocalStorageKey = {
  ClickerStore: "clicker-store",
  Draft: (roomId: string) => `draft:${roomId}`,
  DungeonsStore: "dungeons-store",
  IsResourceListCollapsed: "is-resource-list-collapsed",
  SurveyResponseId: "survey-response-id",
  VoiceCameraDeviceId: "user-settings-voice-camera-device-id",
  VoiceInputDeviceId: "user-settings-voice-input-device-id",
  VoiceOutputDeviceId: "user-settings-voice-output-device-id",
} as const;
