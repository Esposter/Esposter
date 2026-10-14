import { readContentAddressedObject } from "#src/services/cache/readContentAddressedObject";
import { existsSync } from "node:fs";
import { mkdtemp, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe(readContentAddressedObject, () => {
  // The SHA-256 of the empty string
  const hash = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
  let directory: string;

  beforeEach(async () => {
    directory = await mkdtemp(join(tmpdir(), "content-cache-"));
  });

  afterEach(async () => {
    await rm(directory, { force: true, recursive: true });
  });

  test("reads an object the cache holds without downloading it", async () => {
    expect.hasAssertions();

    const download = vi.fn<() => Promise<Uint8Array>>();
    await writeFile(join(directory, hash), "");

    await expect(readContentAddressedObject(hash, download, directory)).resolves.toStrictEqual(Buffer.from(""));
    expect(download).not.toHaveBeenCalled();
  });

  test("keeps a download that hashes to its name", async () => {
    expect.hasAssertions();

    await expect(
      readContentAddressedObject(hash, () => Promise.resolve(new Uint8Array()), directory),
    ).resolves.toStrictEqual(Buffer.from(""));
    await expect(readdir(directory)).resolves.toStrictEqual([hash]);
  });

  // A download is kept only as the object its name promises, or every later read would serve the wrong bytes
  test("refuses a download that does not hash to its name", async () => {
    expect.hasAssertions();

    await expect(
      readContentAddressedObject(hash, () => Promise.resolve(Buffer.from("0")), directory),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855, does not hash to its name]`,
    );
    expect(existsSync(join(directory, hash))).toBe(false);
  });

  // A name climbing out of the directory would read a file outside the cache, so it is refused before any read
  test("refuses a name that climbs out of the directory", async () => {
    expect.hasAssertions();

    const download = vi.fn<() => Promise<Uint8Array>>();

    await expect(readContentAddressedObject("../x", download, directory)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: ../x, is not a SHA-256 hex digest]`,
    );
    expect(download).not.toHaveBeenCalled();
  });
});
