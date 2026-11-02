import { downloadObjectTo } from "#src/services/genshinParity/reference/downloadObjectTo";
import { TEST_FILENAME } from "#src/services/shared/fixtureConstants.test";
import { mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe(downloadObjectTo, () => {
  // The SHA-256 of the empty string, which the download never reaches the check of
  const hash = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
  let directory: string;

  beforeEach(async () => {
    directory = await mkdtemp(join(tmpdir(), "download-object-to-"));
  });

  afterEach(async () => {
    vi.unstubAllGlobals();
    await rm(directory, { force: true, recursive: true });
  });

  // A body that fails after its first chunk has already opened the file the copy writes, so only a cleanup of that file
  // Leaves the folder as it was
  test("a download cut short leaves no part file", async () => {
    expect.hasAssertions();

    const body = new ReadableStream<Uint8Array>({
      pull(controller) {
        controller.error(new Error(" "));
      },
      start(controller) {
        controller.enqueue(Uint8Array.of(0));
      },
    });
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>(() => Promise.resolve(new Response(body))),
    );

    await expect(downloadObjectTo("", join(directory, TEST_FILENAME), hash)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[Error:  ]`,
    );
    await expect(readdir(directory)).resolves.toStrictEqual([]);
  });
});
