// The ids of the parent rows the typed tables reference, read from D1 once before a copy. A row whose parent is not here is
// not copied
export interface TableParents {
  appUserIds: Set<string>;
  roomIds: Set<string>;
  userIds: Set<string>;
}
