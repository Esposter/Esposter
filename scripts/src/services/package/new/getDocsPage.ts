import type { CreatePackageOptions } from "#src/models/package/CreatePackageOptions";

import { PackageKind } from "#src/models/package/PackageKind";
import { PACKAGES_DIRECTORY } from "#src/services/package/new/constants";
import { getEntryPath } from "#src/services/package/new/getEntryPath";
import { getPackageName } from "#src/services/package/new/getPackageName";

// The section's index: the one page a new area has until its author writes the feature pages beside it.
// Its key files are the files the generator writes, so the docs check that every listed path exists holds from the first commit
export const getDocsPage = (options: CreatePackageOptions): string => {
  const { description, kind, name } = options;
  const packageDirectory = `${PACKAGES_DIRECTORY}/${name}`;
  const isPlugin = kind === PackageKind.Plugin;
  const keyFiles = [
    [`${packageDirectory}/package.json`, "The manifest: the package's name, its scripts and what it publishes."],
    ...(isPlugin
      ? [[`${packageDirectory}/.claude-plugin/plugin.json`, "The Claude Code plugin manifest its installer reads."]]
      : [[`${packageDirectory}/tsdown.config.ts`, "The build, composed from the shared tsdown factory."]]),
    [`${packageDirectory}/${getEntryPath(options)}`, "The source the package is built and exported from."],
  ];

  return [
    "---",
    `title: ${name}`,
    `description: ${JSON.stringify(description)}`,
    "---",
    "",
    `# ${name}`,
    "",
    `\`${packageDirectory}\` (npm \`${getPackageName(options)}\`) — ${description}`,
    "",
    "## Key files",
    "",
    "| File | Role |",
    "| --- | --- |",
    ...keyFiles.map(([path, role]) => `| \`${path}\` | ${role} |`),
    "",
  ].join("\n");
};
