/* eslint-disable perfectionist/sort-objects -- a package's export conditions are matched in the order written, so `source` must precede `default` */
import type { CreatePackageOptions } from "#src/models/package/CreatePackageOptions";

import { PackageKind } from "#src/models/package/PackageKind";
import { GITHUB_REPOSITORY_URL, PACKAGES_DIRECTORY } from "#src/services/package/new/constants";
import { getEntryPath } from "#src/services/package/new/getEntryPath";
import { getPackageName } from "#src/services/package/new/getPackageName";

// The manifest a package is created with. Its version is lerna's one version, so `lernaPackages` holds it from the first commit.
// Its `sideEffects` is the boolean a bundler acts on, which `sideEffects` holds every package to
export const getManifest = (options: CreatePackageOptions, version: string): Record<string, unknown> => {
  const { description, kind, name } = options;
  const packageName = getPackageName(options);
  const manifest = {
    author: "Jimmy Chen",
    bugs: { url: `${GITHUB_REPOSITORY_URL}/issues` },
    description,
    homepage: `${GITHUB_REPOSITORY_URL}/blob/main/${PACKAGES_DIRECTORY}/${name}#readme`,
    imports: { "#src/*": "./src/*.ts" },
    license: "Apache-2.0",
    name: packageName,
    repository: { type: "git", url: `git+${GITHUB_REPOSITORY_URL}.git` },
    type: "module",
    version,
  };
  if (kind === PackageKind.Plugin)
    return {
      ...manifest,
      private: true,
      scripts: {
        format: "oxfmt",
        "format:check": "oxfmt --check",
        lint: "eslint .",
        "lint:fix": "eslint --fix .",
        test: "vitest",
        typecheck: "tsc",
      },
    };

  const isNuxtModule = kind === PackageKind.NuxtModule;
  return {
    ...manifest,
    exports: {
      ".": { source: `./${getEntryPath(options)}`, default: "./dist/index.js" },
      "./package.json": "./package.json",
    },
    files: ["dist"],
    keywords: ["typescript"],
    publishConfig: { access: "public", exports: { ".": "./dist/index.js", "./package.json": "./package.json" } },
    scripts: {
      build: "tsdown",
      format: "oxfmt",
      "format:check": "oxfmt --check",
      lint: "eslint .",
      "lint:fix": "eslint --fix .",
      test: "vitest",
      typecheck: "tsc",
    },
    sideEffects: false,
    types: "dist/index.d.ts",
    ...(isNuxtModule ? { dependencies: { "@nuxt/kit": "catalog:" }, peerDependencies: { nuxt: "catalog:" } } : {}),
    devDependencies: {
      "@arethetypeswrong/core": "catalog:",
      "@esposter/configuration": "workspace:*",
      publint: "catalog:",
      tsdown: "catalog:",
      vitest: "catalog:",
    },
  };
};
