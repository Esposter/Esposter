import { setupPluginSuite } from "#scripts/oxlint/setupPluginSuite.test";
import { describe, expect, test } from "vitest";

const RULE = "pass-through-helper/no-forwarding-wrapper";

describe(RULE, () => {
  const FIXTURES = [
    { name: "forwardsEveryParameter", source: `export const a = (b: string) => f(b);`, violations: 1 },
    { name: "forwardsNothing", source: `export const a = () => f();`, violations: 1 },
    { name: "forwardsAwaited", source: `export const a = async (b: string) => await f(b);`, violations: 1 },
    // The construction shape of the same thing: `new X(a, b)` renames the constructor and nothing else.
    { name: "forwardsToConstructor", source: `export const a = (b: string, c: string) => new X(b, c);`, violations: 1 },
    // A receiver taken from the caller is forwarded too, so a rest arg over it is still a pure forward.
    {
      name: "forwardsToParameterReceiver",
      source: `export const a = (b: Client, ...c: string[]) => b.d(...c);`,
      violations: 1,
    },
    // A default export is the same surface reached without a name, so it forwards on the same terms.
    { name: "forwardsFromDefaultExport", source: `export default (b: string) => f(b);`, violations: 1 },
    // Everything below absorbs something the caller no longer states.
    // A read of what the forward would have returned is the same rename one step out: the `useGlobalTheme` shape.
    { name: "readsForwardedCallResult", source: `export const a = () => f().b;`, violations: 1 },
    { name: "readsParameterProperty", source: `export const a = (b: X) => b.c;`, violations: 1 },
    // A computed read is a lookup the caller did not spell, and an argument the caller never passed is absorbed.
    { name: "readsComputedProperty", source: `export const a = (b: X, c: string) => b[c];`, violations: 0 },
    { name: "readsResultOfSuppliedArgument", source: `export const a = () => f(LIMIT).b;`, violations: 0 },
    { name: "suppliesConstantArgument", source: `export const a = (b: string) => f(b, LIMIT);`, violations: 0 },
    { name: "suppliesLiteralArgument", source: `export const a = (b: string) => f(b, "");`, violations: 0 },
    { name: "suppliesCallback", source: `export const a = (b: string[]) => f(b, (c) => c);`, violations: 0 },
    { name: "reordersArguments", source: `export const a = (b: string, c: string) => f(c, b);`, violations: 0 },
    { name: "dropsArgument", source: `export const a = (b: string, _c: string) => f(b);`, violations: 0 },
    { name: "suppliesDefault", source: `export const a = (b: string, c = "") => f(b, c);`, violations: 0 },
    // The receiver is the constant the wrapper exists to hold — the `UUIDV4_REGEX.test(uuid)` shape.
    {
      name: "suppliesConstantReceiver",
      source: `export const a = (b: string) => UUIDV4_REGEX.test(b);`,
      violations: 0,
    },
    // A destructured parameter is a shape the caller did not have to know.
    { name: "destructuresParameter", source: `export const a = ({ b }: { b: string }) => f(b);`, violations: 0 },
    // Not a call at all: a member read, a literal, or a body doing real work.
    { name: "readsMember", source: `export const a = () => b.c;`, violations: 0 },
    { name: "buildsObject", source: `export const a = (b: string) => ({ b });`, violations: 0 },
    { name: "chainsCall", source: `export const a = (b: string) => f(b).c();`, violations: 0 },
    // An identity function pins inference; it forwards nothing because it calls nothing.
    { name: "identityFunction", source: `export const a = (b: string) => b;`, violations: 0 },
    // A local helper is not the package's surface, so it is nobody's call site to get wrong.
    {
      name: "unexportedWrapper",
      source: `const a = (b: string) => f(b);\nexport const c = () => a("");`,
      violations: 0,
    },
  ];
  const { getCodes, getViolations } = setupPluginSuite({
    fixtures: FIXTURES,
    plugin: "passThroughHelper",
    rules: [RULE],
  });

  test.each(FIXTURES)("reports $violations violation(s) for $name", ({ name, violations }) => {
    expect.hasAssertions();

    expect(getViolations(name)).toBe(violations);
  });

  test("reports nothing but this rule", () => {
    expect.hasAssertions();

    expect([...new Set(getCodes())]).toStrictEqual(["pass-through-helper(no-forwarding-wrapper)"]);
  });
});
