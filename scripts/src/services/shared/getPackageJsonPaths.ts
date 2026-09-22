import { PACKAGE_JSON_FILENAME } from "#src/services/shared/constants";
import { getWorkspacePackageDirectories } from "#src/services/shared/getWorkspacePackageDirectories";
import { resolve } from "node:path";

export const getPackageJsonPaths = (root: string): string[] => [
  resolve(root, PACKAGE_JSON_FILENAME),
  ...getWorkspacePackageDirectories(root).map((packageDirectory) =>
    resolve(root, packageDirectory, PACKAGE_JSON_FILENAME),
  ),
];
