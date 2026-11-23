import ignores, { TEST_FILE_PATTERNS } from "@esposter/configuration/eslint/ignores.js";
import nuxtOverrides from "@esposter/configuration/eslint/overrides/nuxt.js";
import oxlint from "@esposter/configuration/eslint/oxlint.js";
import plugins from "@esposter/configuration/eslint/plugins/index.js";
import restrictedConstantSyntaxes from "@esposter/configuration/eslint/restrictedConstantSyntaxes.js";
import restrictedDateSyntaxes from "@esposter/configuration/eslint/restrictedDateSyntaxes.js";
import restrictedFocusSyntaxes from "@esposter/configuration/eslint/restrictedFocusSyntaxes.js";
import restrictedModuleSyntaxes from "@esposter/configuration/eslint/restrictedModuleSyntaxes.js";
import restrictedOverloadSyntaxes from "@esposter/configuration/eslint/restrictedOverloadSyntaxes.js";
import restrictedSequencingSyntaxes from "@esposter/configuration/eslint/restrictedSequencingSyntaxes.js";
import restrictedSourceSyntaxes from "@esposter/configuration/eslint/restrictedSourceSyntaxes.js";
import restrictedStoreCallSyntaxes from "@esposter/configuration/eslint/restrictedStoreCallSyntaxes.js";
import restrictedStoreSyntaxes from "@esposter/configuration/eslint/restrictedStoreSyntaxes.js";
import restrictedTestSyntaxes from "@esposter/configuration/eslint/restrictedTestSyntaxes.js";
import restrictedTrimSyntaxes from "@esposter/configuration/eslint/restrictedTrimSyntaxes.js";
import restrictedUtilImports from "@esposter/configuration/eslint/restrictedUtilImports.js";
import restrictedWatchSyntaxes from "@esposter/configuration/eslint/restrictedWatchSyntaxes.js";
import typescriptRules from "@esposter/configuration/eslint/typescriptRules.js";

import { withNuxt } from "../../../apps/web/.nuxt/eslint.config.mjs";

// The script-side bans each `no-restricted-syntax` override below carries over, read off the base list once
const scriptSyntaxBans = typescriptRules["no-restricted-syntax"].slice(1);

