import { parseWorkspacePackageGlobs } from "#src/services/shared/parseWorkspacePackageGlobs";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const GLOB_SUFFIX = "/*";
const WORKSPACE_FILENAME = "pnpm-workspace.yaml";

// Every member's directory, workspace-relative, in the order `pnpm-workspace.yaml` declares them. The list is
// Read from that file rather than repeated as a constant here, because a copy is a member the tooling silently
// Stops covering the day one is added outside the two product roots — which is exactly what `scripts` is. A
// `dir/*` entry expands to the children holding a manifest, sorted, since `readdirSync` order is the
// Filesystem's and this feeds a committed artifact; anything else is one member named outright.
export const getWorkspacePackageDirectories = (root: string): string[] =>
  parseWorkspacePackageGlobs(readFileSync(resolve(root, WORKSPACE_FILENAME), "utf8")).flatMap((glob) => {
    if (!glob.endsWith(GLOB_SUFFIX)) return [glob];

    const workspaceDirectory = glob.slice(0, -GLOB_SUFFIX.length);
    return readdirSync(resolve(root, workspaceDirectory), { withFileTypes: true })
      .filter(
        (entry) => entry.isDirectory() && existsSync(resolve(root, workspaceDirectory, entry.name, "package.json")),
      )
      .map((entry) => `${workspaceDirectory}/${entry.name}`)
      .toSorted();
  });
