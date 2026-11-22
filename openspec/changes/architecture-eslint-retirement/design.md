# ESLint retirement

## Context

The lint runs as two passes today, as the [lint toolchain](../../specs/architecture/lint-toolchain/design.md) describes. oxlint is the fast pass. It runs repo-wide with the type-aware backend and reads the script blocks of a `.vue` file. ESLint is the second pass, for what oxlint cannot parse or express: `.vue` templates, JSON, and the `no-restricted-syntax` selector bans. ESLint runs from the configuration that `withNuxt` composes in `apps/web/.nuxt/eslint.config.mjs`, extended by `packages/configuration/eslint/index.vue.js` for the app and the three scoped-style Vue packages, and by `packages/configuration/eslint/index.typescript.js` everywhere else. `eslint-plugin-oxlint` (`packages/configuration/eslint/oxlint.js`) switches off every ESLint rule oxlint already runs, so no file is checked twice.

The parser under that configuration is `@typescript-eslint/typescript-estree`, which builds its tree with the classic TypeScript API. It is the last reader of the `typescript-native-bridge` override ([Rust TypeScript toolchain](../architecture-rust-typescript-toolchain/design.md), "Phase 3 and 4"). Deleting ESLint deletes that reader, so the override and the `typescript` package can go too.

## What ESLint does today, and where each piece goes

ESLint still runs a short list of rule families once the bridge has switched off everything oxlint covers. Each family gets one destination.

| Family                                                                | Runs on                  | Destination                                                                                         |
| :-------------------------------------------------------------------- | :----------------------- | :-------------------------------------------------------------------------------------------------- |
| eslint-plugin-vue template rules, from `withNuxt` and `vueRules.js`   | `.vue` templates         | vize's `vue/*` rules, configured to the same options                                                |
| eslint-plugin-vue script rules                                        | `.vue` script blocks     | oxlint's native `vue/*` where it has the rule, else vize's `script/*`                               |
| `vue/no-restricted-syntax`, the template selector list                | `.vue` templates         | vize's `vue/no-restricted-syntax`, the selectors rewritten for vize's template tree                 |
| eslint-plugin-vuejs-accessibility                                     | `.vue` templates         | vize's `a11y/*` rules, which name all but one of the rules we run                                   |
| `directives/require-template-reason`, local                           | template comments        | the same check over the template pass's own directive comments                                      |
| `scoped-styles/no-unknown-attribute`, local                           | scoped-style packages    | a vize rule over the same HTML data, run only for those three packages                              |
| `no-restricted-syntax`, the script selector lists                     | `.ts` and `.vue` scripts | a local oxlint JS plugin that reads the same lists, composed per path in `oxlint.config.ts`         |
| perfectionist                                                         | all code                 | `jsPlugins`, as `eslint-plugin-pinia` loads today                                                   |
| UnoCSS `order`, `blocklist`                                           | script and class strings | `jsPlugins`                                                                                         |
| UnoCSS `order-attributify`                                            | `.vue` templates         | a vize rule, or deleted if vize can host none (Decisions)                                           |
| `nuxt/*` rules, from `@nuxt/eslint-plugin`                            | `.ts`, `.vue` scripts    | `jsPlugins`                                                                                         |
| `link-checker/*`, from `nuxt-link-checker`                            | `.ts`, `.vue`            | `jsPlugins` if it loads without the Nuxt runtime, else `routing/no-route-literal` alone (Decisions) |
| `depend/ban-dependencies`                                             | `package.json`           | a workspace test over every manifest                                                                |
| `jsonc/*` and `@eslint/json`                                          | JSON and JSONC files     | a workspace test over the tracked JSON files                                                        |
| `no-octal`                                                            | `.ts`, `.vue`            | deleted: every file here is an ES module, where a legacy octal literal is already a syntax error    |
| `no-useless-assignment`, `@typescript-eslint/consistent-type-imports` | `.ts`, `.vue`            | already run by oxlint; the ESLint copy goes with ESLint                                             |

## The template pass

