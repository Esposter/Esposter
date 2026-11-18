import { ESLINT_CONFIGURATION_PATH } from "#src/services/worktree/create/constants";
import { WORKTREE_REMOVE_COMMAND } from "#src/services/worktree/remove/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

// Copies the main checkout's generated ESLint configuration into the worktree, where every package's config imports it
// From. The app's install writes it and a worktree skips that install, so the copy is the one the main checkout holds:
// Its imports are relative, into the `node_modules/.pnpm` that `readInstallFilters` has linked. It is copied, never linked,
// Since Nuxt would write through a link into the main checkout
export const copyEslintConfiguration = (mainCheckoutRoot: string, worktreePath: string): void => {
  const sourcePath = join(mainCheckoutRoot, ESLINT_CONFIGURATION_PATH);
  if (!existsSync(sourcePath))
    throw new InvalidOperationError(
      Operation.Create,
      worktreePath,
      `the main checkout has no ${ESLINT_CONFIGURATION_PATH}, which its app's install writes; ${WORKTREE_REMOVE_COMMAND} ${worktreePath} removes the worktree`,
    );
  const destinationPath = join(worktreePath, ESLINT_CONFIGURATION_PATH);
  mkdirSync(dirname(destinationPath), { recursive: true });
  copyFileSync(sourcePath, destinationPath);
};
