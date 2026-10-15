import type { CreatePackageOptions } from "#src/models/package/CreatePackageOptions";

import { PackageKind } from "#src/models/package/PackageKind";
import { DOCS_SECTION_DIRECTORY, DOCS_URL_PREFIX, GITHUB_REPOSITORY_URL } from "#src/services/package/new/constants";
import { getPackageName } from "#src/services/package/new/getPackageName";

// The README skeleton readme-standards describes: badges and Getting Started only where the package is published or installed.
// The documentation link is the one its kind has. A plugin is installed by Claude Code, not npm, so it has no install step.
// It links its docs page instead of the general docs index
export const getReadme = (options: CreatePackageOptions): string => {
  const { description, kind, name } = options;
  const packageName = getPackageName(options);
  const isPublished = kind !== PackageKind.Plugin;
  const documentationUrl = isPublished
    ? `${DOCS_URL_PREFIX}/${name}`
    : `${GITHUB_REPOSITORY_URL}/blob/main/${DOCS_SECTION_DIRECTORY}/${name}/index.md`;
  const badges = isPublished
    ? [
        "[![Apache-2.0 licensed][badge-license]][url-license]",
        "[![NPM version][badge-npm-version]][url-npm]",
        "[![NPM downloads][badge-npm-downloads]][url-npm]",
        "[![NPM Unpacked Size (with version)][badge-npm-unpacked-size]][url-npm]",
      ]
    : ["[![Apache-2.0 licensed][badge-license]][url-license]"];
  const badgeReferences = isPublished
    ? [
        `[badge-npm-version]: https://img.shields.io/npm/v/${packageName}/latest?color=brightgreen`,
        `[url-npm]: https://www.npmjs.com/package/${packageName}/v/latest`,
        `[badge-npm-unpacked-size]: https://img.shields.io/npm/unpacked-size/${packageName}/latest?label=npm`,
        `[badge-npm-downloads]: https://img.shields.io/npm/dm/${packageName}.svg`,
      ]
    : [];
  const tableOfContents = [
    ...(isPublished ? ["- 🚀 [Getting Started](#getting-started)"] : []),
    "- 📖 [Documentation](#documentation)",
    "- ⚖️ [License](#license)",
  ];
  const gettingStarted = isPublished
    ? [`## <a name="getting-started">🚀 Getting Started</a>`, "", "```bash", `pnpm i ${packageName}`, "```", ""]
    : [];

  return [
    `# ${packageName}`,
    "",
    ...badges,
    "",
    description,
    "",
    "## Table of Contents",
    "",
    ...tableOfContents,
    "",
    "---",
    "",
    ...gettingStarted,
    `## <a name="documentation">📖 Documentation</a>`,
    "",
    `We highly recommend you take a look at the [documentation](${documentationUrl}) to level up.`,
    "",
    `## <a name="license">⚖️ License</a>`,
    "",
    "Licensed under [Apache-2.0][url-license].",
    "",
    "[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=blue",
    "[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE",
    ...badgeReferences,
    "",
  ].join("\n");
};
