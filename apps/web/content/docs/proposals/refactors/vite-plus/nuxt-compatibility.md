---
title: Nuxt compatibility
description: What Vite+ actually supports for a Nuxt monorepo, why `vp migrate` cannot be used here at all, and the adoption ladder that follows from both.
---

# Nuxt Compatibility

Vite+ scaffolds Nuxt projects and runs alongside one, and that is not the same as supporting one. The honest statement is narrower than the marketing and narrower than the earlier version of this proposal implied: **the framework-agnostic half of Vite+ works here completely, and the Vite-application half does not apply to the app at all.**

Setting that out explicitly matters because the two halves fail differently. A command that does not apply is a command nobody runs. A command that half-applies — linting that reads a `.vue` file and silently skips most of it — is the one that produces false confidence.

## What holds and what does not

| Surface                         | Status here                                                                                                                                                                                                                                        |
| :------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `vp run --cache`                | **Applies, unproven.** Framework-agnostic — it runs `nuxt build` as a task — but the traced key is what [Phase 0](/docs/proposals/refactors/vite-plus/phases) measures, and worker fan-out and the virrun overlay are the two ways it can be wrong |
| `vp fmt`                        | **Works fully.** oxfmt already formats every file type in the repo                                                                                                                                                                                 |
| `vp env`, `vp install`, `vp pm` | **Works.** Runtime and package-manager management are indifferent to the framework                                                                                                                                                                 |
| `vp lint`                       | **Partial, and the partiality is the risk** — oxlint parses a `.vue` script block, not its template                                                                                                                                                |
| `vp test`                       | **Unproven.** Two specific blockers below                                                                                                                                                                                                          |
| `vp build`, `vp dev`            | **Does not apply to the app.** Nuxt owns the build, the dev server and the module graph                                                                                                                                                            |
| `vp pack`                       | Applies to the libraries, which are already tsdown packages                                                                                                                                                                                        |

The config-file consequence of that last row is the seam described in [configuration](/docs/proposals/refactors/vite-plus/configuration): Vite+ needs a root `vite.config.ts` to recognise a workspace, Nuxt wraps Vite and discourages a standalone one, and the request to let `nuxt.config.ts` be the authoritative source was raised upstream and closed without an implementation ([issue 912](https://github.com/voidzero-dev/vite-plus/issues/912)). The resulting warning is a warning rather than a defect — a separate config works ([Nuxt discussion](https://github.com/nuxt/nuxt/discussions/34857)) — but the arrangement is two config trees where one would do.

### The two test blockers

Neither is speculative and both are measurable before anything is changed.

- **The Nuxt Vitest environment.** Well over a hundred test files opt into it with a `@vitest-environment nuxt` pragma, and that environment is supplied by Nuxt's own test utilities rather than by Vitest. Whether it still registers under a `vp test` invocation is the question, and a large share of the suite depends on the answer.
- **The sharded blob pipeline.** The suite runs as one root Vitest `projects` config so it shares one run, one coverage report and one `--shard` axis, and CI fans it across shards with `--reporter=blob` and recombines with `--merge-reports`. A wrapper that does not forward those flags cleanly does not merely run slower — it silently stops being one coverage report, and the aggregate gate that means "every shard passed" is exactly the check this repository has already had go green while a shard did not.

Until both are answered, the suite keeps invoking Vitest directly and only its _wrapper_ becomes a task. That is not a compromise; running a tool through a cached task runner is where the value is, and rewriting how the tool is imported buys nothing on top of it.

## `vp migrate` cannot be used here

This is worth stating as a flat conclusion rather than a caveat, because the command's name invites reaching for it first.

Three properties rule it out, and any one of them would be enough:

- **It is workspace-root only.** The documentation is explicit that a monorepo's migration target must be the workspace root and that Vite+ cannot migrate a single workspace member, because it rewrites shared package-manager configuration and the lockfile. So the one thing wanted from it — a small first increment — is the one thing it does not do.
- **It rewrites imports across the repository.** It converts `vite` to `vite-plus` and `vitest` to `vite-plus/test`. Many hundreds of files here import from `vitest`, and the Vitest config type is imported in the shared configuration factory that every package's config calls. That rewrite does not adopt a runner; it makes Vite+ a source-level dependency of the entire test suite, which is a far larger commitment than caching tasks, and it is the commitment hardest to reverse.
- **It merges tool configs into one `vite.config.ts`.** That is the monolith this migration is explicitly organised to avoid, and unpicking a generated merge into per-concern modules afterwards is more work than composing them correctly in the first place.

It also has no documented meta-framework handling, which for this repository is the least of the three problems but confirms the shape of the tool: it is built for a Vite application, and the app here is not one.

So the migration is performed by hand. That is the recommendation, not a fallback.

## The adoption ladder

Ordered by how little of Vite+ each rung requires, which is also the order of decreasing certainty. Each rung is useful alone and reversible alone, and the ladder is what the [phases](/docs/proposals/refactors/vite-plus/phases) schedule against.

1. **Tasks and caching only.** Tasks invoke the existing scripts verbatim. No import rewrites, no config merges, Nuxt untouched, and every check runs the same binary it runs today. All of the measurable value sits on this rung.
2. **Lint and format configuration.** The oxlint and oxfmt settings relocate into the Vite+ config, decomposed per concern. Behaviour unchanged; only who reads the settings.
3. **Runtime and package manager.** `vp env` and `vp install`, with the caveat that the repository's second runtime pin does not transfer.
4. **The test runner** — only if both blockers above clear. Otherwise this rung is never climbed, and nothing below it is affected.
5. **The app build** — never, while Nuxt owns the module graph. This is not a pending item; it is the seam.

The ladder's shape is the argument against `vp migrate` restated as a plan: the value is concentrated on the first rung, the risk is concentrated on the fourth, and a workspace-wide rewrite would take all of it at once.

## Where ESLint sits

Oxlint reading a `.vue` file's script and not its template is the reason ESLint does not leave, and it is worth being precise about the consequence: `vp lint` replaces the oxlint invocation, not the ESLint one, and the two continue side by side.

That is also why this proposal does not accelerate the [ESLint to oxlint migration](/docs/proposals/refactors/eslint-to-oxlint-migration). Vite+ changes who invokes the linter; it does not change what the linter can parse. Treating adoption as progress on that migration would retire ESLint rules that nothing has replaced, over templates that nothing is reading.
