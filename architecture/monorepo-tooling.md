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
- Keep `build:packages` separate from `build:app`; the app can depend on compiled package output.
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

Use Blacksmith runners only where they materially speed up the shared CI bottleneck. In the main CI workflow, that means the common package build gate only. Every downstream job consumes that shared output, so accelerating `build-packages` gives the best pipeline-wide return.

Keep all other jobs on free GitHub-hosted `ubuntu-latest` runners, even when they are not instant. This preserves the premium free-time allowance for the one job where Blacksmith matters most instead of spending it across routine downstream checks.

Use Blacksmith for:

- Package build gate.

Use free `ubuntu-latest` for quick CI jobs:

- App build.
- Coverage/tests.
- Documentation build.
- Lint.
- Format check.
- Typecheck.

Keep other workflows on free GitHub-hosted Ubuntu runners deliberately:

- Release notes / GitHub release workflow.
- Pulumi preview workflow.
- Azure Functions deployment workflows.

Those jobs do not benefit enough from Blacksmith to justify spending premium runner minutes.

---

## CI Caching

Prefer upstream GitHub actions for dependency caching:

- `actions/setup-node` with `cache: pnpm`
- `pnpm/action-setup`

On Blacksmith runners, upstream cache actions use Blacksmith's colocated cache automatically. Do not migrate to archived `useblacksmith/*` cache actions.

Use Sticky Disks only after measurement shows cache restore or install time is still a bottleneck. Sticky Disks are best suited for very large reusable disk state; they are not the default for this repo.

---

## CI Job Shape

CI should run independent checks as soon as their actual dependencies are available. Documentation, lint, coverage, typecheck, and app build need compiled package output.

```text
format
build-packages
  ├─ build documentation
  ├─ coverage
  ├─ lint
  ├─ typecheck
  └─ build app
```

The `build-packages` job uploads same-workflow artifacts for both compiled package output and generated package entrypoints:

- `package-builds`: `packages/*/dist`
- `package-entrypoints`: `packages/*/src/**/index.ts`

Downstream jobs check out the repository for source code, then download both artifacts into `packages` when they need package output. The entrypoint artifact is required because `build:packages` runs `export:gen`, but generated barrel files are not committed. TypeDoc uses `packageOptions.entryPoints: ["src/index.ts"]`, so docs will fail without the generated root barrels even when `dist` is present. Some package generators can also create nested `src/**/index.ts` barrels, so preserve all generated source index files instead of only root `src/index.ts`.

Coverage depends on `build-packages` because workspace package roots resolve through compiled `dist` entrypoints. Coverage does not depend on `build:app`; do not add placeholder bundle-size tests that force normal coverage to require `packages/app/.output`.

Use artifacts for same-workflow package handoff rather than cache entries keyed by commit SHA.

---

## CI Security

Set `persist-credentials: false` on every `actions/checkout` step. Checkout should not leave the GitHub token in `.git/config`, especially in workflows that upload artifacts or run dependency scripts.

Declare job permissions explicitly when a job needs the GitHub token:

- Read-only CI jobs should use the narrow scopes they need, such as `contents: read` for checkout and `actions: read` when downloading artifacts.
- Deployment jobs that authenticate with OIDC should include `id-token: write` and `contents: read`.
- Release jobs that create GitHub releases should use `contents: write`.
- PR-commenting infrastructure previews should keep only the permissions required for OIDC, repository reads, and PR comments.

---

## Local Verification

Run local formatting checks from the repo root with:

```bash
pnpm format:check
```

Run local lint fixing from `packages/app` with:

```bash
pnpm lint:fix
```

Do not run Vitest on Windows unless explicitly requested. This repo has known Windows startup failures around Vite/Rolldown config loading and UnoCSS/happy-dom paths. Prefer writing focused tests and leaving execution to CI or a supported environment.

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

Use the same command shape for every action, replacing `actions/checkout` with the action repository:

```bash
git ls-remote --tags --sort='v:refname' https://github.com/<owner>/<repo>.git 'v*'
```

Audit process:

1. Run the sorted `git ls-remote` command.
2. Ignore broad aliases such as `v6`, beta/RC/pre-release tags, and old Node compatibility tags unless there is a deliberate compatibility reason.
3. Pick the highest stable `vX.Y.Z` tag.
4. If the selected version is an annotated tag, `git ls-remote` prints both `refs/tags/<version>` and `refs/tags/<version>^{}`. Pin the dereferenced `^{}` commit SHA, not the tag object SHA.
5. Update the trailing version comment to match the selected tag.

Current audited pins:

| Action                        | Latest stable tag | Pinned SHA                                 |
| ----------------------------- | ----------------- | ------------------------------------------ |
| `actions/checkout`            | `v6.0.3`          | `df4cb1c069e1874edd31b4311f1884172cec0e10` |
| `actions/download-artifact`   | `v8.0.1`          | `3e5f45b2cfb9172054b4087a40e8e0b5a5461e7c` |
| `actions/setup-node`          | `v6.4.0`          | `48b55a011bda9f5d6aeb4c2d9c7362e8dae4041e` |
| `actions/upload-artifact`     | `v7.0.1`          | `043fb46d1a93c77aae656e7c1c64a875d1fc6a0a` |
| `azure/login`                 | `v3.0.0`          | `532459ea530d8321f2fb9bb10d1e0bcf23869a43` |
| `pnpm/action-setup`           | `v6.0.8`          | `0e279bb959325dab635dd2c09392533439d90093` |
| `pulumi/actions`              | `v7.0.0`          | `8e5e406f4007fca908480587cb9893c07090f58d` |
| `softprops/action-gh-release` | `v3.0.0`          | `b4309332981a82ec1c5618f44dd2e27cc8bfbfda` |

Use normal zipped artifacts unless there is a measured need for direct artifact uploads. If artifact uploads use `archive: false`, use `actions/download-artifact` v8 or newer so direct/non-zipped artifacts are handled correctly.
