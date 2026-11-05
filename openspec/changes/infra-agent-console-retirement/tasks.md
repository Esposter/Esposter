## 1. Take it down

- [ ] 1.1 With the removal on `main` and a release run without the package, check the package is still eligible, then unpublish every version on the owner's go. Verify: `npm view agent-console-server` answers not found.
- [ ] 1.2 Run the host's own uninstall command on the owner's machine, then delete the host executable from the releases that carry it on the owner's go. Verify: `gh release view` lists no host executable on any release.

## 2. Close

- [ ] 2.1 Archive this change as a one-time change, with its shipped-log line in the infra README. Verify: `pnpm exec openspec archive infra-agent-console-retirement --yes` succeeds and `pnpm -C scripts exec vitest run src/services/openspec` passes.