// vize's lint holds a page, a layout and a server component to one root, so Nuxt's own block for it goes
export default withNuxt(plugins)
  .remove("nuxt/vue/single-root")
  .overrides({ ...nuxtOverrides, "nuxt/typescript/rules": { rules: typescriptRules } })
  .append(oxlint)
  .append({
    files: ["**/util/**/*.ts"],
    ignores: TEST_FILE_PATTERNS,
    rules: { "no-restricted-imports": ["error", restrictedUtilImports] },
  })
  // A component may not format a date itself, where a service may — and eslint replaces a rule's options
  // Rather than merging them, so the script-side bans are carried over and the date ones appended.
  .append({
    files: ["**/*.vue"],
    rules: {
      "no-restricted-syntax": [
        "error",
        ...scriptSyntaxBans,
        ...restrictedConstantSyntaxes,
        ...restrictedSourceSyntaxes,
        ...restrictedDateSyntaxes,
        ...restrictedStoreSyntaxes,
        ...restrictedTrimSyntaxes,
        ...restrictedWatchSyntaxes,
      ],
    },
  })
  // A `watch` sits in a store or a composable as often as in a component, so the alias ban is the one script-side
  // Addition that has to reach `.ts` as well.
  .append({
    files: ["**/*.ts"],
    rules: {
      "no-restricted-syntax": [
        "error",
        ...scriptSyntaxBans,
        ...restrictedModuleSyntaxes,
        ...restrictedSourceSyntaxes,
        ...restrictedWatchSyntaxes,
      ],
    },
  })
  // A store is consumed the same way in `.ts` as in `.vue`, so every app `.ts` takes the dot-read ban. A store's own
  // Source is the exception: it reads a nested store's refs by dot on purpose, so its override below keeps only the
  // Method-call ban. Tests under `app/` are a consumer too, and the app test override carries the ban past the test one.
  .append({
    files: ["**/app/**/*.ts"],
    rules: {
      "no-restricted-syntax": [
        "error",
        ...scriptSyntaxBans,
        ...restrictedModuleSyntaxes,
        ...restrictedSequencingSyntaxes,
        ...restrictedSourceSyntaxes,
        ...restrictedStoreSyntaxes,
        ...restrictedWatchSyntaxes,
      ],
    },
  })
  .append({
    files: ["**/app/store/**/*.ts"],
    ignores: TEST_FILE_PATTERNS,
    rules: {
      "no-restricted-syntax": [
        "error",
        ...scriptSyntaxBans,
        ...restrictedModuleSyntaxes,
        ...restrictedSourceSyntaxes,
        ...restrictedSequencingSyntaxes,
        ...restrictedStoreCallSyntaxes,
        ...restrictedWatchSyntaxes,
      ],
    },
  })
  // A composable holds no fixed value of its own, so its override is the `.ts` one plus that ban — a suite or a bench
  // Under `composables/` keeps its fixtures, which the test override below still reaches.
  .append({
    files: ["**/composables/**/*.ts"],
    ignores: TEST_FILE_PATTERNS,
    rules: {
      "no-restricted-syntax": [
        "error",
        ...scriptSyntaxBans,
        ...restrictedConstantSyntaxes,
        ...restrictedModuleSyntaxes,
        ...restrictedSourceSyntaxes,
        ...restrictedWatchSyntaxes,
      ],
    },
  })
  // The Nuxt app's own components and composables are where `useAutofocus` is auto-imported, so a focus in `onMounted`
  // Is the ask it replaces there; each override carries the base it replaces over and appends the focus ban.
  .append({
    files: ["**/app/**/*.vue"],
    rules: {
      "no-restricted-syntax": [
        "error",
        ...scriptSyntaxBans,
        ...restrictedConstantSyntaxes,
        ...restrictedFocusSyntaxes,
        ...restrictedSequencingSyntaxes,
        ...restrictedSourceSyntaxes,
        ...restrictedDateSyntaxes,
        ...restrictedStoreSyntaxes,
        ...restrictedTrimSyntaxes,
        ...restrictedWatchSyntaxes,
      ],
    },
  })
  .append({
    files: ["**/app/composables/**/*.ts"],
    ignores: TEST_FILE_PATTERNS,
    rules: {
      "no-restricted-syntax": [
        "error",
        ...scriptSyntaxBans,
        ...restrictedConstantSyntaxes,
        ...restrictedFocusSyntaxes,
        ...restrictedModuleSyntaxes,
        ...restrictedSequencingSyntaxes,
        ...restrictedSourceSyntaxes,
        ...restrictedStoreSyntaxes,
        ...restrictedWatchSyntaxes,
      ],
    },
  })
  // A test file carries the script-side bans plus its own — a typed `vi.fn` — the same carry-the-base-over
  // Shape the date bans use above, the watch aliases included since this override replaces the `.ts` one.
  // A test setup file mocks modules and re-imports after mocking, as a test does, so it takes the test bans
  .append({
    files: ["**/*.test.ts", "**/test/setup.ts"],
    rules: {
      "no-restricted-syntax": [
        "error",
        ...scriptSyntaxBans,
        ...restrictedModuleSyntaxes,
        ...restrictedTestSyntaxes,
        ...restrictedWatchSyntaxes,
      ],
    },
  })
  // An app test is a consumer, so it carries the store ban the test override above does not. Scoped to `app/` because a
  // Server test names its own `keyframeStore` and `objectStore`, which are not Pinia stores.
  .append({
    files: ["**/app/**/*.test.ts"],
    rules: {
      "no-restricted-syntax": [
        "error",
        ...scriptSyntaxBans,
        ...restrictedModuleSyntaxes,
        ...restrictedStoreSyntaxes,
        ...restrictedTestSyntaxes,
        ...restrictedWatchSyntaxes,
      ],
    },
  })
  // A declaration file augments third-party APIs that are overloaded already, so the overload bans stop at its door.
  // Every other script-side ban still reaches it, so only the overload entries leave its list
  .append({
    files: ["**/*.d.ts"],
    rules: {
      "no-restricted-syntax": [
        "error",
        ...scriptSyntaxBans.filter((entry) => !restrictedOverloadSyntaxes.includes(entry)),
        ...restrictedModuleSyntaxes,
        ...restrictedSourceSyntaxes,
        ...restrictedWatchSyntaxes,
      ],
    },
  })
  .append(ignores);
