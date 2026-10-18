import { disassembleDxbcDirectory } from "#src/services/genshinAssets/materials/disassembleDxbcDirectory";
import { chmod, mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

// Only off Windows is the vkd3d path taken, so its test is skipped where D3DDisassemble is the one that runs
describe.skipIf(process.platform === "win32")(disassembleDxbcDirectory, () => {
  let directory: string;
  beforeEach(async () => {
    directory = await mkdtemp(join(tmpdir(), "dxbc-"));
    // A stand-in compiler that prints assembly for the program named good and fails on any other
    const compiler = join(directory, "compiler.sh");
    await writeFile(compiler, '#!/bin/sh\ncase "$3" in *good*) echo ASM ;; *) exit 1 ;; esac\n');
    await chmod(compiler, 0o755);
    process.env.VKD3D_COMPILER = compiler;
    await writeFile(join(directory, "good.dxbc"), "");
    await writeFile(join(directory, "bad.dxbc"), "");
  });
  afterEach(async () => {
    delete process.env.VKD3D_COMPILER;
    await rm(directory, { force: true, recursive: true });
  });

  test("writes the assembly of each program the compiler reads and counts only those", async () => {
    expect.hasAssertions();

    expect(disassembleDxbcDirectory(directory)).toBe(1);
    await expect(readFile(join(directory, "good.asm"), "utf8")).resolves.toBe("ASM\n");
    expect((await readdir(directory)).filter((name) => name.endsWith(".asm"))).toStrictEqual(["good.asm"]);
  });
});
