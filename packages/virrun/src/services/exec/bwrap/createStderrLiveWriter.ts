import { WSL_BWRAP_STATUS_BEGIN } from "@/services/exec/bwrap/constants";
// Streams a wsl-backend child's stderr to the host live under "inherit". The wsl bridge can't pipe bwrap's status
// Fd across `wsl.exe`, so it appends a status block (BEGIN…JSON…END) to stderr after exit; everything before BEGIN
// Is real child output to surface immediately, the rest must never reach the terminal. Given the full accumulated
// Stderr each chunk, it flushes only COMPLETE lines — mid-stream (marker absent) it writes up to the last newline
// Within the safe region (the buffer minus a `markerLength - 1` tail holdback, so a BEGIN marker split across two
// Chunks is never half-printed — the marker itself begins with a newline), holding the partial trailing line back.
// A line is thus never torn mid-word: the child's stdout is inherited directly and interleaves at the OS level, so
// Line-atomic stderr is what keeps the two readable (the earlier byte-boundary flush split lines like
// `Invalid con` + `fig provided`). On the terminal chunk the marker has arrived and everything before it — the
// Marker's own leading newline bounds the last real line — is flushed, including any final partial line.
export const createStderrLiveWriter = (): ((stderr: string) => void) => {
  let writtenIndex = 0;
  return (stderr) => {
    const beginIndex = stderr.indexOf(WSL_BWRAP_STATUS_BEGIN);
    let liveEnd;
    if (beginIndex === -1) {
      const safeEnd = stderr.length - (WSL_BWRAP_STATUS_BEGIN.length - 1);
      const lastNewlineIndex = stderr.lastIndexOf("\n", safeEnd - 1);
      liveEnd = lastNewlineIndex < writtenIndex ? writtenIndex : lastNewlineIndex + 1;
    } else {
      liveEnd = beginIndex;
    }
    if (liveEnd <= writtenIndex) return;
    process.stderr.write(stderr.slice(writtenIndex, liveEnd));
    writtenIndex = liveEnd;
  };
};
