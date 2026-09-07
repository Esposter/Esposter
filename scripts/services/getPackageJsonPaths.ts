import { WORKSPACE_DIRECTORIES } from "#scripts/services/constants";
import { readdirSync } from "node:fs";
import { resolve } from "node:path";

export const getPackageJsonPaths = (root: string): string[] => [
  resolve(root, "package.json"),
  ...WORKSPACE_DIRECTORIES.flatMap((workspaceDirectory) =>
    readdirSync(resolve(root, workspaceDirectory), { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => resolve(root, workspaceDirectory, entry.name, "package.json")),
  ),
];
