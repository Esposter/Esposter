import { APP_DIRECTORY } from "#src/services/shared/constants";
import { ESLINT_CONFIGURATION_GENERATOR, ESLINT_CONFIGURATION_PATH } from "#src/services/worktree/create/constants";
import { readPackageDirectory } from "#src/services/worktree/create/readPackageDirectory";
import { rewriteEslintConfigurationPaths } from "#src/services/worktree/create/rewriteEslintConfigurationPaths";
import { WORKTREE_REMOVE_COMMAND } from "#src/services/worktree/remove/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";

// Copies the main checkout's generated ESLint configuration into the worktree, where every package's config imports it
// From. The app's install writes it and a worktree skips that install, so the copy takes the main checkout's text with each
// Package import repointed, relative to the copy, to the directory the worktree's own install gives that package. It is
// Copied, never linked, since Nuxt would write through a link into the main checkout
export const copyEslintConfiguration = (mainCheckoutRoot: string, worktreePath: string): void => {
  const sourcePath = join(mainCheckoutRoot, ESLINT_CONFIGURATION_PATH);
  if (!existsSync(sourcePath))
    throw new InvalidOperationError(
      Operation.Create,
      worktreePath,
      `the main checkout has no ${ESLINT_CONFIGURATION_PATH}, which its app's install writes; ${WORKTREE_REMOVE_COMMAND} ${worktreePath} removes the worktree`,
    );
  const destinationPath = join(worktreePath, ESLINT_CONFIGURATION_PATH);
  const generatorPath = join(worktreePath, APP_DIRECTORY, "node_modules", ESLINT_CONFIGURATION_GENERATOR);
  const configuration = rewriteEslintConfigurationPaths(readFileSync(sourcePath, "utf8"), (packageName) => {
    const packageDirectory = readPackageDirectory(worktreePath, generatorPath, packageName);
    if (packageDirectory === undefined)
      throw new InvalidOperationError(
        Operation.Create,
        worktreePath,
        `the worktree cannot resolve ${packageName} from ${ESLINT_CONFIGURATION_GENERATOR}, which the main checkout's ESLint configuration imports; ${WORKTREE_REMOVE_COMMAND} ${worktreePath} removes the worktree`,
      );
    return relative(dirname(destinationPath), packageDirectory).replaceAll("\\", "/");
  });
  mkdirSync(dirname(destinationPath), { recursive: true });
  writeFileSync(destinationPath, configuration);
};
