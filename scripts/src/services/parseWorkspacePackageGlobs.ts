// The `packages:` block alone. `pnpm-workspace.yaml` carries several sections this repo reads for different
// Reasons — the catalog, the build allowlist — and each is sliced by whatever needs it rather than by a parser
// That would make the whole file one shape.
const WORKSPACE_PACKAGES_SECTION_REGEX = /^packages:\n(?<entries>(?:[ ]+- .+\n)+)/mu;
const WORKSPACE_PACKAGE_ENTRY_REGEX = /^[ ]+- ['"]?(?<glob>[^'"\n]+?)['"]?$/gmu;

export const parseWorkspacePackageGlobs = (workspaceYaml: string): string[] => {
  const entries = WORKSPACE_PACKAGES_SECTION_REGEX.exec(workspaceYaml)?.groups?.entries;
  if (entries === undefined) return [];

  return Array.from(entries.matchAll(WORKSPACE_PACKAGE_ENTRY_REGEX), (match) => String(match.groups?.glob));
};
