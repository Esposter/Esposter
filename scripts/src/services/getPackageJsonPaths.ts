import { getWorkspacePackageDirectories } from "#src/services/getWorkspacePackageDirectories";
import { resolve } from "node:path";

export const getPackageJsonPaths = (root: string): string[] => [
  resolve(root, "package.json"),
  ...getWorkspacePackageDirectories(root).map((packageDirectory) => resolve(root, packageDirectory, "package.json")),
];
