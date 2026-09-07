import { basename, dirname } from "node:path";

// Vitest names a project after the nearest manifest's `name` when its own config declares none, which would make
// The names a set of package identities (`@esposter/db`, `azure-mock`) that no pattern over the tree can select.
// `--project` matches on that name and its `*` compiles to `.*`, crossing a `/` like any other character — so a
// Project named after its own workspace-relative directory is addressed exactly as `--filter "./packages/*"`
// Addresses the same set.
export const getVitestProjectName = (projectDirectory: string): string =>
  `${basename(dirname(projectDirectory))}/${basename(projectDirectory)}`;
