export const DerivedDatabaseEntityType = {
  Comment: "Comment",
  DirectMessage: "DirectMessage",
  Member: "Member",
} as const;
export type DerivedDatabaseEntityType = (typeof DerivedDatabaseEntityType)[keyof typeof DerivedDatabaseEntityType];
