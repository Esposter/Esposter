import type { CreatePackageOptions } from "#src/models/package/CreatePackageOptions";

import { PackageKind } from "#src/models/package/PackageKind";
import { ESLINT_CONFIG_SOURCE, PACKAGES_DIRECTORY, VITEST_CONFIG_SOURCE } from "#src/services/package/new/constants";
import { getEntryPath } from "#src/services/package/new/getEntryPath";
import { getEntrySource } from "#src/services/package/new/getEntrySource";
import { getManifest } from "#src/services/package/new/getManifest";
import { getPluginManifest } from "#src/services/package/new/getPluginManifest";
import { getReadme } from "#src/services/package/new/getReadme";
import { getTsconfig } from "#src/services/package/new/getTsconfig";
import { getTsdownSource } from "#src/services/package/new/getTsdownSource";
import { toJson } from "#src/services/package/new/toJson";

// Every file a new package is created with, keyed by its repository-relative path
export const getPackageFiles = (options: CreatePackageOptions, version: string): Map<string, string> => {
  const { kind, name } = options;
  const packageDirectory = `${PACKAGES_DIRECTORY}/${name}`;
  const files = new Map<string, string>([
    [`${packageDirectory}/${getEntryPath(options)}`, getEntrySource(options)],
    [`${packageDirectory}/eslint.config.js`, ESLINT_CONFIG_SOURCE],
    [`${packageDirectory}/package.json`, toJson(getManifest(options, version))],
    [`${packageDirectory}/README.md`, getReadme(options)],
    [`${packageDirectory}/tsconfig.json`, toJson(getTsconfig(kind))],
    [`${packageDirectory}/vitest.config.ts`, VITEST_CONFIG_SOURCE],
  ]);
  if (kind === PackageKind.Plugin)
    files.set(`${packageDirectory}/.claude-plugin/plugin.json`, toJson(getPluginManifest(options)));
  else files.set(`${packageDirectory}/tsdown.config.ts`, getTsdownSource(kind));
  return files;
};
