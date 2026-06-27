import { WSL_BWRAP_STATUS_BEGIN, WSL_BWRAP_STATUS_END } from "@/services/exec/bwrap/constants";

export const parseBwrapStderrStatus = (stderr: string): { status: string; stderr: string } => {
  const beginIndex = stderr.lastIndexOf(WSL_BWRAP_STATUS_BEGIN);
  const endIndex = stderr.lastIndexOf(WSL_BWRAP_STATUS_END);
  if (beginIndex === -1 || endIndex === -1 || endIndex < beginIndex) return { status: "", stderr };
  const statusStartIndex = beginIndex + WSL_BWRAP_STATUS_BEGIN.length;
  return {
    status: stderr.slice(statusStartIndex, endIndex),
    stderr: `${stderr.slice(0, beginIndex)}${stderr.slice(endIndex + WSL_BWRAP_STATUS_END.length)}`,
  };
};
