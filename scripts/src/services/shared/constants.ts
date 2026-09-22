import { KIBIBYTE, WORKSPACE_FILE } from "@esposter/configuration";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";

export const NPM_REGISTRY_URL = "https://registry.npmjs.org";

// What a spawned `git` or `gh` may print: a paginated slurp of a long-lived pull request's comments, a log of
// Every commit's body, a listing of every tracked file each run to megabytes, and the default buffer throws
// ENOBUFS rather than truncating — a failure that reads as the tool being broken from the call site.
export const MAX_BUFFER_BYTES: number = 256 * KIBIBYTE ** 2;

// Every script reads and writes against the repository rather than against `scripts/`. A `..` chain is what this
// Was, and it is wrong the first time the file counting it moves a directory — which it has done once already,
// One folder deeper, silently rooting every script at `scripts/`. The workspace manifest only ever sits at the
// Root, so walking up to it is an answer that survives the next move.
const findRepositoryRoot = (directory: string): string => {
  if (existsSync(join(directory, WORKSPACE_FILE))) return directory;
  const parent = dirname(directory);
  if (parent === directory)
    throw new InvalidOperationError(Operation.Read, "scripts", "no pnpm-workspace.yaml above this file");
  return findRepositoryRoot(parent);
};

export const REPOSITORY_ROOT: string = findRepositoryRoot(import.meta.dirname);

export const REGISTRY_FETCH_TIMEOUT_MS: number = Temporal.Duration.from({ seconds: 10 }).total("milliseconds");

// `pnpm`'s lockfile, at the repository root. Named here because three unrelated scripts address it — the collector
// Resolves its merge conflict, the outdated report parses it, its benchmark reads it — and a literal repeated per
// Consumer is one rename away from a script that reads a file that no longer exists.
export const LOCKFILE = "pnpm-lock.yaml";
// The manifest every member and the root carry, which is how a workspace glob's children are told from a plain
// Directory and how an npm-installed project is found beside its lockfile
export const PACKAGE_JSON_FILENAME = "package.json";

export const LOCKFILE_PATH: string = join(REPOSITORY_ROOT, LOCKFILE);

// Npm's lockfile, beside every manifest that is installed by `npm ci` rather than by the workspace — a Claude Code
// Plugin's root, and the runtime manifest its `voice` verb copies out. The outdated report finds those manifests
// By this file, since nothing else marks them.
export const NPM_LOCKFILE = "package-lock.json";

// The formatter's config, at the repository root. Its `ignorePatterns` is the repo's one list of generated files
// (`oxlint` skill, `references/lint-configuration.md`), which is why a scan that must skip them reads it too.
export const FORMATTER_CONFIGURATION_FILE = ".oxfmtrc.json";

// Renovate's config, at the repository root. Its `packageRules` is the repo's one statement of which dependency
// Is held where and why (`dependency-updates` skill), which is why the outdated report reads it too.
export const RENOVATE_CONFIGURATION_FILE = "renovate.json";

// ASCII control characters as the record and field separators of a `git log` output a script splits — the
// Collector's answered commits, the ledger coverage's trailers — since a subject and a body are free text.
// Written as escapes because a tool rewriting the line would silently drop the characters themselves.
export const RECORD_SEPARATOR = "\u001E";

export const FIELD_SEPARATOR = "\u001F";

// An ANSI SGR sequence — the colours a check prints to a terminal — as an escape for the same reason. Stripped
// Wherever a script measures or quotes such output: the outdated report's column widths, the collector's log
// Excerpt.
// oxlint-disable-next-line no-control-regex, typescript/no-inferrable-types -- the escape is the sequence's opener; `isolatedDeclarations` demands the annotation
export const ANSI_ESCAPE_REGEX: RegExp = /\u001B\[[\d;]*m/gu;

// `pnpm run` names the executable it is in `npm_execpath` — the native binary, or the `pnpm.cjs` corepack ships
// That node runs — so a script spawns that file with its args and never a shell: the `pnpm` on a Windows PATH is
// A `.cmd` shim only a shell resolves, and an args array under `shell` is what Node deprecates (DEP0190). Bare
// `pnpm` only outside `pnpm run`, which no script in this package is invoked from.
const pnpmExecPath = process.env.npm_execpath ?? "pnpm";

const isPnpmScript = /\.[cm]?js$/u.test(pnpmExecPath);

export const PNPM_FILE: string = isPnpmScript ? process.execPath : pnpmExecPath;

export const PNPM_ARGS: readonly string[] = isPnpmScript ? [pnpmExecPath] : [];
