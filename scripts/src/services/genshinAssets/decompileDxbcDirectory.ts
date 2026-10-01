import {
  DECOMPILER_ARCHIVE_SHA256,
  DECOMPILER_ARCHIVE_URL,
  DECOMPILER_BATCH_SIZE,
  DECOMPILER_DIRECTORY,
} from "#src/services/genshinAssets/constants";
import { FFMPEG_DOWNLOAD_TIMEOUT_MS } from "#src/services/genshinParity/constants";
import { resolvePinnedTool } from "#src/services/shared/resolvePinnedTool";
import { spawnSync } from "node:child_process";
import { readdir } from "node:fs/promises";

// Every DXBC program in a folder decompiled to HLSL beside it, `<name>.hlsl`, by 3Dmigoto's pinned command-line
// Decompiler, a batch of names a run from the folder itself, returning how many were written. A program the
// Decompiler cannot read is left to its assembly
export const decompileDxbcDirectory = async (directory: string): Promise<number> => {
  const decompilerPath = await resolvePinnedTool({
    archiveSha256: DECOMPILER_ARCHIVE_SHA256,
    archiveUrl: DECOMPILER_ARCHIVE_URL,
    directory: DECOMPILER_DIRECTORY,
    downloadTimeoutMs: FFMPEG_DOWNLOAD_TIMEOUT_MS,
    executablePattern: "cmd_Decompiler.exe",
  });
  const programs = (await readdir(directory)).filter((name) => name.endsWith(".dxbc"));
  for (let start = 0; start < programs.length; start += DECOMPILER_BATCH_SIZE)
    spawnSync(decompilerPath, ["-D", ...programs.slice(start, start + DECOMPILER_BATCH_SIZE)], {
      cwd: directory,
      encoding: "utf8",
      maxBuffer: 1024 ** 3,
    });
  return (await readdir(directory)).filter((name) => name.endsWith(".hlsl")).length;
};
