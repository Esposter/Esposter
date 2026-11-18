import { PNPM_PACKAGE_PATH_REGEX } from "#src/services/worktree/create/constants";

// Repoints each pnpm package path in the generated ESLint configuration to the store folder the worktree's own install
// Gives that package, which `resolveFolder` names. The package's name and the path beneath it are kept, since only the
// Folder differs where a worktree's lockfile resolves a package's peers differently
export const rewriteEslintConfigurationPaths = (
  configuration: string,
  resolveFolder: (packageName: string) => string,
): string =>
  configuration.replaceAll(
    PNPM_PACKAGE_PATH_REGEX,
    (_path, packageName: string) => `node_modules/.pnpm/${resolveFolder(packageName)}/node_modules/${packageName}`,
  );
