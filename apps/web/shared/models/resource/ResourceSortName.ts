// A resource list's order, named by its column and its direction, or by relevance for a search. Each is one declared sort
// In ResourceSortNamePageSortMap, so a name is the whole of what a reader can choose
export enum ResourceSortName {
  CreatedAtAsc = "createdAt-asc",
  CreatedAtDesc = "createdAt-desc",
  DeletedAtAsc = "deletedAt-asc",
  DeletedAtDesc = "deletedAt-desc",
  LastAccessedAtAsc = "lastAccessedAt-asc",
  LastAccessedAtDesc = "lastAccessedAt-desc",
  NameAsc = "name-asc",
  NameDesc = "name-desc",
  Relevance = "relevance",
  TypeAsc = "type-asc",
  TypeDesc = "type-desc",
  UpdatedAtAsc = "updatedAt-asc",
  UpdatedAtDesc = "updatedAt-desc",
}
