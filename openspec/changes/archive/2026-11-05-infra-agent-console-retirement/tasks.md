## 1. Take it down

- [x] 1.1 With the removal on `main`, check the package is eligible and unpublish every version. Verify: `npm view agent-console-server` answers `404 Unpublished`.
- [x] 1.2 Leave the host executable on the releases that carry it, since an immutable release refuses an asset's deletion. Verify: `gh release delete-asset` on a release answers `Cannot delete asset from an immutable release`.

## 2. Close

- [x] 2.1 Archive this change as a one-time change, with its shipped-log line in the infra README. Verify: `pnpm exec openspec archive infra-agent-console-retirement --yes` succeeds and `pnpm -C scripts exec vitest run src/services/openspec` passes.
