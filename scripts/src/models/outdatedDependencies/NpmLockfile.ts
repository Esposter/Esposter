// The slice of a `package-lock.json` the report reads: lockfile version 2 and up key every installed package by its
// Path under `node_modules`, so a direct dependency's resolution sits at `node_modules/<name>`.
export interface NpmLockfile {
  packages?: Record<string, { version?: string }>;
}
