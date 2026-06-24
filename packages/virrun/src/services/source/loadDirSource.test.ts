import { SourceType } from "@/models/source/SourceType";
import { loadDirSource } from "@/services/source/loadDirSource";
import { describe, expect, test } from "vitest";

describe(loadDirSource, () => {
  test("returns the directory unchanged as the working directory", async () => {
    expect.hasAssertions();

    const { cwd } = await loadDirSource({ dir: "", type: SourceType.Dir });

    expect(cwd).toBe("");
  });

  test("disposes without error", async () => {
    expect.hasAssertions();

    const { dispose } = await loadDirSource({ dir: "", type: SourceType.Dir });

    await expect(dispose()).resolves.toBeUndefined();
  });
});
