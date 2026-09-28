import { LOCAL_STORAGE_KEY_SEPARATOR } from "@/services/shared/constants";

// Central registry for every localStorage key (RoutePath-style) so keys can never overlap.
// Values are kept byte-identical to their historical strings to preserve existing persisted data.
export const LocalStorageKey = {
  // Every paired host's address, this browser's credential for it and the key it proves itself with — each never sent
  // Anywhere but its own host
  AgentConsoleConnections: "agent-console-connections",
  // Whether the console stands over the whole page rather than down its side: a viewer's choice, kept with the browser
  AgentConsoleExpanded: "agent-console-expanded",
  // The console's height as the reader dragged it, in pixels, or 0 before they have: a viewer's choice, kept with the
  // Browser
  AgentConsoleHeight: "agent-console-height",
  // Whether the world labels what the player can use: a viewer's setting, kept with the browser
  AgentConsolePromptsShown: "agent-console-prompts-shown",
  ClickerStore: "clicker-store",
  // Every composer's draft in one entry, keyed by composer inside it: the store holds them as a single Map and
  // That Map is the storage, rather than a key per composer the store has to enumerate to find
  Drafts: "drafts",
  DungeonsStore: "dungeons-store",
  EmojiSkinTone: "emoji-skin-tone",
  MessageCategoryCollapsed: (categoryId: string) => `message-category-${categoryId}-collapsed`,
  MessageDisplayMode: "message-display-mode",
  MessageLeftSideBarWidth: "message-left-side-bar-width",
  MessageRightSideBarWidth: "message-right-side-bar-width",
  MessageSidebarDirectMessagesCollapsed: "message-sidebar-direct-messages-collapsed",
  MessageSidebarRoomsCollapsed: "message-sidebar-rooms-collapsed",
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
