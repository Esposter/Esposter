export enum DraftsAndSentTab {
  Drafts = "drafts",
  Scheduled = "scheduled",
  Sent = "sent",
}

export const DraftsAndSentTabs: ReadonlySet<DraftsAndSentTab> = new Set(Object.values(DraftsAndSentTab));
