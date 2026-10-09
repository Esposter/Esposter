// A root in any spelling is a folder whose scan reads the whole disk: the drive's folders, the users' folders and the
// Home folder by name, once Windows drive letters and backslashes are read as Git Bash's `/c/...` form
const ROOT_REGEX =
  /^(?:\/[a-z]?|\/(?:c\/)?Users(?:\/[^/]+)?|\/home(?:\/[^/]+)?|~|\$HOME|\$\{HOME\}|\$USERPROFILE|%USERPROFILE%)$/u;

const SCAN_COMMANDS: ReadonlySet<string> = new Set(["du", "find", "grep", "ls"]);

// A shell command passed as one argument (`bash -c "…"`) is read again on its own, to this depth at most
const MAX_NESTING_DEPTH = 3;

// A segment runs up to a separator outside quotes, so a quoted argument such as a `bash -c` command stays whole
const SEGMENT_REGEX = /(?:"[^"]*"|'[^']*'|[^\n"&'();`|])+/gu;
// A command substitution runs even inside double quotes, so its body is read again on its own
const SUBSTITUTION_REGEX = /\$\((?<dollar>[^()]*)\)|`(?<backtick>[^`]*)`/gu;
const SHELL_FLAG_REGEX = /^-[a-zA-Z]*c$|^eval$/u;
const TOKEN_REGEX = /"(?<double>[^"]*)"|'(?<single>[^']*)'|(?<bare>\S+)/gu;
const PATH_SEPARATOR_REGEX = /[/\\]/u;

// Backslashes become slashes, a drive letter becomes its `/c` folder, and a trailing glob and slash go, so "C:\", "/c/",
// "C:/" and "/c/*" all name "/c": a folder's glob expands to its entries, whose scan reads the whole folder
const normalizePath = (token: string) => {
  const slashed = token.replaceAll("\\", "/");
  const path = /^[A-Za-z]:/u.test(slashed) ? `/${slashed.charAt(0).toLowerCase()}${slashed.slice(2)}` : slashed;
  return path.replace(/(?<=\/)\*$/u, "").replace(/(?<=.)\/+$/u, "");
};

const isRoot = (token: string) => ROOT_REGEX.test(normalizePath(token));

// A flag group holding r or R: `-R`, `-rn`, `-lR`, `--recursive`
const isRecursiveFlag = (token: string) => /^-[a-zA-Z]*[rR]/u.test(token) || token === "--recursive";

// The ls flag recurses on the capital R alone, since its lowercase r sorts in reverse
const isUpperRecursiveFlag = (token: string) => /^-[a-zA-Z]*R/u.test(token);

// A flag that gives grep its pattern as the next argument, or as the rest of the same one
const SEPARATE_PATTERN_FLAG_REGEX = /^-[a-zA-Z]*[ef]$|^--(?:regexp|file)$/u;
const ATTACHED_PATTERN_FLAG_REGEX = /^-[a-zA-Z]*[ef].|^--(?:regexp|file)=/u;

// Grep's search paths: a pattern flag's operand is its pattern and never a path, and with no pattern flag the first
// Positional argument is the pattern
const getGrepPaths = (args: string[]): string[] => {
  const positionals: string[] = [];
  let hasPatternFlag = false;
  let isPatternOperand = false;
  for (const arg of args)
    if (isPatternOperand) isPatternOperand = false;
    else if (SEPARATE_PATTERN_FLAG_REGEX.test(arg)) {
      hasPatternFlag = true;
      isPatternOperand = true;
    } else if (ATTACHED_PATTERN_FLAG_REGEX.test(arg)) hasPatternFlag = true;
    else if (!arg.startsWith("-")) positionals.push(arg);
  return hasPatternFlag ? positionals : positionals.slice(1);
};

// The scan's name when its arguments start it from a root, undefined when they do not
const getScanRefusal = (name: string, args: string[]): string | undefined => {
  if (name === "find" || name === "du") return args.some((arg) => isRoot(arg)) ? name : undefined;
  if (name === "ls")
    return args.some((arg) => isUpperRecursiveFlag(arg)) && args.some((arg) => isRoot(arg)) ? name : undefined;
  if (!args.some((arg) => isRecursiveFlag(arg))) return undefined;
  return getGrepPaths(args).some((path) => isRoot(path)) ? name : undefined;
};

// A quoted argument keeps its inner spaces, so a shell command passed as one argument is read again on its own
const tokenize = (segment: string) =>
  Array.from(
    segment.matchAll(TOKEN_REGEX),
    (match) => match.groups?.double ?? match.groups?.single ?? match.groups?.bare ?? "",
  );

const getCommandRefusal = (command: string, depth: number): string | undefined => {
  if (depth < MAX_NESTING_DEPTH)
    for (const match of command.matchAll(SUBSTITUTION_REGEX)) {
      const nested = getCommandRefusal(match.groups?.dollar ?? match.groups?.backtick ?? "", depth + 1);
      if (nested !== undefined) return nested;
    }
  for (const segment of command.match(SEGMENT_REGEX) ?? []) {
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
