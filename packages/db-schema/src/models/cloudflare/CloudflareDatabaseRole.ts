// The role a D1 database plays, the purpose token of its name. `core` is the one database: the relational schema and the
// typed tables that once lived in Azure Table, so every query runs against one D1 database
export const CloudflareDatabaseRole = { Core: "core" } as const;
export type CloudflareDatabaseRole = (typeof CloudflareDatabaseRole)[keyof typeof CloudflareDatabaseRole];
