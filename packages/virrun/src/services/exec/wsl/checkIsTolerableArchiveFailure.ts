// Classify a failed archive tar's stderr: true when every report is a per-entry skip tar recovers from and keeps
// Archiving past, so the archive it wrote is complete minus those entries and the caller can attribute them from its
// Members (createSourceMirrorArchive). Two entries qualify — a path tar couldn't open (a Windows-locked file) and one
// That vanished between the manifest walk and the spawn (a build/editor temp: the inherent TOCTOU of walking a live
// Working tree). False for anything else (a bad flag, a wedged bridge, a truncated write): nothing is safe to publish,
// So the plan must abort.
//
// Both tars are recognized (bsdtar `Couldn't open <path>:` and `Couldn't visit directory:`, GNU `<path>: Cannot open:`
// And `<path>: Cannot stat:`; the prefix is argv[0], so `tar` and `tar.exe` both appear) and their summary trailers
// Ignored. The reports' paths are deliberately not captured: bsdtar names no path at all on a vanished entry (`tar: :
// Couldn't visit directory: No such file or directory`), which is why attribution reads the archive rather than this.
// A stderr carrying no report at all (empty, trailer only) is not tolerable — nothing explains the failure.
const SKIPPED_ENTRY_LINE_REGEXES = [
  /^tar(?:\.exe)?: Couldn't open .+: .+$/u,
  /^tar(?:\.exe)?: .*: Couldn't visit directory: .+$/u,
  /^tar(?:\.exe)?: .*: Cannot open: .+$/u,
  /^tar(?:\.exe)?: .*: Cannot stat: .+$/u,
];
const TRAILER_LINE_REGEXES = [
  /^tar(?:\.exe)?: Error exit delayed from previous errors\.$/u,
  /^tar(?:\.exe)?: Exiting with failure status due to previous errors$/u,
];

export const checkIsTolerableArchiveFailure = (stderr: string): boolean => {
  const reportLines = stderr
    .split(/\r?\n/u)
    .filter(Boolean)
    .filter((line) => !TRAILER_LINE_REGEXES.some((regex) => regex.test(line)));
  if (reportLines.length === 0) return false;
  return reportLines.every((line) => SKIPPED_ENTRY_LINE_REGEXES.some((regex) => regex.test(line)));
};
