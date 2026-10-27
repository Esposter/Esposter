import { setupPluginSuite } from "#src/services/oxlint/shared/setupPluginSuite.test";
import { describe } from "vitest";

describe("piniaStore", () => {
  const PREFIX = "use";
  const SUFFIX = "Store";
  const RULE = "pinia-store/require-store-binding";
  const FIXTURES = [
    { name: "bindsFullName", source: `export const aB${SUFFIX} = ${PREFIX}AB${SUFFIX}();`, violations: 0 },
    { name: "bindsQualifiedName", source: `export const bAB${SUFFIX} = ${PREFIX}AB${SUFFIX}();`, violations: 0 },
    { name: "bindsWithArgument", source: `export const a${SUFFIX} = ${PREFIX}A${SUFFIX}(a);`, violations: 0 },
    { name: "assignsFullName", source: `export let a${SUFFIX}; a${SUFFIX} = ${PREFIX}A${SUFFIX}();`, violations: 0 },
    { name: "bindsBareStore", source: `export const a = ${PREFIX}AB${SUFFIX}();`, violations: 1 },
    { name: "bindsPartialName", source: `export const b${SUFFIX} = ${PREFIX}AB${SUFFIX}();`, violations: 1 },
    {
      name: "assignsPartialName",
      source: `export let b${SUFFIX}; b${SUFFIX} = ${PREFIX}AB${SUFFIX}();`,
      violations: 1,
    },
    { name: "destructuresCall", source: `export const { a } = ${PREFIX}A${SUFFIX}();`, violations: 1 },
    { name: "storeToRefsCall", source: `export const { a } = storeToRefs(${PREFIX}A${SUFFIX}());`, violations: 1 },
    { name: "callsMemberOffCall", source: `export const a = ${PREFIX}A${SUFFIX}().a();`, violations: 1 },
    { name: "spiesOnCall", source: `vi.spyOn(${PREFIX}A${SUFFIX}(), "a");`, violations: 1 },
    // A runtime choice between two stores is bound once chosen, under whichever name the caller asked for.
    {
      name: "bindsChoice",
      source: `export const a${SUFFIX} = a ? ${PREFIX}B${SUFFIX}() : ${PREFIX}C${SUFFIX}();`,
      violations: 0,
    },
    {
      name: "destructuresChoice",
      source: `export const { b } = a ? ${PREFIX}B${SUFFIX}() : ${PREFIX}C${SUFFIX}();`,
      violations: 2,
    },
    // A bare call is for its side effect, and a returned store is named by whoever calls the function.
    { name: "callsForEffect", source: `${PREFIX}A${SUFFIX}();`, violations: 0 },
    {
      name: "returnsFromArrow",
      source: `export const ${PREFIX}A = (a) => (a ? ${PREFIX}B${SUFFIX}() : ${PREFIX}C${SUFFIX}());`,
      violations: 0,
    },
    { name: "returnsFromBlock", source: `export const f = () => { return ${PREFIX}A${SUFFIX}(); };`, violations: 0 },
    // Only Pinia's `use<Name>Store` naming is a store lookup: a composable of another shape is another rule's.
    { name: "callsComposable", source: `export const { a } = ${PREFIX}A();`, violations: 0 },
    { name: "callsLowercaseStore", source: `export const { a } = ${PREFIX}store();`, violations: 0 },
  ];
  setupPluginSuite({ fixtures: FIXTURES, plugin: "piniaStore", rules: [RULE] });
});
