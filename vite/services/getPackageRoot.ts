import { PACKAGES_DIRECTORY, ROOT_URL } from "#vite/services/constants";
import { fileURLToPath } from "node:url";

// A package's directory on disk, which a task reads the package's own files from
export const getPackageRoot = (directory: string): string =>
  fileURLToPath(new URL(`${PACKAGES_DIRECTORY}/${directory}`, ROOT_URL));
