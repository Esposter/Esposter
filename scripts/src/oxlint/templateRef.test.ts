import { setupPluginSuite } from "#src/services/oxlint/setupPluginSuite.test";
import { describe } from "vitest";

describe("templateRef", () => {
  const RULE = "template-ref/require-ref-name";
  const FIXTURES = [
    { name: "matchesKey", source: `export const a = useTemplateRef("a");`, violations: 0 },
    { name: "matchesKeyWithGeneric", source: `export const a = useTemplateRef<A>("a");`, violations: 0 },
    { name: "differsFromKey", source: `export const a = useTemplateRef("b");`, violations: 1 },
    { name: "suffixesRef", source: `export const aRef = useTemplateRef("a");`, violations: 1 },
    // The template may spell the suffix too, and the binding still restates what the call says
    { name: "matchesSuffixedKey", source: `export const aRef = useTemplateRef("aRef");`, violations: 1 },
    // A key computed at runtime names no attribute the file spells
    { name: "computesKey", source: `export const a = useTemplateRef(b);`, violations: 0 },
    // Another function taking a string is not Vue's
    { name: "callsOtherFunction", source: `export const a = useOther("b");`, violations: 0 },
  ];
  setupPluginSuite({ fixtures: FIXTURES, plugin: "templateRef", rules: [RULE] });
});
