/* oxlint-disable typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this regex literal
   would otherwise infer; the escape is the sequence's opener; `isolatedDeclarations` demands the annotation */
import type { Vector } from "#src/models/shared/Vector";

import { KIBIBYTE } from "@esposter/configuration/constants";
import { findRepositoryRoot } from "@esposter/shared-node/find-repository-root";
import { homedir } from "node:os";
import { join } from "node:path";

export const MAIN_BRANCH = "main";
// The queue every change lands on, and the branch `main` is the reviewed prefix of
export const QUEUE_BRANCH = "ai/queue";
// The remote every fleet ref and queue read names, which a fetch mirrors and a push lands on
export const REMOTE_NAME = "origin";
// The two branches as origin holds them, which a read names after a fetch
export const REMOTE_MAIN_REF: `${typeof REMOTE_NAME}/${typeof MAIN_BRANCH}` = `${REMOTE_NAME}/${MAIN_BRANCH}`;
export const REMOTE_QUEUE_REF: `${typeof REMOTE_NAME}/${typeof QUEUE_BRANCH}` = `${REMOTE_NAME}/${QUEUE_BRANCH}`;
// The app's package: a worktree installs its dependencies without the app, and its client bundle report attributes the
// App's own code to it
export const APP_PACKAGE_NAME = "@esposter/web";
export const NPM_REGISTRY_URL = "https://registry.npmjs.org";
// A mebibyte, as the fleet's transfer line and the parity pack table both count sizes in
export const MEBIBYTE: number = KIBIBYTE ** 2;
// What a spawned `git` or `gh` may print: a paginated slurp of a long-lived pull request's comments, a log of
// Every commit's body, a listing of every tracked file each run to megabytes, and the default buffer throws
// ENOBUFS rather than truncating — a failure that reads as the tool being broken from the call site.
export const MAX_BUFFER_BYTES: number = 256 * MEBIBYTE;
// How long a child a script waits on may run before it is killed and the call that spawned it throws, naming the
// Command. A formatter, a barrel generator or a git call answers in seconds, so one still running at this bound has
// Stalled: a script that waits on it forever gives no way to tell a hang from a slow check
export const CHILD_PROCESS_TIMEOUT_MS: number = Temporal.Duration.from({ minutes: 5 }).total("milliseconds");

// Every script reads and writes against the repository rather than against `scripts/`. A `..` chain is what this
// Was, and it is wrong the first time the file counting it moves a directory. The walk-up to the manifest survives
// That move.
export const REPOSITORY_ROOT: string = findRepositoryRoot(import.meta.dirname);
// Where `fit` writes the parameters it fits, as data of the world package's own, which its scenes read
export const WORLD_DATA_DIRECTORY: string = join(REPOSITORY_ROOT, "packages", "genshin-world", "src", "data");
// The folder under the data root that holds the parity tooling's data, which the parity and fleet defaults both derive
// From
export const PARITY_FOLDER_NAME = "genshin-parity";
// The repository's own formatter, run as its binary over each JSON file a script writes. Its configuration is the
// Root's, And its ignore rule passes a file under `generated/` through as it was written, so a writer's output there is
// Kept.
export const OXFMT_BINARY_RELATIVE_PATH: string = join("node_modules", "oxfmt", "bin", "oxfmt");
export const OXFMT_CONFIGURATION_FILE = "oxfmt.config.ts";
export const OXFMT_BINARY_PATH: string = join(REPOSITORY_ROOT, OXFMT_BINARY_RELATIVE_PATH);
export const OXFMT_CONFIGURATION_PATH: string = join(REPOSITORY_ROOT, OXFMT_CONFIGURATION_FILE);
// The formatter's answer for a file type it has no parser for. The pre-commit hook passes such a file by path, and the
// Formatter skips it there, so the scripts skip it too rather than keep a list of the extensions it formats
export const OXFMT_UNSUPPORTED_FILE_TYPE_MESSAGE = "Unsupported file type for stdin-filepath";
// The most characters of paths one formatter run takes on its command line. Windows refuses a command line past 32,767
// Characters without spawning it, so a changed set is formatted in runs of at most this, the rest of the line being the
// Binary, the configuration and the flags
export const OXFMT_ARGUMENTS_MAX_LENGTH: number = 24 * KIBIBYTE;
// Beside pnpm's own cache directories, under the install it is derived from: what the scripts keep between runs
export const CACHE_DIRECTORY: string = join(REPOSITORY_ROOT, "node_modules", ".cache", "@esposter", "scripts");
// The wiki answers this many titles in one imageinfo call, and this many file reads at once is as many as a run asks of
// Its file host
export const MAX_WIKI_TITLES_PER_QUERY = 50;
export const WIKI_FILE_CONCURRENCY = 8;
// How long any request a script makes may take (`fetchJson`) — the npm registry and the GitHub API alike
export const FETCH_TIMEOUT_MS: number = Temporal.Duration.from({ seconds: 10 }).total("milliseconds");
// The most of a JSON answer a script holds: a full npm packument runs to 16 MB for TypeScript alone, and a body past
// This Is refused rather than read on (`fetchJson`)
export const FETCH_JSON_MAX_BYTES: number = 128 * 1024 * 1024;
export const SECONDS_PER_MINUTE: number = Temporal.Duration.from({ minutes: 1 }).total("seconds");
export const MILLISECONDS_PER_MINUTE: number = SECONDS_PER_MINUTE * 1000;
// `pnpm`'s lockfile, at the repository root. Named here because three unrelated scripts address it — the lockfile
// Conflict resolver, the outdated report parses it, its benchmark reads it — and a literal repeated per consumer is one
// Rename away from a script that reads a file that no longer exists.
const LOCKFILE = "pnpm-lock.yaml";
// The empty tree, the same in every repository: a commit pointing at it carries its message alone, and as an attribute
// Source it reads no `.gitattributes`, so git writes and reads bytes as they are
export const EMPTY_TREE_SHA = "4b825dc642cb6eb9a060e54bf8d69288fbee4904";
// The manifest every member and the root carry, which is how a workspace glob's children are told from a plain
// Directory and how an npm-installed project is found beside its lockfile
export const PACKAGE_JSON_FILENAME = "package.json";
// The package a Nuxt module depends on at runtime, and which only a Nuxt module declares, so a dependency on it is what
// Makes a package one
export const NUXT_KIT_PACKAGE_NAME = "@nuxt/kit";
// `pnpm`'s `packageManager` pin is `<name>@<version>`, with an optional `+sha512.<hex>` suffix.
// Corepack verifies the download against that suffix, which is no part of the version the registry is asked about.
export const PACKAGE_MANAGER_REGEX: RegExp = /^(?<packageName>[^@]+)@(?<version>[^+]+)/u;
// A name of word characters and hyphens, so no dot, slash or space: a folder, file, skill, worker or clip name, each
// Read As one token of a path or a command rather than as a piece of one
export const WORD_AND_HYPHEN_NAME_REGEX: RegExp = /^[\w-]+$/u;

