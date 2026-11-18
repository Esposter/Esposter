/* oxlint-disable typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation each regex literal here would otherwise infer */
// The scripts package every worktree's `ai:` commands run from, so its closure is installed whatever packages are named
export const SCRIPTS_PACKAGE_NAME = "@esposter/scripts";
// The specifier prefix of a dependency on another workspace package, whose `dist` the dependent loads once it is built
export const WORKSPACE_PROTOCOL = "workspace:";
// The install keeps the lockfile as committed, and the offline one after it settles the state the frozen one leaves.
// Neither runs a lifecycle script: the app's postinstall is `nuxt prepare`, which would run before any package is built,
// So its generated ESLint configuration is copied in instead (`copyEslintConfiguration`)
export const INSTALL_FROZEN_ARGUMENTS: readonly string[] = [
  "i",
  "--frozen-lockfile",
  "--prefer-offline",
  "--ignore-scripts",
];
export const INSTALL_OFFLINE_ARGUMENTS: readonly string[] = ["i", "--offline", "--ignore-scripts"];
// What git says when a fetch finds the ref it updates locked by another fetch of the same ref
export const LOCKED_REF_REGEX: RegExp = /cannot lock ref/u;
// The generated ESLint configuration every package's config imports from `apps/web/.nuxt`. Only the app's install writes
// It, so `copyEslintConfiguration` copies the main checkout's into a worktree that skips that install
export const ESLINT_CONFIGURATION_PATH = "apps/web/.nuxt/eslint.config.mjs";
// A folder and a branch take the name, so it is kept to the lowercase characters a branch and a folder both allow
export const WORKTREE_NAME_REGEX: RegExp = /^[\da-z][\da-z-]*$/u;
