export interface PgDumpConnection {
  args: string[];
  environment: Record<string, string>;
}

// The dump's connection, with the password passed through the environment.
// A command line is visible to every process on the machine, and the password is the one value here no log may hold
export const getPgDumpConnection = (databaseUrl: string): PgDumpConnection => {
  const url = new URL(databaseUrl);
  const environment: Record<string, string> = {};
  if (url.password) environment.PGPASSWORD = decodeURIComponent(url.password);
  const sslMode = url.searchParams.get("sslmode");
  if (sslMode) environment.PGSSLMODE = sslMode;
  return {
    args: [
      "--format=custom",
      "--no-owner",
      "--no-privileges",
      "--host",
      url.hostname,
      "--port",
      url.port || "5432",
      "--username",
      decodeURIComponent(url.username),
      "--dbname",
      decodeURIComponent(url.pathname.slice(1)),
    ],
    environment,
  };
};
