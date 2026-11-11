// The database a Postgres address names. The driver lets a `database` query parameter override the path, so it wins here
// Too, or an address could pass the seed's gate on its path and write to another database
export const getDatabaseName = (databaseUrl: string): string => {
  const { pathname, searchParams } = new URL(databaseUrl);
  return searchParams.get("database") ?? pathname.slice(1);
};
