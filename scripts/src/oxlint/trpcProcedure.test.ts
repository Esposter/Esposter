import { setupPluginSuite } from "#src/services/oxlint/shared/setupPluginSuite.test";
import { describe } from "vitest";

describe("trpcProcedure", () => {
  const BAD_REQUEST = "BAD_REQUEST";
  const CODE_KEY = "code";
  const ERROR_CLASS = "TRPCError";
  const INVALID_OPERATION_ERROR = "InvalidOperationError";
  const NOT_FOUND_ERROR = "NotFoundError";
  const FORBIDDEN_ERROR = "ForbiddenError";
  const MESSAGE_KEY = "message";
  const MUTATE = "mutate";
  const MUTATION = "mutation";
  const NOT_FOUND = "NOT_FOUND";
  const UNAUTHORIZED = "UNAUTHORIZED";
  const QUERY = "query";
  const ROUTER = "router";
  const CALL = "call";
  const THEN = "then";
  const VERB_CREATE = "create";
  const VERB_GET = "get";
  const VERB_GENERATE = "generate";
  const VERB_READ = "read";
  const VERB_SEARCH = "search";
  const EMPTY_INPUT_RULE = "trpc-procedure/no-empty-input";
  const ERROR_RULE = "trpc-procedure/no-hand-rolled-error";
  const PROTOTYPE_KEY_RULE = "trpc-procedure/no-prototype-key";
  const QUERY_VERB_RULE = "trpc-procedure/require-query-verb";
  const RETURN_TYPE_RULE = "trpc-procedure/require-return-type";
  const FIXTURES = [
    // `require-return-type` — the generic pins a public API surface, so its absence is the finding.
    { name: "bareQuery", source: `export const a = p.${QUERY}(() => 1);`, violations: 1 },
    { name: "bareMutation", source: `export const a = p.${MUTATION}(async () => {});`, violations: 1 },
    { name: "genericQuery", source: `export const a = p.${QUERY}<number>(() => 1);`, violations: 0 },
    { name: "genericMutation", source: `export const a = p.${MUTATION}<void>(async () => {});`, violations: 0 },
    // A void-returning procedure still writes its generic rather than being exempt for having nothing to say.
    { name: "voidGeneric", source: `export const a = p.input(s).${MUTATION}<void>(async () => {});`, violations: 0 },
    // `.subscription` is deliberately out of scope: an async generator carries its yield type as a callback
    // Annotation, which is the one place the method-generic rule does not reach.
    { name: "bareSubscription", source: `export const a = p.subscription(async function* () {});`, violations: 0 },
    // A procedure is the call written with a handler; the same method name handed anything else is another API,
    // Whatever the receiver is called.
    { name: "sqlQueryCall", source: `export const a = b.${QUERY}("a");`, violations: 0 },
    { name: "clientQueryCall", source: `export const a = b.a.${VERB_READ}A.${QUERY}(i);`, violations: 0 },
    { name: "bareClientQueryCall", source: `export const a = b.a.${VERB_READ}A.${QUERY}();`, violations: 0 },
    {
      name: "functionExpressionHandler",
      source: `export const a = p.${MUTATION}(async function () {});`,
      violations: 1,
    },
    { name: "drizzleQueryProperty", source: `export const a = b.c.${QUERY}.a.findFirst({});`, violations: 0 },
    // A bare identifier call is not a builder chain at all.
    { name: "bareIdentifierCall", source: `export const a = ${QUERY}(() => 1);`, violations: 0 },
    // `no-hand-rolled-error` — a constructor already pairs each code with its message.
    {
      name: "handRollsInvalidOperation",
      source: `export const a = () => { throw new ${ERROR_CLASS}({ ${CODE_KEY}: "${BAD_REQUEST}", ${MESSAGE_KEY}: new ${INVALID_OPERATION_ERROR}(o, n, c).${MESSAGE_KEY} }); };`,
      violations: 1,
    },
    {
      name: "handRollsNotFound",
      source: `export const a = () => { throw new ${ERROR_CLASS}({ ${CODE_KEY}: "a", ${MESSAGE_KEY}: new ${NOT_FOUND_ERROR}(n, i).${MESSAGE_KEY} }); };`,
      violations: 1,
    },
    {
      name: "handRollsForbidden",
      source: `export const a = () => { throw new ${ERROR_CLASS}({ ${CODE_KEY}: "a", ${MESSAGE_KEY}: new ${FORBIDDEN_ERROR}(r).${MESSAGE_KEY} }); };`,
      violations: 1,
    },
    // A BAD_REQUEST with no message reaches the client as an empty rejection.
    {
      name: "bareBadRequest",
      source: `export const a = () => { throw new ${ERROR_CLASS}({ ${CODE_KEY}: "${BAD_REQUEST}" }); };`,
      violations: 1,
    },
    // Every other bare code is left alone — only BAD_REQUEST carries the always-a-message rule, and the
    // Authorization guards throw a bare UNAUTHORIZED deliberately (architecture: errorLink handles it).
    {
      name: "bareUnauthorized",
      source: `export const a = () => { throw new ${ERROR_CLASS}({ ${CODE_KEY}: "${UNAUTHORIZED}" }); };`,
      violations: 0,
    },
    {
      name: "bareNotFound",
      source: `export const a = () => { throw new ${ERROR_CLASS}({ ${CODE_KEY}: "${NOT_FOUND}" }); };`,
      violations: 0,
    },
    // A plain-string message satisfies the rule; not every rejection has an error class behind it.
    {
      name: "plainMessage",
      source: `export const a = () => { throw new ${ERROR_CLASS}({ ${CODE_KEY}: "${BAD_REQUEST}", ${MESSAGE_KEY}: "a" }); };`,
      violations: 0,
    },
    // A spread could carry `message`, and no syntactic rule can see into it, so the object is left alone.
    {
      name: "spreadMaySupplyMessage",
      source: `export const a = () => { throw new ${ERROR_CLASS}({ ${CODE_KEY}: "${BAD_REQUEST}", ...a }); };`,
      violations: 0,
    },
    // A message written after the spread overrides it, so the object is decidable and the rule still judges it.
    {
      name: "messageAfterSpread",
      source: `export const a = () => { throw new ${ERROR_CLASS}({ ...a, ${CODE_KEY}: "${BAD_REQUEST}", ${MESSAGE_KEY}: "a" }); };`,
      violations: 0,
    },
    // Hand-rolling is decidable wherever it sits — a spread before it changes nothing about what it says.
    {
      name: "handRollsAfterSpread",
      source: `export const a = () => { throw new ${ERROR_CLASS}({ ...a, ${CODE_KEY}: "a", ${MESSAGE_KEY}: new ${NOT_FOUND_ERROR}(n, i).${MESSAGE_KEY} }); };`,
      violations: 1,
    },
    // A spread after the hand-rolled message may override what the object ends up carrying, and the rule still
    // Reports it: constructing an error to steal its message is the finding, whatever the object resolves to.
    {
      name: "handRollsBeforeSpread",
      source: `export const a = () => { throw new ${ERROR_CLASS}({ ${CODE_KEY}: "a", ${MESSAGE_KEY}: new ${NOT_FOUND_ERROR}(n, i).${MESSAGE_KEY}, ...a }); };`,
      violations: 1,
    },
    // An error class the repo has no guard constructor for is not reported — there is nothing to point at.
    {
      name: "unmappedErrorClass",
      source: `export const a = () => { throw new ${ERROR_CLASS}({ ${CODE_KEY}: "${BAD_REQUEST}", ${MESSAGE_KEY}: new X(x).${MESSAGE_KEY} }); };`,
      violations: 0,
    },
    // `require-query-verb` — a query names its verb, since `get*` is derivation and a bare noun names nothing.
    { name: "readQuery", source: `export const a = { ${VERB_READ}A: p.${QUERY}<number>(() => 1) };`, violations: 0 },
    {
      name: "searchQuery",
      source: `export const a = { ${VERB_SEARCH}A: p.${QUERY}<number>(() => 1) };`,
      violations: 0,
    },
    {
      name: "generateQuery",
      source: `export const a = { ${VERB_GENERATE}A: p.${QUERY}<number>(() => 1) };`,
      violations: 0,
    },
    { name: "getQuery", source: `export const a = { ${VERB_GET}A: p.${QUERY}<number>(() => 1) };`, violations: 1 },
    { name: "nounQuery", source: `export const a = { a: p.${QUERY}<number>(() => 1) };`, violations: 1 },
    // A mutation is named for its action, and only a query is a read
    {
      name: "verbMutation",
      source: `export const a = { ${VERB_CREATE}A: p.${MUTATION}<void>(() => {}) };`,
      violations: 0,
    },
    // `no-prototype-key` — a client proxy resolves these off `Function.prototype` instead of the router.
    { name: "prototypeKey", source: `export const a = ${ROUTER}({ ${CALL}: b });`, violations: 1 },
    { name: "thenableKey", source: `export const a = ${ROUTER}({ ${THEN}: b });`, violations: 1 },
    { name: "compoundKey", source: `export const a = ${ROUTER}({ ${CALL}Session: b });`, violations: 0 },
    // Only a router's own keys go through the proxy
    { name: "prototypeKeyOutsideRouter", source: `export const a = b({ ${CALL}: c });`, violations: 0 },
    // `no-empty-input` — an all-optional input chains `.prefault({})`, so the argument is never needed.
    // Every fixture runs every rule, so a query here carries the generic the server-scoped rule asks of a builder
    { name: "emptyQueryInput", source: `export const a = b.c.${QUERY}<A>({});`, violations: 1 },
    { name: "emptyMutateInput", source: `export const a = b.c.${MUTATE}({});`, violations: 1 },
    { name: "omittedInput", source: `export const a = b.c.${MUTATE}();`, violations: 0 },
    { name: "filledInput", source: `export const a = b.c.${MUTATE}({ d });`, violations: 0 },
  ];
  setupPluginSuite({
    fixtures: FIXTURES,
    plugin: "trpcProcedure",
    rules: [EMPTY_INPUT_RULE, ERROR_RULE, PROTOTYPE_KEY_RULE, QUERY_VERB_RULE, RETURN_TYPE_RULE],
  });
});
