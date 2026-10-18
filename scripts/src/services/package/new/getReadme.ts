import type { CreatePackageOptions } from "#src/models/package/CreatePackageOptions";

import { PackageKind } from "#src/models/package/PackageKind";
import { SPECS_URL } from "#src/services/package/new/constants";
import { getPackageName } from "#src/services/package/new/getPackageName";

// The README skeleton readme-standards describes: badges and Getting Started only where the package is published or installed.
// A plugin is installed by Claude Code, not npm, so it has no install step
export const getReadme = (options: CreatePackageOptions): string => {
  const { description, kind } = options;
  const packageName = getPackageName(options);
  const isPublished = kind !== PackageKind.Plugin;
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
    `We highly recommend you take a look at the [documentation](${SPECS_URL}) to level up.`,
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
