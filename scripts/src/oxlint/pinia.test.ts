import { setupPluginSuite } from "#src/services/oxlint/shared/setupPluginSuite.test";
import { describe } from "vitest";

describe("pinia/never-export-initialized-store", () => {
  const RULE = "pinia/never-export-initialized-store";
  const FIXTURES = [
    {
      name: "exportsStoreDefinition",
      source: `export const useAStore = defineStore("exportsStoreDefinition", () => {});`,
      violations: 0,
    },
    {
      name: "exportsNamedInstance",
      source: `const useBStore = defineStore("exportsNamedInstance", () => {});\nexport const bStore = useBStore();`,
      violations: 1,
    },
    {
      name: "exportsDefaultInstance",
      source: `const useCStore = defineStore("exportsDefaultInstance", () => {});\nexport default useCStore();`,
      violations: 1,
    },
    // The store is defined in another file, so this file's verdict cannot depend on which file the linter read first
    {
      name: "exportsStoreDefinedElsewhere",
      source: `import { useDStore } from "./definesStoreElsewhere";\nexport const dStore = useDStore();`,
      violations: 0,
    },
    {
      name: "definesStoreElsewhere",
      source: `export const useDStore = defineStore("definesStoreElsewhere", () => {});`,
      violations: 0,
    },
    // An export default has no declarator to bind the store to, so the rule must not read a declarator's id
    {
      name: "exportsDefaultStoreDefinition",
      source: `export default defineStore("exportsDefaultStoreDefinition", () => {});`,
      violations: 0,
    },
  ];
  setupPluginSuite({ fixtures: FIXTURES, plugin: "pinia", rules: [RULE] });
});

describe("pinia/no-duplicate-store-ids", () => {
  const RULE = "pinia/no-duplicate-store-ids";
  const FIXTURES = [
    {
      name: "distinctStoreIds",
      source: `export const useEStore = defineStore("distinctStoreIdsE", () => {});\nexport const useFStore = defineStore("distinctStoreIdsF", () => {});`,
      violations: 0,
    },
    {
      name: "repeatsStoreIdInFile",
      source: `export const useGStore = defineStore("repeatsStoreIdInFile", () => {});\nexport const useHStore = defineStore("repeatsStoreIdInFile", () => {});`,
      violations: 1,
    },
  ];
  setupPluginSuite({ fixtures: FIXTURES, plugin: "pinia", rules: [RULE] });
});

