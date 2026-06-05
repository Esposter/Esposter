# Monorepo Tooling — Architecture

How workspace package scripts, dependency installs, publishing, and CI runners are organized.

---

## Package Management

Esposter uses **pnpm workspaces** as the package manager and workspace script runner. Workspace packages are declared in `pnpm-workspace.yaml`, and package versions are centralized in the root catalog.

Use the root `package.json` scripts as the canonical entry points for cross-package work. Package-local scripts should stay small and predictable (`build`, `lint`, `lint:fix`, `typecheck`, `test`, `coverage`, `export:gen`) so root recursive commands can compose them.

---

## Recursive Script Orchestration

Use pnpm recursive commands instead of Lerna Lite for running scripts across packages.

Common patterns:

```bash
pnpm -r run build
pnpm -r --parallel --aggregate-output run lint
pnpm -r --parallel --aggregate-output run typecheck
pnpm -r --parallel --aggregate-output --if-present run coverage
pnpm -r --filter "!@esposter/app" run build
pnpm --filter @esposter/app run build
```

Guidelines:

- Use `--parallel` for independent checks such as linting, typechecking, and tests.
- Use `--aggregate-output` in CI-style commands so package logs remain readable.
- Use filters instead of Lerna scopes/ignores.
- Keep `build:packages` separate from `build:app`; the app can depend on package build output.
- Use `--if-present` only for scripts that are optional across packages.

---

## Lerna Lite

Lerna Lite is retained for publishing only.

Keep:

```bash
lerna publish --yes
```

Do not use Lerna Lite for recursive script execution or watch orchestration. If a root script is not publishing, prefer pnpm workspace commands.

This means `@lerna-lite/cli` and `@lerna-lite/publish` remain in dev dependencies, while `@lerna-lite/run` and `@lerna-lite/watch` are unnecessary.

---

## Dependency Installs

Use plain `pnpm i` from the repo root when package manifests change.

Do not set `CI=true` locally to bypass pnpm prompts, and do not use `pnpm install --config.confirmModulesPurge=false` or other store override workarounds. Those approaches can create a local `.pnpm-store/` in the repository.

When only dependency versions change, follow the dependency update process and refresh the lockfile with:

```bash
pnpm refresh:lockfile
```

---

## CI Runner Strategy

Use Blacksmith runners only for the main CI workflow because it is the long-running path. The CI workflow historically took around 20 minutes sequentially, so it benefits from Blacksmith runners and parallel jobs.

Keep short workflows on free GitHub-hosted Ubuntu runners deliberately:

- Release notes / GitHub release workflow.
- Pulumi preview workflow.
- Azure Functions deployment workflows.

Those jobs are relatively quick, so moving them to Blacksmith adds cost without enough runtime savings.

---

## CI Caching

Prefer upstream GitHub actions for dependency caching:

- `actions/setup-node` with `cache: pnpm`
- `pnpm/action-setup`

On Blacksmith runners, upstream cache actions use Blacksmith's colocated cache automatically. Do not migrate to archived `useblacksmith/*` cache actions.

Use Sticky Disks only after measurement shows cache restore or install time is still a bottleneck. Sticky Disks are best suited for very large reusable disk state; they are not the default for this repo.

---

## CI Job Shape

CI should favor parallel jobs after checkout/setup/install:

- `build`
- `lint`
- `format`
- `typecheck`
- `coverage`

If compiled package output becomes necessary for downstream jobs, pass `packages/*/dist` through artifacts for same-workflow handoff rather than using cache entries keyed by commit SHA.
