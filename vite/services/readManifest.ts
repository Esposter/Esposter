import type { PackageManifest } from "#vite/models/PackageManifest";

import { ROOT_URL } from "#vite/services/constants";
import { existsSync, readFileSync } from "node:fs";

export const readManifest = (relativeDirectory: string): PackageManifest | undefined => {
  const manifestUrl = new URL(`${relativeDirectory}/package.json`, ROOT_URL);
  // A folder with no manifest is no package: a deleted package's restored build output, or a checkout's leftovers
  // The root config cannot import `@esposter/shared`, whose `dist` is one of the builds this file orders.
  // oxlint-disable-next-line no-restricted-properties -- no manifest carries a Date to revive
  return existsSync(manifestUrl) ? JSON.parse(readFileSync(manifestUrl, "utf8")) : undefined;
};
