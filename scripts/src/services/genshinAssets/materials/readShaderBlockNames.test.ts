import { readShaderBlockNames } from "#src/services/genshinAssets/materials/readShaderBlockNames";
import { PROVENANCE_NAME } from "#src/services/provenance/constants";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

describe(readShaderBlockNames, () => {
  let directory: string;

  beforeEach(() => {
    directory = mkdtempSync(join(tmpdir(), "shader-blocks-"));
  });

  afterEach(() => {
    rmSync(directory, { force: true, recursive: true });
  });

  test("lists the shader blocks, not raw and not the provenance stamp the shaders step writes beside them", async () => {
    expect.hasAssertions();

    mkdirSync(join(directory, "raw"));
    mkdirSync(join(directory, "block"));
    writeFileSync(join(directory, PROVENANCE_NAME), "{}");

    await expect(readShaderBlockNames(directory)).resolves.toStrictEqual(["block"]);
  });

  test("lists no block for a shaders folder no step has created", async () => {
    expect.hasAssertions();

    await expect(readShaderBlockNames(join(directory, "shaders"))).resolves.toStrictEqual([]);
  });
});
