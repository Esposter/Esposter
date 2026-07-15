/* eslint-disable perfectionist/sort-objects */
// Logical sidebar groups for sections with many flat feature pages — declaration order is the display
// Order, membership is by page slug. Sections without an entry render their pages ungrouped (alphabetical
// Is enough below ~6 pages), and roadmap/deferred/rejected always trail in an automatic Planning group.
export const DocsSectionGroupsMap: Readonly<Record<string, Readonly<Record<string, readonly string[]>>>> = {
  architecture: {
    "Core standards": [
      "platform",
      "resources",
      "datasets",
      "publishing",
      "serialization",
      "client-data",
      "persisted-data-latest-shape-only",
      "destructive-confirmation",
      "singleton-dialogs",
      "navigation",
      "search",
    ],
    Backend: ["auth", "azure-services", "file-uploads"],
    Development: ["environment", "monorepo-tooling", "server-testing"],
  },
  esbabbler: {
    Messaging: [
      "messaging",
      "message-list-rendering",
      "room-ui",
      "mention-badges",
      "slash-commands",
      "scheduled-messages",
      "drafts-and-sent",
    ],
    "Members & profiles": [
      "friends-and-dms",
      "profiles-and-presence",
      "nicknames",
      "invites",
      "settings",
      "room-settings",
    ],
    Moderation: ["moderation", "rbac"],
    Calls: ["voice-video", "push-to-talk", "calls"],
    Infrastructure: ["push-notifications", "offline-cache"],
  },
  platform: {
    "Explorer & shell": [
      "resource-explorer",
      "list-filters-and-views",
      "resource-page-parity",
      "notifications",
      "global-search",
      "shell-cohesion",
      "resource-consolidation",
    ],
    Resources: ["sheet-resource", "survey-resource", "resource-file-assets"],
    Editors: [
      "dashboard-data-binding",
      "email-personalization",
      "email-web-view",
      "flowchart-publish",
      "webpage-survey-invite-blocks",
    ],
  },
  virrun: {
    Core: ["architecture", "orchestrator-api", "execution-backends", "configuration"],
    Performance: ["cache", "task-cache", "snapshot-and-fork", "write-back", "wsl-source-mirror"],
    Guarantees: ["correctness", "benchmarking"],
    Background: ["adoption", "prior-art"],
  },
};
