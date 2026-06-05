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

Use Blacksmith runners only for long-running CI jobs. The CI workflow historically took around 20 minutes sequentially, but not every job needs paid runners.

Use Blacksmith for:

- Package build gate.
- App build.
- Coverage/tests that need the app build output.

Use free `ubuntu-latest` for quick CI jobs:

- Documentation build.
- Lint.
- Format check.
- Typecheck.

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

CI should build workspace packages first, then fan out into independent downstream jobs:

```text
build-packages
  ├─ build documentation
  ├─ lint
  ├─ format
  ├─ typecheck
  └─ build app
       └─ coverage
```

The `build-packages` job uploads a `package-workspace.tar.gz` same-workflow artifact containing the package workspace after package builds. Downstream jobs check out the repository, download and extract that artifact at the repo root, then run app builds, documentation builds, typechecking, linting, or coverage with package source and compiled output in the expected `packages/<name>/...` layout.

Coverage depends on the app build because package app tests assert files under `packages/app/.output`. The app build job uploads `app-build.tar.gz`, and coverage extracts it before running.

Use artifacts for same-workflow package handoff rather than cache entries keyed by commit SHA.

---

## GitHub Action Versions

Workflow actions are pinned to full commit SHAs with a trailing version comment, for example:

```yaml
uses: actions/checkout@df4cb1c069e1874edd31b4311f1884172cec0e10 # v6.0.3
```

Before adding or updating a GitHub Action pin, list upstream release tags, choose the latest stable version tag, and resolve that tag to its commit SHA. Do not rely on memory, old examples, search snippets, or the version comment already in the workflow.

Use upstream project releases or tag refs as the source of truth. A typical verification command is:

```bash
git ls-remote --tags --sort='v:refname' https://github.com/actions/checkout.git 'v*'
```

If the selected version is an annotated tag, `git ls-remote` prints both `refs/tags/<version>` and `refs/tags/<version>^{}`. Pin the dereferenced `^{}` commit SHA, not the tag object SHA.

When artifact uploads use `archive: false`, use `actions/download-artifact` v8 or newer so direct/non-zipped artifacts are handled correctly.
