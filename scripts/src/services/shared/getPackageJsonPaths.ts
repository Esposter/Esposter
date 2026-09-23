import { PACKAGE_JSON_FILENAME } from "#src/services/shared/constants";
import { readWorkspacePackageDirectories } from "#src/services/shared/readWorkspacePackageDirectories";
import { resolve } from "node:path";

export const getPackageJsonPaths = (root: string): string[] => [
  resolve(root, PACKAGE_JSON_FILENAME),
  ...readWorkspacePackageDirectories(root).map((packageDirectory) =>
    resolve(root, packageDirectory, PACKAGE_JSON_FILENAME),
  ),
];
