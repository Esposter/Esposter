// The SQL dialect a keyset page is written for: Postgres takes numbered parameters, and D1's SQLite takes `?`
export enum SqlDialect {
  Postgres = "postgres",
  Sqlite = "sqlite",
}
