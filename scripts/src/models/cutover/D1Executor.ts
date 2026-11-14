import type { D1Statement } from "#src/models/cutover/D1Statement";

// The one way the cutover writes and reads a D1 database. The HTTP executor serves the real run; a Miniflare binding serves
// the tests. A batch applies all of its statements in one transaction, which is what `PRAGMA defer_foreign_keys` needs
export interface D1Executor {
  batch(statements: D1Statement[]): Promise<void>;
  query(statement: D1Statement): Promise<Record<string, unknown>[]>;
}
