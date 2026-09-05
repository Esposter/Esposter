import { setupPluginSuite } from "#scripts/oxlint/setupPluginSuite.test";
import { describe, expect, test } from "vitest";

const ERROR_RULE = "trpc-procedure/no-hand-rolled-error";
const RETURN_TYPE_RULE = "trpc-procedure/require-return-type";

describe("trpc-procedure", () => {
  const FIXTURES = [
    // `require-return-type` — the generic pins a public API surface, so its absence is the finding.
    { name: "bareQuery", source: `export const a = p.query(() => 1);`, violations: 1 },
    { name: "bareMutation", source: `export const a = p.mutation(async () => {});`, violations: 1 },
    { name: "genericQuery", source: `export const a = p.query<number>(() => 1);`, violations: 0 },
    { name: "genericMutation", source: `export const a = p.mutation<void>(async () => {});`, violations: 0 },
    // A void-returning procedure still writes its generic rather than being exempt for having nothing to say.
    { name: "voidGeneric", source: `export const a = p.input(s).mutation<void>(async () => {});`, violations: 0 },
    // `.subscription` is deliberately out of scope: an async generator carries its yield type as a callback
    // Annotation, which is the one place the method-generic rule does not reach.
    { name: "bareSubscription", source: `export const a = p.subscription(async function* () {});`, violations: 0 },
    // Drizzle's `ctx.db.query` is a property access, never a call — but a `db.query(...)` call is not a builder.
    { name: "drizzleQueryCall", source: `export const a = db.query("select 1");`, violations: 0 },
    { name: "drizzleQueryProperty", source: `export const a = ctx.db.query.posts.findFirst({});`, violations: 0 },
    // A bare identifier call is not a builder chain at all.
    { name: "bareIdentifierCall", source: `export const a = query(() => 1);`, violations: 0 },
    // `no-hand-rolled-error` — a constructor already pairs each code with its message.
    {
      name: "handRollsInvalidOperation",
      source: `export const a = () => { throw new TRPCError({ code: "BAD_REQUEST", message: new InvalidOperationError(o, n, c).message }); };`,
      violations: 1,
    },
    {
      name: "handRollsNotFound",
      source: `export const a = () => { throw new TRPCError({ code: "NOT_FOUND", message: new NotFoundError(n, i).message }); };`,
      violations: 1,
    },
    {
      name: "handRollsForbidden",
      source: `export const a = () => { throw new TRPCError({ code: "FORBIDDEN", message: new ForbiddenError(r).message }); };`,
      violations: 1,
    },
    // A BAD_REQUEST with no message reaches the client as an empty rejection.
    {
      name: "bareBadRequest",
      source: `export const a = () => { throw new TRPCError({ code: "BAD_REQUEST" }); };`,
      violations: 1,
    },
    // Every other bare code is left alone — only BAD_REQUEST carries the always-a-message rule, and the
    // Authorization guards throw a bare UNAUTHORIZED deliberately (architecture: errorLink handles it).
    {
      name: "bareUnauthorized",
      source: `export const a = () => { throw new TRPCError({ code: "UNAUTHORIZED" }); };`,
      violations: 0,
    },
    {
      name: "bareNotFound",
      source: `export const a = () => { throw new TRPCError({ code: "NOT_FOUND" }); };`,
      violations: 0,
    },
    // A plain-string message satisfies the rule; not every rejection has an error class behind it.
    {
      name: "plainMessage",
      source: `export const a = () => { throw new TRPCError({ code: "BAD_REQUEST", message: "stale version" }); };`,
      violations: 0,
    },
    // A spread could carry `message`, and no syntactic rule can see into it, so the object is left alone.
    {
      name: "spreadMaySupplyMessage",
      source: `export const a = () => { throw new TRPCError({ code: "BAD_REQUEST", ...rest }); };`,
      violations: 0,
    },
    // A message written after the spread overrides it, so the object is decidable and the rule still judges it.
    {
      name: "messageAfterSpread",
      source: `export const a = () => { throw new TRPCError({ ...rest, code: "BAD_REQUEST", message: "stale" }); };`,
      violations: 0,
    },
    // Hand-rolling is decidable wherever it sits — a spread before it changes nothing about what it says.
    {
      name: "handRollsAfterSpread",
      source: `export const a = () => { throw new TRPCError({ ...rest, code: "NOT_FOUND", message: new NotFoundError(n, i).message }); };`,
      violations: 1,
    },
    // A spread after the hand-rolled message may override what the object ends up carrying, and the rule still
    // Reports it: constructing an error to steal its message is the finding, whatever the object resolves to.
    {
      name: "handRollsBeforeSpread",
      source: `export const a = () => { throw new TRPCError({ code: "NOT_FOUND", message: new NotFoundError(n, i).message, ...rest }); };`,
      violations: 1,
    },
    // An error class the repo has no guard constructor for is not reported — there is nothing to point at.
    {
      name: "unmappedErrorClass",
      source: `export const a = () => { throw new TRPCError({ code: "BAD_REQUEST", message: new SomeOtherError(x).message }); };`,
      violations: 0,
    },
  ];
  const { getCodes, getViolations } = setupPluginSuite({
    fixtures: FIXTURES,
    plugin: "trpcProcedure",
    rules: [ERROR_RULE, RETURN_TYPE_RULE],
  });

  test.each(FIXTURES)("reports $violations violation(s) for $name", ({ name, violations }) => {
    expect.hasAssertions();

    expect(getViolations(name)).toBe(violations);
  });

  test("reports nothing but these two rules", () => {
    expect.hasAssertions();

    expect([...new Set(getCodes())].toSorted()).toStrictEqual([
      "trpc-procedure(no-hand-rolled-error)",
      "trpc-procedure(require-return-type)",
    ]);
  });
});
