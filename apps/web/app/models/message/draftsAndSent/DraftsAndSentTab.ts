export const DraftsAndSentTab = { Drafts: "drafts", Scheduled: "scheduled", Sent: "sent" } as const;
export type DraftsAndSentTab = (typeof DraftsAndSentTab)[keyof typeof DraftsAndSentTab];

export const DraftsAndSentTabs: ReadonlySet<DraftsAndSentTab> = new Set(Object.values(DraftsAndSentTab));
