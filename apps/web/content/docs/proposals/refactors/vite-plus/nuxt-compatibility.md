---
title: Nuxt compatibility
description: What Vite+ actually supports for a Nuxt monorepo, why `vp migrate` cannot be used here at all, and the adoption ladder that follows from both.
model: claude-opus-5-5
---

# Nuxt Compatibility

Vite+ scaffolds Nuxt projects and runs alongside one, and that is not the same as supporting one. The honest statement is narrower than the marketing: **the framework-agnostic half of Vite+ works here, and the Vite-application half does not apply to the app at all.** The 1.0 release changed neither half: its stability promise covers the CLI and the config schema, and nothing in it is about meta-frameworks. That holds for the Nuxt 5 nightly the app runs as much as for Nuxt 4, because the half that does not apply is the half that would touch the build.

Setting that out explicitly matters because the two halves fail differently. A command that does not apply is a command nobody runs. A command that half-applies — linting that reads a `.vue` file and silently skips most of it — is the one that produces false confidence.

## What holds and what does not

| Surface                         | Status here                                                                                                                                                                                                                                                                                           |
| :------------------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `vp run --cache`                | **Works, shipped for the build.** Framework-agnostic — it runs `nuxt build` as a task, and [Phase 0](/docs/proposals/refactors/vite-plus/phases) measured that path before CI adopted it; the tracer still has open reports of reads it misses, so a new class of input is probed before it is cached |
| `vp env`, `vp install`, `vp pm` | **Works.** Runtime and package-manager management are indifferent to the framework                                                                                                                                                                                                                    |
| `vp fmt`                        | **Works, not taken.** It runs the Oxfmt `vite-plus` pins rather than the catalog's ([configuration](/docs/proposals/refactors/vite-plus/configuration))                                                                                                                                               |
| `vp lint`                       | **Partial, and not taken** — the bundled Oxlint again, and Oxlint parses a `.vue` script block, not its template                                                                                                                                                                                      |
| `vp check`                      | **Does not cover the app.** Its type-check is `tsgolint`'s, which reads no `.vue` file; the app's is `nuxt typecheck`                                                                                                                                                                                 |
| `vp test`                       | **Unproven, and a version swap.** Three blockers below                                                                                                                                                                                                                                                |
| `vp build`, `vp dev`            | **Does not apply to the app.** Nuxt owns the build, the dev server and the module graph; `vp dev` in a Nuxt project prints a hint pointing at the package script and still starts plain Vite ([issue 1506](https://github.com/voidzero-dev/vite-plus/issues/1506))                                    |
| `vp pack`                       | Applies to the libraries, which are already tsdown packages built through the shared factory — nothing to gain by changing the invoker                                                                                                                                                                |

The config-file consequence of the build row is the seam described in [configuration](/docs/proposals/refactors/vite-plus/configuration): Vite+ needs a root `vite.config.ts` to recognise a workspace, Nuxt wraps Vite and discourages a standalone one, and upstream declined to let `nuxt.config.ts` stand in. Elsewhere that costs a permanent warning on every Nuxt run ([Nuxt discussion](https://github.com/nuxt/nuxt/discussions/34857)); here the config sits at the workspace root, above the app's own root directory where Nuxt looks, so the two config trees coexist without one warning about the other.

### The three test blockers

None is speculative and all are checkable before anything is changed.

- **The Nuxt Vitest environment.** Well over a hundred test files opt into it with a `@vitest-environment nuxt` pragma, and that environment is supplied by Nuxt's own test utilities rather than by Vitest. Whether it still registers under a `vp test` invocation is the question, and a large share of the suite depends on the answer.
- **The sharded blob pipeline.** The suite runs as one root Vitest `projects` config ([monorepo tooling](/docs/architecture/monorepo-tooling) owns why), and CI fans it across shards with `--reporter=blob` and recombines with `--merge-reports`. A wrapper that does not forward those flags cleanly does not merely run slower — it silently stops being one coverage report, and the aggregate gate that means "every shard passed" is exactly the check this repository has already had go green while a shard did not.
- **The bundled Vitest.** `vp test` runs the Vitest that `vite-plus` bundles at an exact version, with its APIs imported from `vite-plus/test` ([test guide](https://viteplus.dev/guide/test)), and it pins the browser-mode provider as an exact peer. At 1.0 that copy trails the catalog's, so adopting it is a downgrade on every Vitest release until Vite+ ships its next one.

Until all three are answered, the suite stays as [monorepo tooling](/docs/architecture/monorepo-tooling) leaves it — Vitest invoked directly, its wrapper the task. That is not a compromise; running a tool through a cached task runner is where the value is, and rewriting how the tool is imported buys nothing on top of it.

## `vp migrate` cannot be used here

This is worth stating as a flat conclusion rather than a caveat, because the command's name invites reaching for it first.

Three properties rule it out, and any one of them would be enough:

- **It is workspace-root only.** The documentation is explicit that a monorepo's migration target must be the workspace root and that Vite+ cannot migrate a single workspace member, because it rewrites shared package-manager configuration and the lockfile. So the one thing wanted from it — a small first increment — is the one thing it does not do.
- **It rewrites imports across the repository.** It converts `vite` to `vite-plus` and `vitest` to `vite-plus/test`. Many hundreds of files here import from `vitest`, and the Vitest config type is imported in the shared configuration factory that every package's config calls. That rewrite does not adopt a runner; it makes Vite+ a source-level dependency of the entire test suite, which is a far larger commitment than caching tasks, and it is the commitment hardest to reverse.
- **It merges tool configs into one `vite.config.ts`.** That moves the lint and format settings onto the bundled tools — exactly the relocation [configuration](/docs/proposals/refactors/vite-plus/configuration) parks — and unpicking a generated merge afterwards is more work than never making it.

It also has no documented meta-framework handling, which for this repository is the least of the three problems but confirms the shape of the tool: it is built for a Vite application, and the app here is not one.

So the migration is performed by hand. That is the recommendation, not a fallback.

## The adoption ladder

Ordered by how little of Vite+ each rung requires. Each rung is useful alone and reversible alone, and the ladder is what the [phases](/docs/proposals/refactors/vite-plus/phases) schedule against; the verdict on each at 1.0 is in [the index](/docs/proposals/refactors/vite-plus).

1. **Tasks and caching only.** Tasks invoke the existing scripts verbatim. No import rewrites, no config merges, Nuxt untouched, and every check runs the same binary it runs today. All of the measurable value sits on this rung, and all of its risk is the tracer.
2. **Runtime and package manager.** `vp env` provisioning Node and pnpm, with the caveat that the repository's second runtime pin does not transfer. Independent of the first rung.
3. **The built-in lint and format commands** — parked until they run the catalog's own tools. Until then they cost the repository its version ownership and buy nothing the scripts do not already do.
4. **The test runner** — only if all three blockers above clear. Otherwise this rung is never climbed, and nothing below it is affected.
5. **The app build** — never, while Nuxt owns the module graph. This is not a pending item; it is the seam.

The ladder's shape is the argument against `vp migrate` restated as a plan: the value is concentrated on the first rung, the risk is concentrated on the fourth, and a workspace-wide rewrite would take all of it at once.

## Where ESLint sits

Oxlint reading a `.vue` file's script and not its template is the reason ESLint does not leave, and it is worth being precise about the consequence: whichever command invokes Oxlint, ESLint runs beside it over the templates, exactly as it does today.

That is also why this proposal leaves the rule migration where [configuration](/docs/proposals/refactors/vite-plus/configuration) leaves it: Vite+ changes who invokes the linter; it does not change what the linter can parse. Treating adoption as progress on that migration would retire ESLint rules that nothing has replaced, over templates that nothing is reading.

## Key files

| File                        | Role after the change                                                                                 |
| --------------------------- | ----------------------------------------------------------------------------------------------------- |
| `apps/web/nuxt.config.ts`   | the app build Nuxt keeps, outside `vp build`                                                          |
| `apps/web/vitest.config.ts` | the app's tests — Vitest invoked directly as a task, and `vp test` only once all three blockers clear |
| `apps/web/package.json`     | the scripts the adoption ladder moves one rung at a time                                              |

## Sources

- [Nuxt discussion 34857](https://github.com/nuxt/nuxt/discussions/34857) and [Vite+ issue 1506](https://github.com/voidzero-dev/vite-plus/issues/1506) — Vite+ against a Nuxt application, the support matrix this page reads, and the integration still open.
- [Vite+ test guide](https://viteplus.dev/guide/test) — the bundled Vitest and its `vite-plus/test` import path.
