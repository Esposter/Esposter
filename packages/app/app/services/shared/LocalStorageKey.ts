// Central registry for every localStorage key (RoutePath-style) so keys can never overlap.
// Values are kept byte-identical to their historical strings to preserve existing persisted data.
export const LocalStorageKey = {
  ClickerStore: "clicker-store",
  Draft: (composerKey: string) => `draft:${composerKey}`,
  DungeonsStore: "dungeons-store",
  IsResourceBladeNavCollapsed: "is-resource-blade-nav-collapsed",
  MessageCategoryCollapsed: (categoryId: string) => `message-category-${categoryId}-collapsed`,
  MessageDisplayMode: "message-display-mode",
  MessageLeftSideBarWidth: "message-left-side-bar-width",
  MessageRightSideBarWidth: "message-right-side-bar-width",
  MessageSidebarDirectMessagesCollapsed: "message-sidebar-direct-messages-collapsed",
  MessageSidebarRoomsCollapsed: "message-sidebar-rooms-collapsed",
  ResourceListHiddenColumns: "resource-list-hidden-columns",
  ResourceRecentSearches: "resource-recent-searches",
  // Scoped by participant token as well as survey: a shared browser must not resume a response that was
  // Started by a different participant
  SurveyResponseId: (surveyId: string, participantToken: string) =>
    `survey-response-id:${surveyId}:${participantToken}`,
  VoiceCameraDeviceId: "user-settings-voice-camera-device-id",
  VoiceInputDeviceId: "user-settings-voice-input-device-id",
  VoiceOutputDeviceId: "user-settings-voice-output-device-id",
} as const;
// The fixed keys only — a component handed a key to persist against takes one from this registry rather than
// Any string, which is what keeps the registry the single guarantee that keys cannot overlap
export type LocalStorageKeyValue = Extract<(typeof LocalStorageKey)[keyof typeof LocalStorageKey], string>;
