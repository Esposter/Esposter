import { DECOMPILER_BATCH_SIZE, DECOMPILER_PINNED_TOOL } from "#src/services/genshinAssets/shared/constants";
import { resolvePinnedTool } from "#src/services/shared/resolvePinnedTool";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { spawnSync } from "@esposter/shared-node/child-process";
import { readdir } from "node:fs/promises";

// Every DXBC program in a folder decompiled to HLSL beside it, `<name>.hlsl`, by 3Dmigoto's pinned command-line
// Decompiler, a batch of names a run from the folder itself, returning how many were written. A program the
// Decompiler cannot read is left to its assembly, but a Decompiler that cannot start throws. Off Windows, where the
// Decompiler is a Windows executable, the refusal comes before its archive is fetched
export const decompileDxbcDirectory = async (directory: string): Promise<number> => {
  if (process.platform !== "win32")
    throw new InvalidOperationError(Operation.Read, "HLSL", "needs 3Dmigoto's decompiler, which runs only on Windows");
  const decompilerPath = await resolvePinnedTool(DECOMPILER_PINNED_TOOL);
  const programs = (await readdir(directory)).filter((name) => name.endsWith(".dxbc"));
  for (let start = 0; start < programs.length; start += DECOMPILER_BATCH_SIZE) {
    const { error } = spawnSync(decompilerPath, ["-D", ...programs.slice(start, start + DECOMPILER_BATCH_SIZE)], {
      cwd: directory,
      encoding: "utf8",
      maxBuffer: 1024 ** 3,
    });
    if (error) throw error;
  }
  return (await readdir(directory)).filter((name) => name.endsWith(".hlsl")).length;
};
