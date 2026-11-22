# Package Scripts

Every manifest's `scripts` block — named leaves aggregated by `dependsOn` or `vp run` chains, `"scriptsComments"`, the pnpm traps, and each script CI runs reachable from the root.

| Unit                                                 | Notes |
| ---------------------------------------------------- | ----- |
| the root `package.json`                              |       |
| `apps/web/package.json`                              |       |
| `apps/jobs`, `apps/realtime`, `apps/infra` manifests |       |
| `scripts/package.json`                               |       |
| `packages/*` manifests                               |       |
