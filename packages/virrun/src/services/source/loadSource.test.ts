import { SourceType } from "@/models/source/SourceType";
import { TEST_FILENAME } from "@/services/exec/util/constants.test";
import { loadSource } from "@/services/source/loadSource";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

describe(loadSource, () => {
  test(`routes ${SourceType.Dir} to the directory loader`, async () => {
    expect.hasAssertions();

    const { cwd } = await loadSource({ dir: "", type: SourceType.Dir });

    expect(cwd).toBe("");
  });

  test(`routes ${SourceType.Files} to the files loader`, async () => {
    expect.hasAssertions();

    const { cwd, dispose } = await loadSource({ files: { [TEST_FILENAME]: " " }, type: SourceType.Files });

    await expect(readFile(join(cwd, TEST_FILENAME), "utf8")).resolves.toBe(" ");

    await dispose();
  });
});
