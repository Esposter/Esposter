import { InvalidOperationError, Operation } from "@esposter/shared";

// A pathspec with no `*` names a file or a directory's whole tree, and `.` the whole tree of the root. A `*` matches any
// Run of characters, `/` included, as git's default pathspec does, so `*.bench.ts` names every bench file under every
// Folder. The ledger index writes no other pattern, so one that uses it (a `:` magic prefix, `?`, `[`, a trailing `/`)
// Throws rather than matching what git would not
const getPathspecMatcher = (pathspec: string): ((file: string) => boolean) => {
  if (/^:|[?[\]]|\/$/u.test(pathspec))
    throw new InvalidOperationError(
      Operation.Read,
      `pathspec ${pathspec}`,
      "uses a pattern getPathspecFiles does not match",
    );
  if (pathspec === ".") return () => true;
  if (!pathspec.includes("*")) {
    const directory = `${pathspec}/`;
    return (file) => file === pathspec || file.startsWith(directory);
  }

  const pattern = new RegExp(
    `^${pathspec
      .split("*")
      .map((part) => RegExp.escape(part))
      .join(".*")}$`,
    "u",
  );
  return (file) => pattern.test(file);
};

// The files a list of git pathspecs names, as `git ls-files -- <pathspecs>` lists them, in the order of `files`. Matching
// Them in memory lets a run list the tracked files once, where each pathspec list cost a spawn of its own
export const getPathspecFiles = (files: readonly string[], pathspecs: readonly string[]): string[] => {
  const matchers = pathspecs.map((pathspec) => getPathspecMatcher(pathspec));
  return files.filter((file) => matchers.some((matches) => matches(file)));
};
