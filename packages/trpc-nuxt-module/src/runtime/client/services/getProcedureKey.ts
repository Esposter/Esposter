import { hash } from "ohash";

// The procedure's dotted path, and a stable hash of its input when it has one, so the same call made on the server and
// Again during hydration lands on the same cached entry
export const getProcedureKey = (path: string, input?: unknown): string =>
  input === undefined ? path : `${path}-${hash(input)}`;
