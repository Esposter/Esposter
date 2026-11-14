// The ids of the parent rows the typed tables reference, read from D1 once before a copy. A row whose parent is not here is
// Not copied, or its reference is left empty where the schema says the reference clears
export interface TableParents {
  apiKeyIds: Set<string>;
  appUserIds: Set<string>;
  resourceIds: Set<string>;
  roomIds: Set<string>;
  userIds: Set<string>;
}
