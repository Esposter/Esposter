export const NPM_REGISTRY_URL = "https://registry.npmjs.org";

// The workspace roots every member sits under, per `pnpm-workspace.yaml`: `apps` is what the repo runs and
// `packages` is what it imports.
export const WORKSPACE_DIRECTORIES: string[] = ["apps", "packages"];

export const REGISTRY_FETCH_TIMEOUT_MS = 10000;
