import { WSL_BWRAP_STATUS_BEGIN } from "@/services/exec/bwrap/constants";
// Streams a wsl-backend child's stderr to the host live under "inherit". The wsl bridge can't pipe bwrap's status
// Fd across `wsl.exe`, so it appends a status block (BEGIN…JSON…END) to stderr after exit; everything before BEGIN
// Is real child output to surface immediately, the rest must never reach the terminal. Given the full accumulated
// Stderr each chunk, it writes only the newly-safe prefix — holding back the last (markerLength - 1) bytes so a
// BEGIN marker split across two chunks is never half-printed, and stopping at the marker once it arrives.
export const createStderrLiveWriter = (): ((stderr: string) => void) => {
  let writtenIndex = 0;
  return (stderr) => {
    const beginIndex = stderr.indexOf(WSL_BWRAP_STATUS_BEGIN);
    const liveEnd =
      beginIndex === -1 ? Math.max(writtenIndex, stderr.length - (WSL_BWRAP_STATUS_BEGIN.length - 1)) : beginIndex;
    if (liveEnd <= writtenIndex) return;
    process.stderr.write(stderr.slice(writtenIndex, liveEnd));
    writtenIndex = liveEnd;
  };
};
