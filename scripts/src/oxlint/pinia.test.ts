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
