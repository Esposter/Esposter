import { setupPluginSuite } from "#src/services/oxlint/setupPluginSuite.test";
import { describe } from "vitest";

describe("naming", () => {
  const RULE = "naming/no-call-named-binding";
  const FIXTURES = [
    { name: "namesBindingAfterMemberCall", source: `export const readA = b.readA();`, violations: 1 },
    { name: "namesBindingAfterAwaitedMemberCall", source: `export const readA = await b.readA();`, violations: 1 },
    // An optional call is a `ChainExpression` around the call, so the initialiser has one more node to unwrap.
    { name: "namesBindingAfterOptionalMemberCall", source: `export const readA = b?.readA();`, violations: 1 },
    {
      name: "namesBindingAfterAwaitedOptionalMemberCall",
      source: `export const readA = await b?.readA();`,
      violations: 1,
    },
    { name: "namesBindingAfterBareCall", source: `export const getA = getA();`, violations: 1 },
    // A call named for what it returns has no verb to drop: `file.text()`, `scene.add.sprite(…)`, `Date.now()`.
    { name: "namesBindingAfterNounCall", source: `export const text = await file.text();`, violations: 0 },
    // The value's own name is the fix, so the same call under it is what the rule asks for.
    { name: "namesBindingAfterValue", source: `export const a = b.readA();`, violations: 0 },
    { name: "namesBindingAfterAwaitedValue", source: `export const a = await readA();`, violations: 0 },
    // Only a call can carry the verb: a member read or a bare identifier is another rule's.
    { name: "readsMember", source: `export const readA = b.readA;`, violations: 0 },
    // A destructuring pattern names its fields, not the call.
    { name: "destructuresCall", source: `export const { readA } = b.readA();`, violations: 0 },
  ];
  setupPluginSuite({ fixtures: FIXTURES, plugin: "naming", rules: [RULE] });
});
