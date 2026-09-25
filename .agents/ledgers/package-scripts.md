# Package Scripts

Every manifest's `scripts` block — named leaves aggregated with `run-s`, `scriptsComments`, the pnpm traps, and each script CI runs reachable from the root.

| Unit                                     | Swept | Notes |
| ---------------------------------------- | ----- | ----- |
| the root `package.json`                  | —     |       |
| `apps/web/package.json`                  | —     |       |
| `apps/functions`, `apps/infra` manifests | —     |       |
| `scripts/package.json`                   | —     |       |
| `packages/*` manifests                   | —     |       |
