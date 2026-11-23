/* oxlint-disable typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation each regex literal here would otherwise infer */
import { NODE_MODULES_FOLDER } from "#src/services/worktree/remove/constants";

// The scripts package every worktree's `ai:` commands run from, so the packages it depends on are built whatever packages
// Are named
export const SCRIPTS_PACKAGE_NAME = "@esposter/scripts";
// The specifier prefix of a dependency on another workspace package, whose `dist` the dependent loads once it is built
export const WORKSPACE_PROTOCOL = "workspace:";
// One full install, lifecycle scripts included: it settles the state a frozen install would leave looking outdated, so no
// Later `pnpm` or `vp run` installs again inside a task and the task cache records only what the task wrote, and the app's
// `nuxt prepare` postinstall generates the worktree's own `.nuxt` tree
export const INSTALL_ARGUMENTS: readonly string[] = ["i", "--prefer-offline"];
// What git says when a fetch finds the ref it updates locked by another fetch of the same ref
export const LOCKED_REF_REGEX: RegExp = /cannot lock ref/u;
// A folder and a branch take the name, so it is kept to the lowercase characters a branch and a folder both allow
export const WORKTREE_NAME_REGEX: RegExp = /^[\da-z][\da-z-]*$/u;
// The task cache a checkout's `vp run` records into: the database naming each recorded run, and the output archives beside
// It. The `v23` folder is the cache format's version, which a vp that reads another format does not share
export const TASK_CACHE_PATH = `${NODE_MODULES_FOLDER}/.vite/task-cache/v23`;
export const TASK_CACHE_DATABASE_NAME = "cache.db";
export const TASK_CACHE_ARCHIVE_EXTENSION = ".tar.zst";
// The UUID a recorded run's stored value names its output archive by, which is the archive's name before its extension
export const TASK_CACHE_ARCHIVE_UUID_REGEX: RegExp = /[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}/gu;
