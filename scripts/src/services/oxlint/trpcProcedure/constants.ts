export const MISSING_MESSAGE =
  "A BAD_REQUEST TRPCError always carries a message — a bare one reaches the client as an empty rejection. Use `getInvalidOperationError(operation, entityType, name)`, or pass a `message` naming the invalid value.";

export const MISSING_RETURN_TYPE =
  "Procedure is missing its return-type generic. Write `.query<T>(...)` / `.mutation<T>(...)` — the generic pins a public API surface, so a handler that later grows a `return` is a compile error rather than a silently widened response. A procedure returning nothing writes `<void>`.";

// The trpc skill's three query verbs, the convention's own vocabulary
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this regex would otherwise infer
export const QUERY_VERB_REGEX: RegExp = /^(?:generate|read|search)[A-Z]/u;

export const QUERY_VERB_MESSAGE =
  "A query names its verb: `read*` for a fetch, `search*` for a ranked query, `generate*` for a minted credential — never a bare noun or a `get*`, which is derivation rather than a round trip. See the trpc skill.";
// Every key a tRPC client proxy resolves off `Function.prototype` instead of descending the router, plus the
// Thenable pair an `await` reads — the language's own vocabulary rather than a list of the repo's names
export const PROTOTYPE_KEYS: ReadonlySet<string> = new Set(["apply", "bind", "call", "catch", "then"]);

export const PROTOTYPE_KEY_MESSAGE =
  "A router key the client proxy resolves off `Function.prototype` (`call`, `apply`, `bind`, `then`, `catch`) never reaches the router — use a compound name such as `callSession`. See the trpc skill.";

export const EMPTY_INPUT_MESSAGE =
  "Call a procedure whose input is all optional with no argument — `.query()`, never `.query({})`: its schema chains `.prefault({})`, which makes the input itself optional. See the trpc skill.";
