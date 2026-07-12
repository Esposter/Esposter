// Classify a failed archive tar's stderr: the copy paths tar couldn't open (Windows-locked files), or undefined when
// Any line reports something else (a vanished path, a bad flag) — the caller must surface those as real failures.
// Both tars are recognized (bsdtar `Couldn't open <path>:`, GNU `<path>: Cannot open:`; the prefix is argv[0], so
// `tar` and `tar.exe` both appear) and their summary trailers ignored. Paths arrive exactly as listed (relative to
// -C cwd), so they match manifest keys directly.
const UNREADABLE_LINE_REGEXES = [
  /^tar(?:\.exe)?: Couldn't open (?<path>.+): .+$/u,
  /^tar(?:\.exe)?: (?<path>.+): Cannot open: .+$/u,
];
const TRAILER_LINE_REGEXES = [
  /^tar(?:\.exe)?: Error exit delayed from previous errors\.$/u,
  /^tar(?:\.exe)?: Exiting with failure status due to previous errors$/u,
];

export const parseUnreadableArchivePaths = (stderr: string): string[] | undefined => {
  const unreadablePaths: string[] = [];
  for (const line of stderr.split(/\r?\n/u).filter(Boolean)) {
    if (TRAILER_LINE_REGEXES.some((regex) => regex.test(line))) continue;
    const path = UNREADABLE_LINE_REGEXES.map((regex) => regex.exec(line)?.groups?.path).find(
      (value) => value !== undefined,
    );
    if (path === undefined) return undefined;
    unreadablePaths.push(path);
  }
  return unreadablePaths.length === 0 ? undefined : unreadablePaths;
};
