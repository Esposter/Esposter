import { spawnSync } from "@esposter/shared-node/child-process";
import { readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// Where a machine without Windows' compiler library gets its disassembler: `vkd3d-compiler` from Wine's vkd3d project,
// Named by VKD3D_COMPILER or found on PATH. Its source type is left to its own detection, which reads a shader model 6
// DXIL program as it does a DXBC one, where D3DDisassemble reads only the latter
const VKD3D_ARGUMENTS = ["-b", "d3d-asm"];
// A program's disassembly past this is a failure the run should stop on, not a program to skip
const VKD3D_MAX_BUFFER = 64 * 1024 ** 2;

export const disassembleWithVkd3d = (directory: string): number => {
  let count = 0;
  for (const name of readdirSync(directory)) {
    if (!name.endsWith(".dxbc")) continue;
    const { error, status, stdout } = spawnSync(
      process.env.VKD3D_COMPILER ?? "vkd3d-compiler",
      [...VKD3D_ARGUMENTS, join(directory, name)],
      { encoding: "utf8", maxBuffer: VKD3D_MAX_BUFFER },
    );
    // A missing compiler throws, since no program can then be read; a program it cannot read is skipped
    if (error) throw error;
    if (status !== 0) continue;
    writeFileSync(join(directory, name.replace(/\.dxbc$/u, ".asm")), stdout);
    count++;
  }
  return count;
};