describe("pinia/no-return-global-properties", () => {
  const RULE = "pinia/no-return-global-properties";
  const FIXTURES = [
    {
      name: "returnsOwnState",
      source: `export const useIStore = defineStore("returnsOwnState", () => {\n  const count = ref(0);\n  return { count };\n});`,
      violations: 0,
    },
    {
      name: "returnsRoute",
      source: `export const useJStore = defineStore("returnsRoute", () => {\n  const route = useRoute();\n  return { route };\n});`,
      violations: 1,
    },
    {
      name: "returnsInjection",
      source: `export const useKStore = defineStore("returnsInjection", () => {\n  const app = inject("app");\n  return { app };\n});`,
      violations: 1,
    },
    // A destructured `inject` binds no name, so it adds none to the globals, and a literal property is never matched
    {
      name: "destructuredInjectDoesNotReportLiteral",
      source: `export const useLStore = defineStore("destructuredInjectDoesNotReportLiteral", () => {\n  const { a } = inject("a");\n  return { a, count: 0 };\n});`,
      violations: 0,
    },
    // A parameter of a sibling function is not the global bound in another function, so its return reports nothing
    {
      name: "siblingParameterDoesNotReport",
      source: `export const useMStore2 = () => {\n  const route = useRoute();\n  return route.params;\n};\nexport function other(route) {\n  return { route };\n}`,
      violations: 0,
    },
    // A function nested in the binding's function still returns the global, so the nested return reports
    {
      name: "nestedFunctionReturnsRoute",
      source: `export const useNStore2 = () => {\n  const route = useRoute();\n  return () => {\n    return { route };\n  };\n};`,
      violations: 1,
    },
    // A local declared in a nested function shadows the global of the enclosing function, so its return reports nothing
    {
      name: "nestedLocalShadowsRoute",
      source: `export const useOStore2 = defineStore("nestedLocalShadowsRoute", () => {\n  const route = useRoute();\n  const build = () => {\n    const route = makeLocal();\n    return { route };\n  };\n  return { build, route };\n});`,
      violations: 1,
    },
    // A parameter of a nested function shadows the enclosing global the same way
    {
      name: "nestedParameterShadowsRoute",
      source: `export const useQStore2 = defineStore("nestedParameterShadowsRoute", () => {\n  const route = useRoute();\n  const build = (route) => {\n    return { route };\n  };\n  return { build, route };\n});`,
      violations: 1,
    },
    // A destructured local shadows the enclosing global the same way, so its nested return reports nothing
    {
      name: "nestedDestructuredLocalShadowsRoute",
      source: `export const useRStore2 = defineStore("nestedDestructuredLocalShadowsRoute", () => {\n  const route = useRoute();\n  const build = () => {\n    const { route } = makeLocal();\n    return { route };\n  };\n  return { build, route: route.params };\n});`,
      violations: 0,
    },
    // A destructured, defaulted or spread parameter shadows the enclosing global, so its nested return reports nothing
    {
      name: "nestedDestructuredParameterShadowsRoute",
      source: `export const useSStore2 = defineStore("nestedDestructuredParameterShadowsRoute", () => {\n  const route = useRoute();\n  const build = ({ route }) => {\n    return { route };\n  };\n  return { build, route: route.params };\n});`,
      violations: 0,
    },
    {
      name: "nestedDefaultParameterShadowsRoute",
      source: `export const useTStore2 = defineStore("nestedDefaultParameterShadowsRoute", () => {\n  const route = useRoute();\n  const build = (route = {}) => {\n    return { route };\n  };\n  return { build, route: route.params };\n});`,
      violations: 0,
    },
    {
      name: "nestedRestParameterShadowsRoute",
      source: `export const useUStore2 = defineStore("nestedRestParameterShadowsRoute", () => {\n  const route = useRoute();\n  const build = (...route) => {\n    return { route };\n  };\n  return { build, route: route.params };\n});`,
      violations: 0,
    },
    // A destructured local in a nested block shadows the global only inside that block, so the return after it reports
    {
      name: "blockDestructuredLocalDoesNotShadowRoute",
      source: `export const useVStore2 = defineStore("blockDestructuredLocalDoesNotShadowRoute", () => {\n  const route = useRoute();\n  if (cond) {\n    const { route } = makeLocal();\n    keep(route);\n  }\n  return { route };\n});`,
      violations: 1,
    },
    // A `var` is function-scoped wherever it is declared, so a global var in a nested block still reaches the return
    {
      name: "blockVarRouteStillReports",
      source: `export const useWStore2 = defineStore("blockVarRouteStillReports", () => {\n  if (cond) {\n    var route = useRoute();\n  }\n  return { route };\n});`,
      violations: 1,
    },
  ];
  setupPluginSuite({ fixtures: FIXTURES, plugin: "pinia", rules: [RULE] });
});

describe("pinia/no-store-to-refs-in-store", () => {
  const RULE = "pinia/no-store-to-refs-in-store";
  const FIXTURES = [
    { name: "storeToRefsOutsideStore", source: `export const { a } = storeToRefs(useMStore());`, violations: 0 },
    {
      name: "storeWithoutStoreToRefs",
      source: `export const useNStore = defineStore("storeWithoutStoreToRefs", () => {\n  const a = ref(0);\n  return { a };\n});`,
      violations: 0,
    },
    {
      name: "storeToRefsInStore",
      source: `export const useOStore = defineStore("storeToRefsInStore", () => {\n  const { a } = storeToRefs(useMStore());\n  return { a };\n});`,
      violations: 1,
    },
  ];
  setupPluginSuite({ fixtures: FIXTURES, plugin: "pinia", rules: [RULE] });
});

describe("pinia/prefer-use-store-naming-convention", () => {
  const RULE = "pinia/prefer-use-store-naming-convention";
  const FIXTURES = [
    // The store of upstream issue #10, which has no return value: correctly named, and the rule does not throw
    {
      name: "definesStoreWithoutReturnValue",
      source: `export const useQStore = defineStore("definesStoreWithoutReturnValue", () => {});`,
      violations: 0,
    },
    {
      name: "bindsUnprefixedStore",
      source: `export const qStore = defineStore("bindsUnprefixedStore", () => {});`,
      violations: 1,
    },
    // A name that only starts with the letters `use` is not `use` followed by a store name
    {
      name: "bindsUseWordStore",
      source: `export const user = defineStore("bindsUseWordStore", () => {});`,
      violations: 1,
    },
    // An export default has no declarator to name, so the rule must not read a declarator's id
    {
      name: "exportsDefaultStoreDefinition",
      source: `export default defineStore("exportsDefaultStoreDefinition", () => {});`,
      violations: 0,
    },
  ];
  setupPluginSuite({ fixtures: FIXTURES, plugin: "pinia", rules: [RULE] });
});
