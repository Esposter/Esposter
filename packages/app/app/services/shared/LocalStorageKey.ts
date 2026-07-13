// Central registry for every localStorage key (RoutePath-style) so keys can never overlap.
// Values are kept byte-identical to their historical strings to preserve existing persisted data.
export const LocalStorageKey = {
  ClickerStore: "clicker-store",
  Draft: (roomId: string) => `draft:${roomId}`,
  DungeonsStore: "dungeons-store",
  IsResourceListCollapsed: "is-resource-list-collapsed",
  ResourceListHiddenColumns: "resource-list-hidden-columns",
  ResourceRecentSearches: "resource-recent-searches",
  ResourceRecentViews: "resource-recent-views",
  SurveyResponseId: (surveyId: string) => `survey-response-id:${surveyId}`,
  VoiceCameraDeviceId: "user-settings-voice-camera-device-id",
  VoiceInputDeviceId: "user-settings-voice-input-device-id",
  VoiceOutputDeviceId: "user-settings-voice-output-device-id",
} as const;
