import { LOCAL_STORAGE_KEY_SEPARATOR } from "@/services/shared/constants";

// Central registry for every localStorage key (RoutePath-style) so keys can never overlap.
// Values are kept byte-identical to their historical strings to preserve existing persisted data.
export const LocalStorageKey = {
  // Whether the world labels what the player can use: a viewer's setting, kept with the browser
  ClickerStore: "clicker-store",
  // Every composer's draft in one entry, keyed by composer inside it: the store holds them as a single Map and
  // That Map is the storage, rather than a key per composer the store has to enumerate to find
  Drafts: "drafts",
  DungeonsStore: "dungeons-store",
  EmojiSkinTone: "emoji-skin-tone",
  // The developer console's lines and their results, kept with the browser so a reload still shows them
  GenshinDevConsoleHistory: "genshin-dev-console-history",
  // The developer panel's open tab, kept with the browser
  GenshinDevPanelTab: "genshin-dev-panel-tab",
  // The Genshin save an account has not had acknowledged, kept per account with the session that held it, until it is, so a
  // Page left mid-save leaves it for the next start to adopt
  GenshinPending: (userId: string) => `genshin-pending${LOCAL_STORAGE_KEY_SEPARATOR}${userId}`,
  // The Genshin save a signed-out player plays, kept with the browser until a sign-in uploads or merges it into the account
  GenshinSave: "genshin-save",
  MessageCategoryCollapsed: (categoryId: string) => `message-category-${categoryId}-collapsed`,
  MessageDisplayMode: "message-display-mode",
  MessageLeftSideBarWidth: "message-left-side-bar-width",
  MessageRightSideBarWidth: "message-right-side-bar-width",
  MessageSidebarDirectMessagesCollapsed: "message-sidebar-direct-messages-collapsed",
  MessageSidebarRoomsCollapsed: "message-sidebar-rooms-collapsed",
  // Whether a PDF viewer's sidebar is open: a viewer's choice, kept with the browser, and unset until one is made
  PdfSidebarOpen: "pdf-sidebar-open",
  // The tab a PDF viewer's sidebar shows: a viewer's choice, kept with the browser
  PdfSidebarTab: "pdf-sidebar-tab",
  RecentEmojiSlugs: "recent-emoji-slugs",
  // The dock's recent pages: a convenience of the device, not data worth a server round trip
  RecentPages: "recent-pages",
  ResourceListHiddenColumns: "resource-list-hidden-columns",
  ResourceRecentSearches: "resource-recent-searches",
  // Scoped by participant token as well as survey: a shared browser must not resume a response that was
  // Started by a different participant
  SurveyResponseId: (surveyId: string, participantToken: string) =>
    `survey-response-id${LOCAL_STORAGE_KEY_SEPARATOR}${surveyId}${LOCAL_STORAGE_KEY_SEPARATOR}${participantToken}`,
  // Per list, since whether its Completed heading is open is the viewer's convenience and never the list's content
  TodoListCompletedCollapsed: (resourceId: string) => `todo-list-${resourceId}-completed-collapsed`,
  // Per list, since how the viewer sorts it is theirs and never the list's content
  TodoListSort: (resourceId: string) => `todo-list-${resourceId}-sort`,
  VoiceCameraDeviceId: "user-settings-voice-camera-device-id",
  VoiceInputDeviceId: "user-settings-voice-input-device-id",
  VoiceOutputDeviceId: "user-settings-voice-output-device-id",
} as const;
