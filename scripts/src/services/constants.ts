import { resolve } from "node:path";

export const NPM_REGISTRY_URL = "https://registry.npmjs.org";

// Every script reads and writes against the repository rather than against `scripts/`, and a `..` chain counted
// From each file's own depth is one short as soon as a file moves a directory deeper.
export const REPOSITORY_ROOT: string = resolve(import.meta.dirname, "..", "..", "..");

export const REGISTRY_FETCH_TIMEOUT_MS = 10000;
