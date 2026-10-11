import type { PnpmDependency } from "#src/models/dependencyGraph/PnpmDependency";

// One workspace project as `pnpm ls --depth 0 --json` lists it, with its direct dependencies in each field
export interface PnpmProject {
  dependencies?: Record<string, PnpmDependency>;
  devDependencies?: Record<string, PnpmDependency>;
  name: string;
  optionalDependencies?: Record<string, PnpmDependency>;
}
