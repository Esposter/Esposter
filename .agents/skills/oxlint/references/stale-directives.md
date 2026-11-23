# Stale Disable Directives

Read when a lint reports an unused disable directive, or a template directive may no longer suppress anything.

## Script directives fail the lint

`reportUnusedDisableDirectives: "error"` in `oxlint.config.ts` reports every script directive that suppresses nothing, so a stale one never outlives the change that made it stale. `lint:fix` deletes it. A deleted block directive leaves its `oxlint-enable` line behind, which is deleted by hand. A reason that still explains the code, such as a cast's, stays as a plain comment.

A directive the rule cannot use is reported too: a type-aware rule in a `.vue` file (`openspec/specs/architecture/lint-toolchain/design.md`, "The type-aware pass"), and a rule that misses a shape it should report, where the code keeps its reason as a comment under an `@TODO` for the upstream gap.

## Template directives

A template directive has no unused-directive report. To check one, remove it and run `vize lint <file>` on its component: if nothing is reported, the directive was stale; if a finding appears, the directive goes back in.
