export const DerivedDatabaseEntityType = { Comment: "Comment", DirectMessage: "DirectMessage" } as const;
export type DerivedDatabaseEntityType = (typeof DerivedDatabaseEntityType)[keyof typeof DerivedDatabaseEntityType];
