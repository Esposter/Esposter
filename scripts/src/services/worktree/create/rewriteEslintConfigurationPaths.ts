import { PACKAGE_SPECIFIER_PATH_REGEX } from "#src/services/worktree/create/constants";

// Repoints each package import in the generated ESLint configuration to the path `resolvePath` gives that package, which
// Is where the worktree's own install put it. The path beneath the package is kept, since only the way to the package
// Differs: the worktree sits deeper than the main checkout, and its lockfile may resolve a package's peers differently
export const rewriteEslintConfigurationPaths = (
  configuration: string,
  resolvePath: (packageName: string) => string,
): string =>
  configuration.replaceAll(PACKAGE_SPECIFIER_PATH_REGEX, (_path, packageName: string) => resolvePath(packageName));