export const LOCKFILE_PATH: string = join(REPOSITORY_ROOT, LOCKFILE);
// Npm's lockfile, beside every manifest that is installed by `npm ci` rather than by the workspace — a Claude Code
// Plugin's root, and the runtime manifest its `voice` verb copies out. The outdated report finds those manifests
// By this file, since nothing else marks them.
export const NPM_LOCKFILE = "package-lock.json";
// Renovate's config, at the repository root. Its `packageRules` is the repo's one statement of which dependency
// Is held where and why (`dependency-updates` skill), which is why the outdated report reads it too.
export const RENOVATE_CONFIGURATION_FILE = "renovate.json";
// ASCII control characters as the record and field separators of a `git log` output a script splits — the
// The sweep ledgers' commit trailers — since a subject and a body are free text.
// Written as escapes because a tool rewriting the line would silently drop the characters themselves.
export const RECORD_SEPARATOR = "\u001E";

export const FIELD_SEPARATOR = "\u001F";
// An ANSI SGR sequence — the colours a check prints to a terminal — as an escape for the same reason. Stripped
// Wherever a script measures or quotes such output: the outdated report's column widths, a failed check's log
// Excerpt.
// The escape, which opens the sequence, is the one control character the regex matches
// oxlint-disable-next-line no-control-regex -- the sequence's opener; `isolatedDeclarations` demands the annotation
export const ANSI_ESCAPE_REGEX: RegExp = /\u001B\[[\d;]*m/gu;
// The opener of an ANSI SGR sequence, and the sequence returning the foreground to the terminal's default
export const ANSI_ESCAPE = "\u001B";

// oxlint-disable-next-line typescript/no-inferrable-types -- demands the annotation this value would otherwise infer
export const ANSI_FOREGROUND_RESET: string = `${ANSI_ESCAPE}[39m`;
// `pnpm run` names the executable it is in `npm_execpath` — the native binary, or the `pnpm.cjs` corepack ships
// That node runs — so a script spawns that file with its args and never a shell: the `pnpm` on a Windows PATH is
// A `.cmd` shim only a shell resolves, and an args array under `shell` is what Node deprecates (DEP0190). Bare
// `pnpm` only outside `pnpm run`, which no script in this package is invoked from.
const pnpmExecPath = process.env.npm_execpath ?? "pnpm";

const isPnpmScript = /\.[cm]?js$/u.test(pnpmExecPath);

export const PNPM_FILE: string = isPnpmScript ? process.execPath : pnpmExecPath;

export const PNPM_ARGS: readonly string[] = isPnpmScript ? [pnpmExecPath] : [];
export const BYTE = 255;
// The D65 white in CIE XYZ, its luminance 1, which sRGB's white is and CIELab is taken against
export const D65_WHITE: Vector = [0.950428545, 1, 1.088900371];
// A pinned tool's archive runs to a hundred-odd megabytes, so its download is bounded by minutes rather than seconds
export const PINNED_TOOL_DOWNLOAD_TIMEOUT_MS: number = Temporal.Duration.from({ minutes: 5 }).total("milliseconds");
// The most of a pinned tool's archive a download holds whole: an archive runs to a hundred-odd megabytes, so the bound
// Sits past it
export const PINNED_TOOL_MAX_BYTES: number = 256 * MEBIBYTE;
// MacOS's own sysctl, named by its path so a sysctl of the same name on the PATH is never run
export const SYSCTL_PATH = "/usr/sbin/sysctl";
// The web app's directory, against the repository root
export const APP_DIRECTORY = "apps/web";
// Claude Code's projects folder, which `CLAUDE_CONFIG_DIR` moves off `~/.claude` as Claude Code itself reads it
export const CLAUDE_PROJECTS_DIRECTORY: string = join(
  process.env.CLAUDE_CONFIG_DIR ?? join(homedir(), ".claude"),
  "projects",
);
