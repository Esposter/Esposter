// The resource operations that raise a notification. Distinct from ResourceActivityType, which is the audit
// Trail of everything that happened to a resource — this is the subset a person is told about, and it carries
// The two the trail has no row for (a soft delete and a purge).
export enum ResourceOperationType {
  Deleted = "Deleted",
  Duplicated = "Duplicated",
  Published = "Published",
  Purged = "Purged",
  Restored = "Restored",
  Unpublished = "Unpublished",
}
