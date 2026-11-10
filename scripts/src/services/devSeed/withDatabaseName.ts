// The same server address with its database replaced, so a connection can reach the server's default database
export const withDatabaseName = (databaseUrl: string, databaseName: string): string => {
  const url = new URL(databaseUrl);
  url.pathname = `/${databaseName}`;
  return url.toString();
};
