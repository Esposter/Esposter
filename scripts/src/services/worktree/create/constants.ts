/* oxlint-disable typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation each regex literal here would otherwise infer */
import { NODE_MODULES_FOLDER } from "#src/services/worktree/remove/constants";

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
// The package whose generator writes that configuration, and a direct dependency of the app: the configuration's imports
// Are its dependencies, so each resolves from its folder as the generator resolved it
export const ESLINT_CONFIGURATION_GENERATOR = "@nuxt/eslint";
// An import specifier's path up to the package it names: everything from the opening quote to the package's name after
// The last `node_modules` folder, scoped or not, whichever virtual store the path runs through. The path beneath the
// Package is left outside the match
export const PACKAGE_SPECIFIER_PATH_REGEX: RegExp =
  /(?<=["'])[^"']*\/node_modules\/(?<packageName>(?:@[^"'/]+\/)?[^"'/]+)/gu;
// A folder and a branch take the name, so it is kept to the lowercase characters a branch and a folder both allow
export const WORKTREE_NAME_REGEX: RegExp = /^[\da-z][\da-z-]*$/u;
// The task cache a checkout's `vp run` records into: the database naming each recorded run, and the output archives beside
// It. The `v23` folder is the cache format's version, which a vp that reads another format does not share
export const TASK_CACHE_PATH = `${NODE_MODULES_FOLDER}/.vite/task-cache/v23`;
export const TASK_CACHE_DATABASE_NAME = "cache.db";
export const TASK_CACHE_ARCHIVE_EXTENSION = ".tar.zst";
// The UUID a recorded run's stored value names its output archive by, which is the archive's name before its extension
export const TASK_CACHE_ARCHIVE_UUID_REGEX: RegExp = /[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}/gu;
