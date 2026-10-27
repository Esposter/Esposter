import { setupPluginSuite } from "#src/services/oxlint/shared/setupPluginSuite.test";
import { describe } from "vitest";

describe("templateRef", () => {
  const CALLEE = "useTemplateRef";
  const SUFFIX = "Ref";
  const RULE = "template-ref/require-ref-name";
  const FIXTURES = [
    { name: "matchesKey", source: `export const a = ${CALLEE}("a");`, violations: 0 },
    { name: "matchesKeyWithGeneric", source: `export const a = ${CALLEE}<A>("a");`, violations: 0 },
    { name: "differsFromKey", source: `export const a = ${CALLEE}("b");`, violations: 1 },
    { name: "suffixesRef", source: `export const a${SUFFIX} = ${CALLEE}("a");`, violations: 1 },
    // The template may spell the suffix too, and the binding still restates what the call says
    { name: "matchesSuffixedKey", source: `export const a${SUFFIX} = ${CALLEE}("a${SUFFIX}");`, violations: 1 },
    // A key computed at runtime names no attribute the file spells
    { name: "computesKey", source: `export const a = ${CALLEE}(b);`, violations: 0 },
    // Another function taking a string is not Vue's
    { name: "callsOtherFunction", source: `export const a = f("b");`, violations: 0 },
  ];
  setupPluginSuite({ fixtures: FIXTURES, plugin: "templateRef", rules: [RULE] });
});
