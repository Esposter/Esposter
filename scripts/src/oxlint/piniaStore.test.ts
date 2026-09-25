import { setupPluginSuite } from "#src/services/oxlint/setupPluginSuite.test";
import { describe } from "vitest";

describe("piniaStore", () => {
  const RULE = "pinia-store/require-store-binding";
  const FIXTURES = [
    { name: "bindsFullName", source: `export const fooBarStore = useFooBarStore();`, violations: 0 },
    { name: "bindsQualifiedName", source: `export const newFooBarStore = useFooBarStore();`, violations: 0 },
    { name: "bindsWithArgument", source: `export const fooStore = useFooStore(a);`, violations: 0 },
    { name: "assignsFullName", source: `export let fooStore; fooStore = useFooStore();`, violations: 0 },
    { name: "bindsBareStore", source: `export const store = useFooBarStore();`, violations: 1 },
    { name: "bindsPartialName", source: `export const barStore = useFooBarStore();`, violations: 1 },
    { name: "assignsPartialName", source: `export let barStore; barStore = useFooBarStore();`, violations: 1 },
    { name: "destructuresCall", source: `export const { a } = useFooStore();`, violations: 1 },
    { name: "storeToRefsCall", source: `export const { a } = storeToRefs(useFooStore());`, violations: 1 },
    { name: "callsMemberOffCall", source: `export const a = useFooStore().a();`, violations: 1 },
    { name: "spiesOnCall", source: `vi.spyOn(useFooStore(), "a");`, violations: 1 },
    // A runtime choice between two stores is bound once chosen, under whichever name the caller asked for.
    { name: "bindsChoice", source: `export const fooStore = a ? useBarStore() : useBazStore();`, violations: 0 },
    { name: "destructuresChoice", source: `export const { b } = a ? useBarStore() : useBazStore();`, violations: 2 },
    // A bare call is for its side effect, and a returned store is named by whoever calls the function.
    { name: "callsForEffect", source: `useFooStore();`, violations: 0 },
    {
      name: "returnsFromArrow",
      source: `export const useA = (a) => (a ? useBarStore() : useBazStore());`,
      violations: 0,
    },
    { name: "returnsFromBlock", source: `export const setup = () => { return useFooStore(); };`, violations: 0 },
    // Only Pinia's `use<Name>Store` naming is a store lookup: a composable of another shape is another rule's.
    { name: "callsComposable", source: `export const { a } = useFoo();`, violations: 0 },
    { name: "callsLowercaseStore", source: `export const { a } = usestore();`, violations: 0 },
  ];
  setupPluginSuite({ fixtures: FIXTURES, plugin: "piniaStore", rules: [RULE] });
});
