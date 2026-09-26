# The App's Scripts

Read when running a script from `apps/web`, or reaching past `nuxt typecheck` or the root lint for the binary under it.

| Command             | Runs                      | When to use                                                        |
| ------------------- | ------------------------- | ------------------------------------------------------------------ |
| `pnpm lint`         | `TIMING=1 eslint .`       | CI/check-only lint verification                                    |
| `pnpm lint:fix`     | `TIMING=1 eslint --fix .` | ESLint only, this package only — never the last lint a change runs |
| `pnpm typecheck`    | `nuxt typecheck`          | TypeScript type checking — never `vue-tsc` directly, see below     |
| `pnpm test`         | `vitest` (watch mode)     | Run this package's tests in watch mode                             |
| `pnpm format`       | `oxfmt`                   | Format code                                                        |
| `pnpm format:check` | `oxfmt --check`           | Check formatting without writing                                   |
| `pnpm dev`          | `nuxt dev`                | Start dev server                                                   |
| `pnpm bench`        | `vitest bench --run`      | Run this package's benchmarks                                      |
| `pnpm build`        | `nuxt build`              | Build for production                                               |

**`nuxt typecheck` is the only typecheck, and `pnpm lint` from the repo root is the only lint.** Reaching past
either for the underlying binary — `vue-tsc -p tsconfig.json` in `apps/web`, `oxlint` over a path — checks
strictly less than CI does and reports success while CI fails: the app's real project is the generated
`.nuxt` tsconfig rather than the one in the package, and a package's `lint` is ESLint alone. Which rules only
the root pass carries, and when a targeted `oxlint` is still worth running, is the `oxlint` skill's.

**A root check is an aggregate over named leaves, never a `&&` chain.** `lint`, `lint:fix`, `lint:packages`,
`lint:fix:packages` and `typecheck` each run `run-s --continue-on-error` over one script per tool, so every
tool reports and the aggregate still exits non-zero — where `&&` stopped at the first, and every failure behind
it cost another full round of fix-and-rerun. `&&` is for a step that needs the one before it to have
_succeeded_, which is a build consuming what an earlier build produced; ordering alone is not that reason, and
`lint:fix` is ordered only because its three fixers write the same files. Across workspace projects the same
rule is `bail: false` in `pnpm-workspace.yaml`, with `build:packages` passing `--bail` back for exactly the
build case. How a backgrounded run's result is read at all, and why the completion notification's exit code is
never it, is the `running-checks` skill's; an output file that comes back empty is that run not yet flushed,
never a clean one.

> `oxfmt` formats markdown too — a table whose cells changed width is realigned by `pnpm format` (or `pnpm exec oxfmt <paths>`
> for a few files). No prettier binary is installed, so `pnpm exec prettier` fails — and `npx prettier` is not the
> fallback: `npx` is unsupported here, and rather than failing it would fetch an unpinned prettier from the registry.
