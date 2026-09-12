export const MISSING_MESSAGE =
  "A BAD_REQUEST TRPCError always carries a message — a bare one reaches the client as an empty rejection. Use `getInvalidOperationError(operation, entityType, name)`, or pass a `message` naming the invalid value.";

export const MISSING_RETURN_TYPE =
  "Procedure is missing its return-type generic. Write `.query<T>(...)` / `.mutation<T>(...)` — the generic pins a public API surface, so a handler that later grows a `return` is a compile error rather than a silently widened response. A procedure returning nothing writes `<void>`.";
