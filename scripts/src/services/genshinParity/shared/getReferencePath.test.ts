import type { readReferenceFiles as baseReadReferenceFiles } from "#src/services/genshinParity/reference/readReferenceFiles";

import { REFERENCE_MANIFEST_PATH } from "#src/services/genshinParity/shared/constants";
import { getReferencePath } from "#src/services/genshinParity/shared/getReferencePath";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { afterEach, describe, expect, test, vi } from "vitest";
import { join } from "node:path";

const { readReferenceFiles } = vi.hoisted(() => ({ readReferenceFiles: vi.fn<typeof baseReadReferenceFiles>() }));

vi.mock(import("#src/services/genshinParity/reference/readReferenceFiles"), () => ({ readReferenceFiles }));

describe(getReferencePath, () => {
  const ID = "a";
  const MISSING_PATH = join(REPOSITORY_ROOT, "missing", "a.webp");
  const REFERENCE = { screen: "", source: "a.mp4 at 0s" };

  afterEach(() => {
    vi.resetAllMocks();
  });

  test("names the id and the path to add when its committed file is missing", async () => {
    expect.hasAssertions();

    readReferenceFiles.mockResolvedValue([{ id: ID, path: MISSING_PATH, reference: REFERENCE }]);

    await expect(getReferencePath(ID)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: a, has no committed image at missing/a.webp: add its lossless WebP there, or pack it with genshin:parity references pack]`,
    );
  });

  test("returns the committed file's path when it is on disk", async () => {
    expect.hasAssertions();

    readReferenceFiles.mockResolvedValue([{ id: ID, path: REFERENCE_MANIFEST_PATH, reference: REFERENCE }]);

    expect(await getReferencePath(ID)).toBe(REFERENCE_MANIFEST_PATH);
  });
});
