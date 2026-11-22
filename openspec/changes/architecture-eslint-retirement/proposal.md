# ESLint retirement

## Why

ESLint is the last tool in the repository that loads the classic TypeScript compiler. `@nuxt/eslint` composes the configuration through `withNuxt`, and `@typescript-eslint/typescript-estree` parses every `.ts` file and every `<script lang="ts">` with the classic API, whether or not a rule is type-aware. That parser is the one reader the [Rust TypeScript toolchain change](../architecture-rust-typescript-toolchain/design.md) has left before the `typescript-native-bridge` override and the `typescript` package can go. ESLint also needs `eslint-plugin-oxlint` to switch off its copies of the rules oxlint already runs. That bridge is a second configuration derived from the first, and it disappears with ESLint.

Most of what ESLint still does now has a native home. vize ships a lint catalogue that covers eslint-plugin-vue's template rules, a selector-based `vue/no-restricted-syntax`, and nearly every accessibility rule eslint-plugin-vuejs-accessibility runs here. oxlint already runs the script half of every `.vue` file and hosts ESLint-API plugins through `jsPlugins` (`eslint-plugin-pinia` is one today). What is left is our own selector bans, a few plugin rules, and the JSON checks, and each has a destination.

## What changes

The retirement runs in four phases. Each phase moves one kind of rule, and only the last one deletes anything.

1. **The Vue template pass moves to vize.** vize lints every `.vue` template: the eslint-plugin-vue template rules we turn on, the accessibility rules, the template half of `vue/no-restricted-syntax`, and our two local template rules. The phase starts with a gate that proves where vize reports a template finding. A finding must land on the template line, in a template-first file and in a file with no script block.
2. **The script rules move to oxlint.** The `no-restricted-syntax` selector lists run in a local oxlint JS plugin that reads the same lists, composed by path in `oxlint.config.ts` as `index.vue.js` composes them today. Perfectionist, the UnoCSS script rules and the Nuxt plugin's rules load through `jsPlugins`. The eslint-plugin-vue script rules map to oxlint's native `vue/*` rules or vize's `script/*` ones.
3. **The JSON checks move to workspace tests.** oxlint reads no JSON, so the dependency ban and the JSON validity rules become workspace tests over the tracked JSON files and manifests.
4. **ESLint and the classic compiler leave the workspace.** ESLint, `@nuxt/eslint`, `eslint-plugin-oxlint`, `vue-eslint-parser`, every ESLint plugin, every `eslint.config.*` file and `packages/configuration/eslint/` are deleted. Every `eslint-disable` directive is rewritten for the rule's new host. Then the `typescript-native-bridge` override and the `typescript` package go, which finishes the toolchain change's phases 3 and 4.

**BREAKING** for contributors: `pnpm lint:fix:eslint` and the ESLint editor integration are removed, and a disable directive is spelled for oxlint or vize.

## Capabilities

- `architecture/lint-toolchain`: the second pass becomes vize's template pass, the bridge between the passes is removed, and the lint runs without the classic compiler installed.

## Out of scope

- `typescript/naming-convention`, which stays parked in `packages/configuration/eslint/typescriptRules.js` until oxlint ships it. The parked block moves to `oxlint.config.ts` as a comment with that trigger.
- The type-aware lint backend. `tsrs-lint` is unchanged.
- New bans. Each rule moves as it stands, and a rule that changes meaning in the move is a finding for its own change.
