import type { CreatePackageOptions } from "#src/models/package/CreatePackageOptions";

import { GITHUB_REPOSITORY_URL, PACKAGES_DIRECTORY } from "#src/services/package/new/constants";
import { SITE_NAME } from "@esposter/shared";

// The Claude Code plugin manifest. Its `userConfig` is empty.
// A plugin that asks its installer for a setting adds the setting here by hand, since the generator cannot know what it needs
export const getPluginManifest = ({ description, name }: CreatePackageOptions): Record<string, unknown> => ({
  $schema: "https://json.schemastore.org/claude-code-plugin-manifest.json",
  author: { name: SITE_NAME, url: "https://github.com/Esposter" },
  description,
  displayName: name
    .split("-")
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(" "),
  homepage: `${GITHUB_REPOSITORY_URL}/tree/main/${PACKAGES_DIRECTORY}/${name}`,
  keywords: ["claude-code", "claude-code-plugin"],
  license: "Apache-2.0",
  name,
  repository: GITHUB_REPOSITORY_URL,
});
