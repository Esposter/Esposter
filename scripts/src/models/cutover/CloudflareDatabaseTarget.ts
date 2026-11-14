// Where a D1 database is reached through the HTTP API: the account, the database's id and an API token. The token is read from
// the environment and never stored
export interface CloudflareDatabaseTarget {
  accountId: string;
  databaseId: string;
  token: string;
}
