import { WSL_BWRAP_STATUS_BEGIN } from "@/services/exec/bwrap/constants";
// Streams a wsl-backend child's stderr to the host live under "inherit", instead of buffering it until close.
// The wsl bridge can't pipe bwrap's status fd across `wsl.exe`, so it appends the status block
// (BEGIN…JSON…END) to the end of stderr after the command exits — everything before the BEGIN marker is real
// Child output (e.g. multi-minute `pnpm install` progress) that must surface immediately, and the marker plus
// Everything after it is the parsed-out status that must never reach the terminal. Called with the full
// Accumulated stderr each chunk, it writes only the newly-safe prefix: it holds back the last
// (markerLength - 1) bytes so a BEGIN marker split across two chunks is never half-printed, and once the
// Marker arrives it stops at its index, leaving the status block unwritten.
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
