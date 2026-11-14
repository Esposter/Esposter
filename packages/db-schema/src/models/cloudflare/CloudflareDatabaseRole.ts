// The role a D1 database plays, the purpose token of its name: `core` holds the relational schema, `streams` the
// append-heavy tables Azure Table holds now, so neither nears D1's per-database limit and no query joins across them
export const CloudflareDatabaseRole = { Core: "core", Streams: "streams" } as const;
export type CloudflareDatabaseRole = (typeof CloudflareDatabaseRole)[keyof typeof CloudflareDatabaseRole];
