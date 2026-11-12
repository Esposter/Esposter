import type { OxlintConfig } from "oxlint";

import { AUTO_IMPORT_PACKAGE_OVERRIDES } from "#oxlint/autoImportPackageOverrides";
import {
  BROWSER_GLOBALS,
  FETCH_GLOBAL,
  RESTRICTED_GLOBALS,
  USE_ROUTE_GLOBAL,
  USE_UI_STYLE_GLOBAL,
} from "#oxlint/globals";
import {
  APP_RESTRICTED_IMPORT_PATHS,
  MOD_IMPORT_PATTERN,
  OTHER_RESTRICTED_IMPORT_PATHS,
  PACKAGE_IMPORT_PATTERNS,
  RESTRICTED_IMPORT_PATHS,
  SHARED_APP_IMPORT_PATTERN,
  VUETIFY_IMPORT_PATH,
  VUETIFY_IMPORT_PATTERN,
  WORKSPACE_LIBRARY_IMPORT_PATTERN,
} from "#oxlint/importRestrictions";
import { JS_PLUGINS } from "#oxlint/jsPlugins";
import { POLLING_MESSAGE, USE_ROUTER_PAGE_MESSAGE } from "#oxlint/messages";
import pinia from "eslint-plugin-pinia";
import { defineConfig } from "oxlint";

// The Tiled tileset `.tsx` files are XML, not code. ESLint's ignores import this glob too,
// So the two passes never ignore different trees.
export const TILESET_IGNORE_PATTERN = "**/assets/dungeons/tilesets/**/*.tsx";

// The plugin's own `all-flat` preset decides which rules are on, so a rule it adds arrives without an edit here. The
// Preset hands them over as warnings, which fail nothing, so each rule it turns on is an error and the rest stay off
const PINIA_RULES = Object.fromEntries(
  Object.entries(pinia.configs["all-flat"].rules).map(
    ([ruleName, severity]) => [ruleName, severity === "off" ? "off" : "error"] as const,
  ),
);

