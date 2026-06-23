import { SourceType } from "@/models/source/SourceType";
import { loadFilesSource } from "@/services/source/loadFilesSource";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

describe(loadFilesSource, () => {
  test("materializes files (including nested paths) into a temp directory", async () => {
    expect.hasAssertions();

    const { cwd, dispose } = await loadFilesSource({
      files: { "a.txt": "", "nested/b.txt": " " },
      type: SourceType.Files,
    });

    await expect(readFile(join(cwd, "a.txt"), "utf8")).resolves.toBe("");
    await expect(readFile(join(cwd, "nested/b.txt"), "utf8")).resolves.toBe(" ");

    await dispose();
  });

  test("removes the temp directory on dispose", async () => {
    expect.hasAssertions();

    const { cwd, dispose } = await loadFilesSource({ files: { "a.txt": " " }, type: SourceType.Files });
    await dispose();

    expect(existsSync(cwd)).toBe(false);
  });
});
