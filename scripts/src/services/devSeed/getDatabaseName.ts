// The database a Postgres address names, which is the path without its leading slash
export const getDatabaseName = (databaseUrl: string): string => new URL(databaseUrl).pathname.slice(1);
