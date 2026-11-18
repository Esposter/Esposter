import { APP_PACKAGE_NAME } from "#src/services/shared/constants";
import { SCRIPTS_PACKAGE_NAME } from "#src/services/worktree/create/constants";

// The filter arguments an install selects by: the scripts package and the packages named, each with its closure, and the
// App itself. The app's install is selected for its dependencies, which the Nuxt ESLint configuration every package's
// Config loads imports from; its own lifecycle scripts are not run (`INSTALL_FROZEN_ARGUMENTS`), so no `nuxt prepare` does
export const readInstallFilters = (packageNames: string[]): string[] =>
  [...[SCRIPTS_PACKAGE_NAME, ...packageNames].map((name) => `${name}...`), APP_PACKAGE_NAME].flatMap((filter) => [
    "--filter",
    filter,
  ]);
