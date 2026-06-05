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
- Forward script arguments with one separator after `run <script>`, for example `run test -- --run -u`.

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

## CI Job Shape

CI runs independent checks as soon as their actual dependencies are available. Documentation, lint, coverage, typecheck, and app build need compiled package output.

```text
format
build-packages
  ├─ build documentation
  ├─ coverage
  ├─ lint
  ├─ typecheck
  └─ build app
```

`build-packages` uploads two same-workflow artifacts:

- `package-builds`: `packages/*/dist`
- `package-entrypoints`: `packages/*/src/**/index.ts`

Downstream jobs download both into `packages`. The entrypoint artifact is required because `build:packages` runs `export:gen` and generated barrel files are not committed — TypeDoc will fail without them even when `dist` is present. Preserve all generated source index files, not just root `src/index.ts`, since some generators create nested barrels.

---

## CI Security

Set `persist-credentials: false` on every `actions/checkout` step.

Declare job permissions explicitly and narrowly:

- Read-only jobs: `contents: read`, add `actions: read` when downloading artifacts.
- OIDC deployment jobs: `id-token: write`, `contents: read`.
- Release jobs: `contents: write`.
- PR-commenting previews: minimum scopes for OIDC, repo reads, and PR comments.

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

Pin actions to full commit SHAs with a trailing version comment:

```yaml
uses: actions/checkout@df4cb1c069e1874edd31b4311f1884172cec0e10 # v6.0.3
```

To resolve the SHA for a pin, look up the latest stable `vX.Y.Z` tag via:

```bash
git ls-remote --tags --sort='v:refname' https://github.com/<owner>/<repo>.git 'v*'
```

Ignore broad aliases (`v6`) and pre-release tags. For annotated tags `git ls-remote` prints both `refs/tags/<version>` and `refs/tags/<version>^{}`— pin the `^{}` (dereferenced) SHA.

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
