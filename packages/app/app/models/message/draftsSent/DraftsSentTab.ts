export enum DraftsSentTab {
  Drafts = "drafts",
  Scheduled = "scheduled",
  Sent = "sent",
}

export const DraftsSentTabs: ReadonlySet<DraftsSentTab> = new Set(Object.values(DraftsSentTab));