const oxlintConfiguration: OxlintConfig = defineConfig({
  categories: {
    correctness: "error",
    pedantic: "error",
    perf: "error",
    restriction: "error",
    style: "error",
    suspicious: "error",
  },
  ignorePatterns: ["public", TILESET_IGNORE_PATTERN, ".agents/worktrees", ".claude", "**/auto-imports.d.ts"],
  jsPlugins: JS_PLUGINS,
  options: { typeAware: true },
  overrides: [
    {
      files: ["**/*.d.ts", "**/*.d.mts", "**/*.d.cts"],
      rules: { "literal-union/no-string-literal-union": "off", "unicorn/require-module-specifiers": "off" },
    },
    // An Azure resource is named as the portal names it, spelled out so the one file is found from the portal
    { files: ["apps/infra/**"], rules: { "naming/no-site-name-literal": "off" } },
    {
      files: ["**/*.vue"],
      rules: {
        "props-interface/no-exported-type": "error",
        "props-interface/no-unread-destructure": "error",
        "props-interface/require-props-name": "error",
      },
    },
    {
      files: ["apps/web/configuration/**", "apps/web/nuxt.config.ts"],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            paths: [...RESTRICTED_IMPORT_PATHS, VUETIFY_IMPORT_PATH],
            patterns: [VUETIFY_IMPORT_PATTERN, WORKSPACE_LIBRARY_IMPORT_PATTERN],
          },
        ],
      },
    },
    {
      files: ["apps/web/server/**/*.ts"],
      rules: {
        "persist-then-notify/no-unhandled-effect-after-emit": "error",
        "trpc-procedure/no-hand-rolled-error": "error",
      },
    },
    { files: ["apps/web/server/trpc/guards/*.ts"], rules: { "trpc-procedure/no-hand-rolled-error": "off" } },
    {
      files: ["apps/web/server/trpc/**/*.ts"],
      rules: {
        "trpc-procedure/no-prototype-key": "error",
        "trpc-procedure/require-query-verb": "error",
        "trpc-procedure/require-return-type": "error",
      },
    },
    { files: ["apps/web/server/trpc/**/*.test.ts"], rules: { "trpc-procedure/require-query-verb": "off" } },
    { files: ["**/*.test.ts", "**/*.test-d.ts", "**/*.bench.ts"], rules: { "test-values/no-typed-date": "error" } },
    { files: ["**/*.test.ts"], rules: { "testing/no-faked-set-timeout": "error" } },
    {
      // Nuxt auto-imports Vue into the app tree alone: a package, the Nuxt configuration and `shared/` reach it by import
      files: ["apps/web/app/**"],
      rules: {
        "no-restricted-imports": [
          "error",
          { paths: [...APP_RESTRICTED_IMPORT_PATHS, VUETIFY_IMPORT_PATH], patterns: [VUETIFY_IMPORT_PATTERN] },
        ],
      },
    },
    {
      files: [
        "apps/web/app/components/Ui/**",
        "apps/web/app/composables/ui/**",
        "apps/web/app/models/ui/**",
        "apps/web/app/plugins/ui.ts",
        "apps/web/app/services/ui/**",
      ],
      rules: {
        "no-restricted-globals": [
          "error",
          ...RESTRICTED_GLOBALS.filter((restrictedGlobal) => restrictedGlobal !== USE_UI_STYLE_GLOBAL),
        ],
        "no-restricted-imports": ["error", { paths: APP_RESTRICTED_IMPORT_PATHS }],
      },
    },
    {
      // A page's own `useRoute()` is pinned to the page reading it and narrowed to its own params by the typed router
      files: ["apps/web/app/pages/**/*.vue"],
      rules: {
        "no-restricted-globals": [
          "error",
          ...RESTRICTED_GLOBALS.filter((restrictedGlobal) => restrictedGlobal !== USE_ROUTE_GLOBAL),
          { message: USE_ROUTER_PAGE_MESSAGE, name: "useRouter" },
        ],
        // `no-restricted-globals` sees only the auto-imported `useRouter`, so an explicit import is banned beside it
        "no-restricted-imports": [
          "error",
          {
            paths: [
              ...APP_RESTRICTED_IMPORT_PATHS,
              VUETIFY_IMPORT_PATH,
              { importNames: ["useRouter"], message: USE_ROUTER_PAGE_MESSAGE, name: "#imports" },
              { importNames: ["useRouter"], message: USE_ROUTER_PAGE_MESSAGE, name: "vue-router" },
            ],
            patterns: [VUETIFY_IMPORT_PATTERN],
          },
        ],
      },
    },
    {
      files: ["scripts/src/**/*.ts"],
      rules: { "no-restricted-globals": ["error", ...RESTRICTED_GLOBALS, FETCH_GLOBAL] },
    },
    {
      files: ["**/*.test.ts"],
      rules: {
        "no-restricted-globals": [
          "error",
          ...RESTRICTED_GLOBALS.filter(
            (restrictedGlobal) =>
              !BROWSER_GLOBALS.includes(restrictedGlobal) && restrictedGlobal !== USE_UI_STYLE_GLOBAL,
          ),
        ],
        "setup-scope/no-detached-mutation": "off",
      },
    },
    {
      files: ["apps/web/shared/**"],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            paths: [...RESTRICTED_IMPORT_PATHS, VUETIFY_IMPORT_PATH],
            patterns: [VUETIFY_IMPORT_PATTERN, SHARED_APP_IMPORT_PATTERN],
          },
        ],
      },
    },
    {
      files: ["**/*.bench.ts", "**/*.test.ts"],
      rules: { "error-handling/no-bare-error": "off", "pass-through-helper/no-forwarding-wrapper": "off" },
    },
    { files: ["**/*.bench.ts"], rules: { "vitest/expect-expect": "off", "vitest/prefer-expect-assertions": "off" } },
    {
      files: ["apps/web/app/services/trpc/createErrorAlert.ts", "apps/web/app/services/trpc/errorLink.ts"],
      rules: { "error-alert/no-raw-error-alert": "off" },
    },
    {
      // Every source file of a package or the scripts, not only its `src`: a harness beside it (a parity page, a root
      // Config) reaches its own files through a subpath import too, such as `#parity/*`. The root config's own folders
      // Do the same through the root manifest's `#oxlint/*` and `#vite/*`
      files: ["apps/*/src/**", "packages/*/**/*.{ts,vue}", "scripts/**/*.ts", "oxlint/**/*.ts", "vite/**/*.ts"],
      rules: {
        "no-restricted-imports": ["error", { paths: RESTRICTED_IMPORT_PATHS, patterns: PACKAGE_IMPORT_PATTERNS }],
      },
    },
    ...AUTO_IMPORT_PACKAGE_OVERRIDES,
    {
      // The wrappers are the one place node's child_process is imported, and two plugins keep it, each passing
      // `windowsHide` itself: genshin-persona's source installs from its own package-lock.json, and follow-ups installs as
      // A pinned snapshot, neither with a workspace dependency, so each joins the ban once shared-node is on npm.
      // Persona's `mod` tree is left to the mod override, which bans relative specifiers the engine would refuse.
      files: [
        "packages/shared-node/src/services/childProcess/*.ts",
        "packages/genshin-persona/src/**/*.ts",
        "packages/follow-ups/scripts/**/*.ts",
      ],
      rules: {
        "no-restricted-imports": ["error", { paths: OTHER_RESTRICTED_IMPORT_PATHS, patterns: PACKAGE_IMPORT_PATTERNS }],
      },
    },
    {
      // A Claude Code hooks module imports only its own files by relative path, plus `claude-code`: the engine refuses
      // A subpath import at load, so the mod trees keep every other import restriction and lose the
      // Relative-specifier ban
      files: ["packages/genshin-mods/**/*.ts", "packages/genshin-persona/mod/**/*.ts"],
      rules: {
        "no-restricted-imports": ["error", { paths: RESTRICTED_IMPORT_PATHS, patterns: [MOD_IMPORT_PATTERN] }],
        // Asking whether an async hook fits the engine's `On` overloads costs tsgolint tens of seconds a file and tens of
        // Gigabytes, the whole pass's peak, where tsc checks the program in a second. See openspec/specs/architecture/lint-toolchain/design.md
        "typescript/no-misused-promises": "off",
        "typescript/strict-void-return": "off",
      },
    },
  ],
  plugins: ["import", "oxc", "promise", "typescript", "unicorn", "vitest", "vue"],
  rules: {
    ...PINIA_RULES,
    "class-methods-use-this": "off",
    "comments/no-capitalized-identifier": "error",
    "comments/no-trailing-comment": "error",
    "comments/require-directive-reason": "error",
    complexity: "off",
    curly: ["error", "multi"],
    "enum-map/no-literal-map-key": "error",
    "error-alert/no-raw-error-alert": "error",
    "error-handling/no-bare-error": "error",
    "func-names": "off",
    "id-denylist": ["error", "acc", "created", "curr", "dir", "existing", "idx", "me", "myId", "parsed", "updated"],
    "id-length": "off",
    "immutability/no-map-mutation": "error",
    "import/default": "off",
    "import/exports-last": "off",
    "import/group-exports": "off",
    "import/max-dependencies": "off",
    "import/newline-after-import": ["error", { considerComments: true }],
    "import/no-anonymous-default-export": "off",
    "import/no-default-export": "off",
    "import/no-dynamic-require": "off",
    "import/no-named-export": "off",
    "import/no-namespace": "off",
    "import/no-nodejs-modules": "off",
    "import/no-relative-parent-imports": "off",
    "import/no-unassigned-import": [
      "error",
      {
        allow: [
          "**/*.css",
          "**/*.d.ts",
          "**/*.i18n",
          "apexcharts/features/*",
          "crossws",
          "phaser",
          "temporal-polyfill/global",
          "vue-phaserjs",
        ],
      },
    ],
    "import/prefer-default-export": "off",
    "import/unambiguous": "off",
    "init-declarations": "off",
    "literal-union/no-string-literal-union": "error",
    "max-depth": "off",
    "max-lines": "off",
    "max-lines-per-function": "off",
    "max-params": "off",
    "max-statements": "off",
    "naming/no-call-named-binding": "error",
    "naming/no-site-name-literal": "error",
    "new-cap": "off",
    "no-bitwise": "off",
    "no-console": "off",
    "no-continue": "off",
    "no-duplicate-imports": "off",
    "no-else-return": "off",
    "no-empty-function": "off",
    "no-inline-comments": "off",
    "no-magic-numbers": "off",
    "no-multi-assign": "off",
    "no-nested-ternary": "off",
    "no-plusplus": "off",
    "no-redeclare": "off",
    "no-restricted-globals": ["error", ...RESTRICTED_GLOBALS],
    "no-restricted-imports": [
      "error",
      { paths: [...RESTRICTED_IMPORT_PATHS, VUETIFY_IMPORT_PATH], patterns: [VUETIFY_IMPORT_PATTERN] },
    ],
    "no-restricted-properties": [
      "error",
      {
        message:
          "Avoid `expect.any` — capture the real value from the mock call and assert it exactly (or toBeTypeOf).",
        object: "expect",
        property: "any",
      },
      {
        message:
          "`toStrictEqual(expect.objectContaining(…))` is `toMatchObject` under a longer name — assert the whole value, or each field the test is about.",
        object: "expect",
        property: "objectContaining",
      },
      { message: POLLING_MESSAGE, object: "expect", property: "poll" },
      {
        message:
          "Use `jsonDateParse` from `@esposter/shared` — plain `JSON.parse` leaves every Date as an ISO string. Disable this rule with a reason where blanket revival is wrong (see openspec/specs/architecture/serialization/README.md).",
        object: "JSON",
        property: "parse",
      },
      {
        message:
          "A command line is a citty command, which reads the arguments itself — declare them in its `args`. See the cli skill.",
        object: "process",
        property: "argv",
      },
      { message: POLLING_MESSAGE, object: "vi", property: "waitFor" },
      { message: POLLING_MESSAGE, object: "vi", property: "waitUntil" },
    ],
    "no-ternary": "off",
    "no-undefined": "off",
    "no-underscore-dangle": ["error", { allow: ["_def"] }],
    "no-unused-expressions": ["error", { allowShortCircuit: true, allowTernary: true }],
    "no-use-before-define": "off",
    "no-useless-return": "off",
    "one-var": "off",
    "oxc/no-async-await": "off",
    // Its only alternative is mutating the element, which `immutability/no-map-mutation` bans, and `Object.assign` is `prefer-object-spread`'s error
    "oxc/no-map-spread": "off",
    "oxc/no-optional-chaining": "off",
    "oxc/no-rest-spread-properties": "off",
    "pass-through-helper/no-forwarding-wrapper": "error",
    "pinia-store/require-store-binding": "error",
    "pinia/require-setup-store-properties-export": "off",
    "prefer-destructuring": "off",
    "promise/avoid-new": "off",
    "promise/no-return-wrap": "off",
    "promise/param-names": ["error", { rejectPattern: "^_?reject", resolvePattern: "^_?resolve" }],
    "promise/prefer-await-to-callbacks": "off",
    "promise/prefer-await-to-then": "off",
    "routing/no-route-literal": "error",
    "setup-scope/no-detached-mutation": "error",
    "sort-imports": "off",
    "sort-keys": "off",
    "template-ref/require-ref-name": "error",
    "trpc-procedure/no-empty-input": "error",
    "typescript/ban-types": "off",
    "typescript/consistent-type-imports": [
      "error",
      { disallowTypeAnnotations: false, fixStyle: "separate-type-imports" },
    ],
    "typescript/explicit-function-return-type": "off",
    "typescript/explicit-member-accessibility": ["error", { accessibility: "no-public" }],
    "typescript/explicit-module-boundary-types": "off",
    "typescript/no-deprecated": "error",
    "typescript/no-dynamic-delete": "off",
    "typescript/no-empty-interface": "off",
    "typescript/no-empty-object-type": ["error", { allowInterfaces: "with-single-extends" }],
    "typescript/no-invalid-void-type": "off",
    "typescript/no-redundant-type-constituents": "off",
    "typescript/no-restricted-types": [
      "error",
      {
        types: {
          Omit: "Use `Except` from `type-fest` instead of `Omit` — `Except` errors when a key is absent from the source type, catching the typos `Omit` silently ignores.",
        },
      },
    ],
    "typescript/no-unsafe-argument": "off",
    "typescript/no-unsafe-assignment": "off",
    "typescript/no-unsafe-call": "off",
    "typescript/no-unsafe-enum-comparison": "off",
    "typescript/no-unsafe-member-access": "off",
    "typescript/no-unsafe-return": "off",
    "typescript/no-unsafe-type-assertion": "off",
    "typescript/prefer-nullish-coalescing": "off",
    "typescript/prefer-optional-chain": "error",
    "typescript/prefer-readonly-parameter-types": "off",
    "typescript/promise-function-async": "off",
    "typescript/restrict-plus-operands": "off",
    "typescript/strict-boolean-expressions": "off",
    "typescript/switch-exhaustiveness-check": ["error", { considerDefaultExhaustiveForUnions: true }],
    "typescript/unbound-method": "off",
    "unicorn/filename-case": "off",
    "unicorn/import-style": "off",
    "unicorn/max-nested-calls": "off",
    "unicorn/no-array-reduce": "off",
    "unicorn/no-array-reverse": ["error", { allowExpressionStatement: false }],
    "unicorn/no-array-sort": ["error", { allowExpressionStatement: false }],
    "unicorn/no-await-expression-member": "off",
    "unicorn/no-nested-ternary": "off",
    "unicorn/no-null": "off",
    "unicorn/no-object-as-default-parameter": "off",
    "unicorn/no-process-exit": "off",
    "unicorn/no-useless-undefined": "off",
    "unicorn/number-literal-case": "off",
    "unicorn/numeric-separators-style": ["error", { onlyIfContainsSeparator: true }],
    "unicorn/prefer-add-event-listener": "off",
    "unicorn/prefer-dom-node-append": "error",
    "unicorn/prefer-event-target": "off",
    "unicorn/prefer-export-from": "off",
    "unicorn/prefer-global-this": "off",
    "unicorn/prefer-query-selector": "off",
    "unicorn/prefer-ternary": "off",
    "unicorn/switch-case-braces": "off",
    "vitest/consistent-test-it": ["error", { fn: "test" }],
    "vitest/max-expects": "off",
    "vitest/no-conditional-in-test": "off",
    "vitest/no-hooks": "off",
    "vitest/no-importing-vitest-globals": "off",
    "vitest/no-interpolation-in-snapshots": "off",
    "vitest/no-large-snapshots": "off",
    "vitest/no-restricted-matchers": [
      "error",
      {
        "rejects.toBeInstanceOf":
          "Assert a rejection with `.rejects.toThrowErrorMatchingInlineSnapshot()` — it captures the exact message. See the testing skill.",
        "rejects.toThrow":
          "Assert a rejection with `.rejects.toThrowErrorMatchingInlineSnapshot()` — it captures the exact message. See the testing skill.",
        "rejects.toThrowError":
          "Assert a rejection with `.rejects.toThrowErrorMatchingInlineSnapshot()` — it captures the exact message. See the testing skill.",
        toBeInstanceOf:
          "Assert the whole value with `toStrictEqual`, which checks the class too — `toBeInstanceOf` passes whatever the fields hold. See the testing skill.",
        toMatchObject:
          "Use `toStrictEqual` — `toMatchObject` passes while the fields it does not name drift. See the testing skill.",
        toThrow:
          "Assert a throw with `toThrowErrorMatchingInlineSnapshot()` — it captures the exact message. See the testing skill.",
        toThrowError:
          "Assert a throw with `toThrowErrorMatchingInlineSnapshot()` — it captures the exact message. See the testing skill.",
      },
    ],
    "vitest/prefer-called-once": "off",
    "vitest/prefer-describe-function-title": "off",
    "vitest/prefer-strict-equal": "error",
    "vitest/prefer-to-be-falsy": "off",
    "vitest/prefer-to-be-truthy": "off",
    "vitest/require-hook": "off",
    "vitest/require-test-timeout": "off",
    "vitest/require-top-level-describe": "off",
    "vitest/valid-title": ["error", { ignoreTypeOfDescribeName: true, ignoreTypeOfTestName: true }],
    "vitest/warn-todo": "off",
    "vue/define-props-destructuring": "off",
    "vue/max-props": "off",
    "vue/require-default-prop": "off",
  },
});

export default oxlintConfiguration;
