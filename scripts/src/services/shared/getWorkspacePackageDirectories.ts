import { PACKAGE_JSON_FILENAME } from "#src/services/shared/constants";
import { parseWorkspacePackageGlobs, WORKSPACE_FILE } from "@esposter/configuration";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const GLOB_SUFFIX = "/*";

// Every member's directory, workspace-relative, in the order `pnpm-workspace.yaml` declares them. The list is
// Read from that file rather than repeated as a constant here, because a copy is a member the tooling silently
// Stops covering the day one is added outside the two product roots — which is exactly what `scripts` is. A
// `dir/*` entry expands to the children holding a manifest, sorted, since `readdirSync` order is the
// Filesystem's and this feeds a committed artifact; anything else is one member named outright.
export const getWorkspacePackageDirectories = (root: string): string[] =>
  parseWorkspacePackageGlobs(readFileSync(resolve(root, WORKSPACE_FILE), "utf8")).flatMap((glob) => {
    if (!glob.endsWith(GLOB_SUFFIX)) return [glob];

    const workspaceDirectory = glob.slice(0, -GLOB_SUFFIX.length);
    return readdirSync(resolve(root, workspaceDirectory), { withFileTypes: true })
      .filter(
        (entry) =>
          entry.isDirectory() && existsSync(resolve(root, workspaceDirectory, entry.name, PACKAGE_JSON_FILENAME)),
      )
      .map((entry) => `${workspaceDirectory}/${entry.name}`)
      .toSorted();
  });
