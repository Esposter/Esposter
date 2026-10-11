// One direct dependency as `pnpm ls --json` reports it — a sibling pnpm linked from the workspace has a `link:` version
export interface PnpmDependency {
  version: string;
}
