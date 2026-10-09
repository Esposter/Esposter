// A root in any spelling is a folder whose scan reads the whole disk: the drive's folders, the users' folders and the
// Home folder by name, once Windows drive letters and backslashes are read as Git Bash's `/c/...` form
const ROOT_REGEX =
  /^(?:\/[a-z]?|\/(?:c\/)?Users(?:\/[^/]+)?|\/home(?:\/[^/]+)?|~|\$HOME|\$\{HOME\}|\$USERPROFILE|%USERPROFILE%)$/u;

const SCAN_COMMANDS: ReadonlySet<string> = new Set(["du", "find", "grep", "ls"]);

// A shell command passed as one argument (`bash -c "…"`) is read again on its own, to this depth at most
const MAX_NESTING_DEPTH = 3;

const SEGMENT_SEPARATOR_REGEX = /&&|\|\||[;|&\n()`]/u;
const SHELL_FLAG_REGEX = /^-[a-zA-Z]*c$|^eval$/u;
const TOKEN_REGEX = /"(?<double>[^"]*)"|'(?<single>[^']*)'|(?<bare>\S+)/gu;
const PATH_SEPARATOR_REGEX = /[/\\]/u;

// Backslashes become slashes, a drive letter becomes its `/c` folder, and a trailing slash goes, so "C:\", "/c/" and
// "C:/" all name "/c"
const normalizePath = (token: string) => {
  const slashed = token.replaceAll("\\", "/");
  const path = /^[A-Za-z]:/u.test(slashed) ? `/${slashed.charAt(0).toLowerCase()}${slashed.slice(2)}` : slashed;
  return path.replace(/(?<=.)\/+$/u, "");
};

const isRoot = (token: string) => ROOT_REGEX.test(normalizePath(token));

// A flag group holding r or R: `-R`, `-rn`, `-lR`, `--recursive`
const isRecursiveFlag = (token: string) => /^-[a-zA-Z]*[rR]/u.test(token) || token === "--recursive";

// The ls flag recurses on the capital R alone, since its lowercase r sorts in reverse
const isUpperRecursiveFlag = (token: string) => /^-[a-zA-Z]*R/u.test(token);

// A flag that gives grep its pattern, so every positional argument is a path
const isPatternFlag = (token: string) => /^-[a-zA-Z]*[ef]$/u.test(token) || token === "--regexp" || token === "--file";

// The scan's name when its arguments start it from a root, undefined when they do not
const getScanRefusal = (name: string, args: string[]): string | undefined => {
  if (name === "find" || name === "du") return args.some((arg) => isRoot(arg)) ? name : undefined;
  if (name === "ls")
    return args.some((arg) => isUpperRecursiveFlag(arg)) && args.some((arg) => isRoot(arg)) ? name : undefined;
  if (!args.some((arg) => isRecursiveFlag(arg))) return undefined;
  const positionals = args.filter((arg) => !arg.startsWith("-"));
  const paths = args.some((arg) => isPatternFlag(arg)) ? positionals : positionals.slice(1);
  return paths.some((path) => isRoot(path)) ? name : undefined;
};

// A quoted argument keeps its inner spaces, so a shell command passed as one argument is read again on its own
const tokenize = (segment: string) =>
  Array.from(
    segment.matchAll(TOKEN_REGEX),
    (match) => match.groups?.double ?? match.groups?.single ?? match.groups?.bare ?? "",
  );

const getCommandRefusal = (command: string, depth: number): string | undefined => {
  for (const segment of command.split(SEGMENT_SEPARATOR_REGEX)) {
    const tokens = tokenize(segment);
    for (const [index, token] of tokens.entries()) {
      const name = token.split(PATH_SEPARATOR_REGEX).pop() ?? "";
      const refusal = SCAN_COMMANDS.has(name) ? getScanRefusal(name, tokens.slice(index + 1)) : undefined;
      if (refusal !== undefined) return refusal;
      const previous = tokens[index - 1];
      if (depth < MAX_NESTING_DEPTH && previous !== undefined && SHELL_FLAG_REGEX.test(previous) && /\s/u.test(token)) {
        const nested = getCommandRefusal(token, depth + 1);
        if (nested !== undefined) return nested;
      }
    }
  }
  return undefined;
};

// The scan a Bash command runs from a root or a home folder, named by its command, undefined for every other command
export const getDiskScanRefusal = (command: string): string | undefined => getCommandRefusal(command, 0);

// The known homes the refusal names. The mod ships without @esposter/shared, so the product's name is spelled here
// As the folder it is on the person's disk
const KNOWN_HOME_LINES: string[] = [
  "- the repo, searched with `rg` or `git grep` (both skip node_modules);",
  // oxlint-disable-next-line naming/no-site-name-literal -- A path on the person's disk, which a package shipped without @esposter/shared cannot derive from SITE_NAME
  "- `~/Esposter/genshin-parity`, for game data and captures;",
  "- `~/.claude/genshin-persona`, for the voice;",
  "- a pinned tool (FFmpeg, yt-dlp) through `resolvePinnedTool`;",
  "- a package through `require.resolve` from the package that depends on it.",
];

export const getDenyReason = (scanName: string): string =>
  [
    `Refused: ${scanName} scans from a root or a home folder, which reads the whole disk for a file whose home is known, and costs minutes of CPU and disk for every agent running. Look where the file lives instead:`,
    ...KNOWN_HOME_LINES,
  ].join("\n");
