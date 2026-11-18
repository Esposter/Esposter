import { checkIsRecord } from "#src/util/object/checkIsRecord";

// A drizzle builder keeps its parts in `config`, which its declaration does not type, so it is read as a record
export const getStatementConfig = (statement: unknown): Record<string, unknown> | undefined =>
  typeof statement === "object" && statement !== null && "config" in statement && checkIsRecord(statement.config)
    ? statement.config
    : undefined;
