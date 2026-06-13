import { readdirSync } from "node:fs";
import { resolve } from "node:path";

export const getPackageJsonPaths = (root: string): string[] => [
  resolve(root, "package.json"),
  ...readdirSync(resolve(root, "packages"), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => resolve(root, "packages", entry.name, "package.json")),
];
