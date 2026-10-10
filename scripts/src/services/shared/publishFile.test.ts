import { publishFile } from "#src/services/shared/publishFile";
import { getResultAsync } from "@esposter/shared";
import { mkdir, mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

describe(publishFile, () => {
  let directory: string;

  beforeAll(async () => {
    directory = await mkdtemp(join(tmpdir(), "publish-file-"));
  });

  afterAll(async () => {
    await rm(directory, { force: true, recursive: true });
  });

  test("two writers of one path leave it whole and no partial file beside it", async () => {
    expect.hasAssertions();

    const writerDirectory = join(directory, "writers");
    const path = join(writerDirectory, "index.json");
    const data = "{}".repeat(1024 ** 2);
    await Promise.all([publishFile(path, data), publishFile(path, data)]);

    await expect(readFile(path, "utf8")).resolves.toBe(data);
    await expect(readdir(writerDirectory)).resolves.toStrictEqual(["index.json"]);
  });

  test("a failed move removes its partial file", async () => {
    expect.hasAssertions();

    const failureDirectory = join(directory, "failure");
    const path = join(failureDirectory, "occupied");
    await mkdir(join(path, "child"), { recursive: true });

    // The move's error names the platform's own code and the partial file's random name, so only its failing is asserted
    const isPublished = await getResultAsync(() => publishFile(path, "{}")).match(
      () => true,
      () => false,
    );

    expect(isPublished).toBe(false);
    await expect(readdir(failureDirectory)).resolves.toStrictEqual(["occupied"]);
  });
});
