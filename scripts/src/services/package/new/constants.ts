import { LEDGER_DIRECTORY } from "#src/services/sweeps/constants";
import { DOCS_DIRECTORY } from "@esposter/configuration";

export const PACKAGES_DIRECTORY = "packages";
// Lowercase words joined by single hyphens: the name is a directory, an npm name and a docs slug at once
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this regex literal would otherwise infer
export const PACKAGE_NAME_REGEX: RegExp = /^[a-z]+(?:-[a-z\d]+)*$/u;
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this template literal would otherwise infer
export const DOCS_SECTION_DIRECTORY: string = `apps/web/content/${DOCS_DIRECTORY}`;
// The icon a new docs section takes until its author picks one. It is an icon name the UnoCSS preset resolves
export const DEFAULT_DOCS_ICON = "i-mdi:package-variant";
export const LERNA_FILE = "lerna.json";
export const AGENTS_FILE = "AGENTS.md";
export const README_FILE = "README.md";
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this template literal would otherwise infer
export const ROOT_DOCS_INDEX_FILE: string = `${DOCS_SECTION_DIRECTORY}/index.md`;
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this template literal would otherwise infer
export const QUALITY_LEDGER_FILE: string = `${LEDGER_DIRECTORY}/quality/packages.md`;
export const DOCS_CATEGORY_SECTIONS_FILE = "apps/web/app/services/docs/DocsCategorySectionsMap.ts";
export const DOCS_SECTION_ICON_FILE = "apps/web/app/services/docs/DocsSectionIconMap.ts";
export const APP_MODULES_FILE = "apps/web/configuration/modules.ts";
export const GITHUB_REPOSITORY_URL = "https://github.com/Esposter/Esposter";
// The docs site, which the generated README links for package documentation
export const DOCS_URL_PREFIX = "https://esposter.com/docs";
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