oxlint parses only the script blocks of a `.vue` file. Its JS plugins see the same script program, so a plugin that reads the template can find a problem but cannot report it at the right place. On a file whose template comes before its script, which is every component here, a template position reported through a JS plugin either throws or lands on the script block ([oxc 15761](https://github.com/oxc-project/oxc/issues/15761)). vize's own guide says the same of its oxlint plugin: its diagnostics are anchored to the extracted script program, and a `.vue` file with no script block never runs its per-file rules.

So the template rules run in vize's own lint, as a step of its own in the root lint script, beside oxlint. vize parses the whole single-file component, so it reports each finding on its template line and lints a file with no script block. The phase opens with a gate. A planted violation on a template-first component, and another in a component with no script block, must both be reported on their template lines. The gate is run against the oxlint plugin first. If the plugin reports both correctly, the template rules run there, and the lint stays one command. If it does not, they run in vize's lint. Either way the rest of the phase is the same, since only the host differs.

```mermaid
flowchart TD
  PLANT["planted template violations: template-first, and no script block"] --> PLUGIN{"the vize oxlint plugin reports both on their template lines?"}
  PLUGIN -->|"yes"| INOX["template rules run inside oxlint"]
  PLUGIN -->|"no"| NATIVE{"vize's own lint reports both on their template lines?"}
  NATIVE -->|"yes"| STEP["template rules run as vize's lint step"]
  NATIVE -->|"no"| HOLD["phase 1 holds: template rules stay in ESLint, upstream issue filed"]
  INOX --> MAP["map each template rule, option by option"]
  STEP --> MAP
  MAP --> GAP{"vize has the rule and its options?"}
  GAP -->|"yes"| DONE["configured in the template pass"]
  GAP -->|"no"| SEL{"a vize selector ban expresses it?"}
  SEL -->|"yes"| DONE
  SEL -->|"no"| OWN["a local vize rule, or the Decisions entry for that rule"]
```

## The script pass

The script selector bans keep their data. The `restricted*Syntaxes.js` lists and the inline ones in `typescriptRules.js` move to `oxlint/`, beside the rest of the oxlint data, and one local JS plugin under `scripts/src/oxlint/` registers each entry's selector as a visitor and reports its message. The per-path composition that `index.vue.js` does with its `.append` blocks becomes `overrides` entries in `oxlint.config.ts`. An oxlint override replaces a rule's options as an ESLint block does, so each override still carries the base list it extends. The existing tests beside each list plant violations, and they move with the list, so each ban is proved in its new host before ESLint's copy goes.

The phase opens with its own gate: a planted violation for a selector of each shape the lists use, such as attribute regexes, `:not(...)`, descendant and `:has(...)`, must be reported by the JS plugin. A selector the plugin's engine cannot run is rewritten as a visitor in the same plugin. A rule is never dropped for that reason.

## Decisions

**One phase per kind of rule, deletion last.** Every phase moves rules and leaves ESLint running. ESLint's copy of a moved rule is switched off in the same commit, and only phase 4 deletes ESLint. Rejected: deleting ESLint first and restoring rules as they are found missing. That ships weeks of unlinted code, and nothing records which rule was lost.

**The template rules run in vize, not in an oxlint JS plugin we write.** vize parses the whole component and already carries the template rules, selector bans included. Rejected: a JS plugin that parses the component with `@vue/compiler-sfc` and walks the template. It finds problems but cannot report them on the template line in a template-first file ([oxc 15761](https://github.com/oxc-project/oxc/issues/15761)), and it would be a second copy of eslint-plugin-vue that this repository maintains.

**The script selector bans become one data-driven JS plugin, not one rule per ban.** The lists are data, and their tests already plant each violation. A plugin that reads them keeps one place to add a ban. Rejected: porting each selector to a hand-written rule, which is about a hundred rules to maintain for no gain in what they catch. Also rejected: waiting for a native selector rule in oxlint. None is planned, and the lint toolchain's table already records that gap as permanent for oxlint itself.

**The JSON checks become workspace tests.** oxlint reads no JSON ([oxc 18656](https://github.com/oxc-project/oxc/issues/18656)), and the dependency ban and the validity rules are checks over a small, fixed set of files, which is what a workspace test is for (the [enforcement ladder](../../specs/architecture/enforcement-ladder/design.md)). The dependency test reads the same replacement data that eslint-plugin-depend reads, so its verdicts match the rule it replaces. Rejected: keeping ESLint for JSON alone. That keeps every package this change deletes, `@nuxt/eslint` aside, for a handful of files. When oxlint reads JSON, the two checks move back to rules, which is the trigger recorded on the test.

**`no-octal` is deleted, not moved.** Every source file here is an ES module, so it runs in strict mode, where a legacy octal literal is a syntax error the parser already reports. Rejected: a selector ban, which would re-report what the parser refuses.

**`vuejs-accessibility/no-onchange` is deleted.** vize has no rule of that name, and the rule exists for a screen-reader behaviour that no current browser has. eslint-plugin-jsx-a11y deprecated its own copy for that reason. Rejected: a vize selector ban for it, which would keep a rule whose reason no longer holds.

**`vue/component-api-style` becomes a script selector ban.** vize has no rule of that name, and the ban is two selectors over the script: an `export default` object, and a call to `defineComponent`. Both go in the script selector lists. Rejected: keeping the rule's name through a local vize rule, which is more code for the same two selectors.

**`vue/padding-line-between-blocks` is left to the formatter.** It is whitespace between a component's top-level blocks, which the formatter owns (the `formatting` skill). Rejected: a local rule for one blank line. If the formatter does not hold it, the gap is recorded in the formatting skill as a fact, never as a lint rule.

**A vize rule that lacks an option we set is configured to the nearest form, and the difference is recorded.** `vue/component-name-in-template-casing` has no `ignores`, `vue/v-bind-style` has no same-name shorthand option, and `vue/no-restricted-html-elements` has no per-element message. Each missing behaviour becomes a template selector ban that carries the message, so the rule still fails with our wording. Rejected: dropping the option silently. The difference goes in the template pass's configuration as a comment, with the upstream request filed against vize.

**UnoCSS attribute order follows the same ladder as any template rule.** If vize's selector bans cannot express the ordering, the check is deleted and the ordering is left to review. Rejected: keeping ESLint for one cosmetic rule. The decision is recorded either way, so the next audit does not re-derive it.

**`nuxt-link-checker` stays only if its rule loads without the Nuxt runtime.** If it needs the app's generated routes at lint time and cannot read them through `jsPlugins`, it is deleted, and `routing/no-route-literal`, our own rule, remains the route check. Rejected: keeping `@nuxt/eslint` installed only to feed it.

**`eslint-plugin-oxlint` goes with ESLint, and the categories stay listed.** The bridge is why the lint toolchain says every oxlint category must be listed explicitly, `correctness` included: the bridge replaces oxlint's defaults with what the file names. Without the bridge that reason is gone, but the list stays, because a category oxlint turns on by default is still a decision the file should state. Rejected: trimming the list to non-defaults, which hides the most important category behind an upstream default.

**The `typescript` package goes in the same phase as ESLint.** Once ESLint is gone, nothing in-process loads it ([Rust TypeScript toolchain](../architecture-rust-typescript-toolchain/design.md), "Phase 3 and 4"). `@trpc/client` and `@trpc/server` keep a required peer on it for their types, which pnpm reports as a missing peer. The workspace's `peerDependencyRules` names that peer as allowed to be missing, with the reason beside it. Rejected: keeping the package installed for an install warning.

## Key files

| File                                                          | Role                                                                                     |
| :------------------------------------------------------------ | :--------------------------------------------------------------------------------------- |
| `oxlint.config.ts`                                            | gains the script selector bans by path, the JS plugins and the template pass's wiring    |
| `oxlint/jsPlugins.ts`                                         | lists the JS plugins oxlint loads; the third-party ESLint plugins join it                |
| `scripts/src/oxlint/`                                         | the local JS plugins; the selector-ban plugin joins them                                 |
| `packages/configuration/eslint/index.vue.js`                  | the per-path selector composition that moves to `oxlint.config.ts`, then is deleted      |
| `packages/configuration/eslint/overrides/vueRules.js`         | the eslint-plugin-vue options the template pass is configured to match                   |
| `packages/configuration/eslint/plugins/vuejsAccessibility.js` | the accessibility options the vize `a11y/*` rules are configured to match                |
| `packages/configuration/eslint/plugins/scopedStyles.js`       | the scoped-style attribute check that moves to the template pass                         |
| `packages/configuration/eslint/plugins/directives.js`         | the template directive-reason check that moves to the template pass                      |
| `packages/configuration/eslint/typescriptRules.js`            | the inline script selector bans that move to `oxlint/`                                   |
| `packages/configuration/eslint/plugins/depend.js`             | the dependency ban that becomes a workspace test                                         |
| `packages/configuration/eslint/plugins/json.js`               | the JSON rules that become a workspace test                                              |
| `apps/web/configuration/modules.ts`                           | loads `@nuxt/eslint`, which is removed                                                   |
| `package.json`, `pnpm-workspace.yaml`                         | the lint scripts, the catalog entries removed, the override and the `typescript` entry   |
| `openspec/specs/architecture/lint-toolchain/design.md`        | rewritten at archive for oxlint and vize, with no bridge and no blocker table for ESLint |

## Notes

- The ESLint directives in the tree mostly name `no-restricted-syntax`, `perfectionist/sort-objects` and `vue/no-restricted-syntax`. Each is rewritten for its rule's new host in the phase that moves the rule, so a directive never names a rule nothing runs. The `vue/no-v-html` directives already name a rule that is off, and they are deleted rather than rewritten.
- vize describes itself as experimental and pre-1.0. The template pass is pinned by the catalog like every other dependency, and a vize bump is read against the gate's planted violations, which stay as tests.

## Sources

- [oxc 15761](https://github.com/oxc-project/oxc/issues/15761) — oxlint's Vue support, and why a JS plugin's template position lands on the script block.
- [oxc 18656](https://github.com/oxc-project/oxc/issues/18656) — oxlint reading JSON.
- [vize oxlint plugin guide](https://vizejs.dev/guide/oxlint/) — the plugin's anchoring to the script program, and files with no script block.
- [vize rules](https://vizejs.dev/rules/all/) — the rule catalogue and its presets.
