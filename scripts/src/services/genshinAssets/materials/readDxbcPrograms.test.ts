import { readDxbcPrograms } from "#src/services/genshinAssets/materials/readDxbcPrograms";
import { describe, expect, test } from "vitest";

describe(readDxbcPrograms, () => {
  const PROGRAM_SIZE = 40;
  const createProgram = (checksum: number): Buffer => {
    const program = Buffer.alloc(PROGRAM_SIZE);
    program.write("DXBC", "ascii");
    program[4] = checksum;
    program.writeUInt32LE(PROGRAM_SIZE, 24);
    return program;
  };

  test("finds each program by its magic and its stated size, keeping a repeated checksum once", () => {
    expect.hasAssertions();

    const first = createProgram(1);
    const second = createProgram(2);
    const data = Buffer.concat([Buffer.from("xx"), first, Buffer.from("y"), second, first]);

    expect(readDxbcPrograms(data)).toStrictEqual([first, second]);
  });

  test("skips a magic whose stated size runs past the data", () => {
    expect.hasAssertions();

    const truncated = createProgram(1).subarray(0, PROGRAM_SIZE - 1);

    expect(readDxbcPrograms(truncated)).toStrictEqual([]);
  });
});
