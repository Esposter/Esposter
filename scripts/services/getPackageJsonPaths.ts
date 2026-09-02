import { PACKAGES_DIRECTORY } from "#scripts/services/constants";
import { readdirSync } from "node:fs";
import { resolve } from "node:path";

export const getPackageJsonPaths = (root: string): string[] => [
  resolve(root, "package.json"),
  ...readdirSync(resolve(root, PACKAGES_DIRECTORY), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => resolve(root, PACKAGES_DIRECTORY, entry.name, "package.json")),
];
