// The columns a resource list's sort can bind: the sort's own keys, the id that breaks every tie, and the two a search
// Ranks by
export const ResourceListColumnKey = {
  CreatedAt: "createdAt",
  DeletedAt: "deletedAt",
  Id: "id",
  LastAccessedAt: "lastAccessedAt",
  Name: "name",
  NameMatch: "nameMatch",
  NegRank: "negRank",
  Type: "type",
  UpdatedAt: "updatedAt",
} as const;
export type ResourceListColumnKey = (typeof ResourceListColumnKey)[keyof typeof ResourceListColumnKey];
