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
      "singleton-dialogs",
      "navigation",
    ],
    Backend: ["auth", "azure-services", "file-uploads"],
    Development: ["environment", "monorepo-tooling", "server-testing"],
  },
  esbabbler: {
    Messaging: [
      "messaging",
      "message-list-rendering",
      "room-ui",
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
    Calls: ["voice-video", "calls"],
    Infrastructure: ["push-notifications", "offline-cache"],
  },
  platform: {
    "Explorer & shell": [
      "resource-explorer",
      "list-filters-and-views",
      "resource-page-parity",
      "notifications",
      "shell-cohesion",
      "resource-consolidation",
    ],
    Resources: ["file-resource", "survey-resource"],
    Editors: ["dashboard-data-binding", "email-personalization"],
  },
  virrun: {
    Core: ["architecture", "orchestrator-api", "execution-backends", "configuration"],
    Performance: ["cache", "task-cache", "snapshot-and-fork", "write-back", "wsl-source-mirror"],
    Guarantees: ["correctness", "benchmarking"],
    Background: ["adoption", "prior-art"],
  },
};
