import { LEDGER_DIRECTORY } from "#src/services/sweeps/constants";

export const PACKAGES_DIRECTORY = "packages";
// Lowercase words joined by single hyphens: the name is a directory and an npm name at once
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this regex literal would otherwise infer
export const PACKAGE_NAME_REGEX: RegExp = /^[a-z]+(?:-[a-z\d]+)*$/u;
export const LERNA_FILE = "lerna.json";
export const AGENTS_FILE = "AGENTS.md";
export const README_FILE = "README.md";
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this template literal would otherwise infer
export const QUALITY_LEDGER_FILE: string = `${LEDGER_DIRECTORY}/quality/packages.md`;
export const APP_MODULES_FILE = "apps/web/configuration/modules.ts";
export const GITHUB_REPOSITORY_URL = "https://github.com/Esposter/Esposter";
// The specs, which the generated README links for documentation until the package has a capability of its own
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this template literal would otherwise infer
export const SPECS_URL: string = `${GITHUB_REPOSITORY_URL}/tree/main/openspec/specs`;
export const NUXT_MODULE_ENTRY_PATH = "src/module.ts";
export const PLUGIN_SCOPE = "@esposter";
// The two configuration files every member carries are identical across kinds.
// The shared factories read each member's own manifest and directory, so the file never differs
export const VITEST_CONFIG_SOURCE = `import type { ViteUserConfig } from "vitest/config";

import { getVitestConfiguration } from "@esposter/configuration";

const vitestConfiguration: ViteUserConfig = getVitestConfiguration(import.meta.dirname);

export default vitestConfiguration;
`;
export const ESLINT_CONFIG_SOURCE = `export { default } from "@esposter/configuration/eslint/index.typescript.js";
`;
