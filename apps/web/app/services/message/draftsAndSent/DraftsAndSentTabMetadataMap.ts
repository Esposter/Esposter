import type { DraftsAndSentTabMetadata } from "@/models/message/draftsAndSent/DraftsAndSentTabMetadata";

import { DraftsAndSentTab } from "@/models/message/draftsAndSent/DraftsAndSentTab";

// The icon is what the tab, the sidebar badge and the empty state each draw for the same bucket, so it is
// Spelled once here rather than at each of them.
export const DraftsAndSentTabMetadataMap: Record<DraftsAndSentTab, DraftsAndSentTabMetadata> = {
  [DraftsAndSentTab.Drafts]: { icon: "mdi-pencil", title: "Drafts" },
  [DraftsAndSentTab.Scheduled]: { icon: "mdi-clock-outline", title: "Scheduled" },
  [DraftsAndSentTab.Sent]: { icon: "mdi-send-outline", title: "Sent" },
};
