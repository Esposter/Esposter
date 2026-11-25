// Where one opening's content stands with the server. Each kind is a state the content can be in, so a combination that
// Cannot happen has no way to be written down (openspec/specs/architecture/content-sync/design.md)
export const ContentSyncKind = {
  // Another writer's newer content is being read to replace this one's, which holds no unsaved edit
  Adopting: "Adopting",
  // An unsaved edit meets another writer's newer content. Nothing is written until the person chooses
  Conflict: "Conflict",
  // An edit is on screen that no save has been asked for yet
  Dirty: "Dirty",
  // The last save did not land for a reason other than another writer. The edit stays on screen
  Failed: "Failed",
  // One save is in flight
  Saving: "Saving",
  // What is on screen is what the server holds
  Synced: "Synced",
  // No content has been read for this opening, so nothing it holds may be written
  Unread: "Unread",
} as const;
export type ContentSyncKind = (typeof ContentSyncKind)[keyof typeof ContentSyncKind];
