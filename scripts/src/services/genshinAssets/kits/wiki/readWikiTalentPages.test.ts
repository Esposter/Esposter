import { readWikiTalentPages } from "#src/services/genshinAssets/kits/wiki/readWikiTalentPages";
import { fetchOk } from "#src/services/shared/fetchOk";
import { existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, test, vi } from "vitest";

vi.mock(import("#src/services/shared/fetchOk"));

describe(readWikiTalentPages, () => {
  const cacheDirectory = join(tmpdir(), "read-wiki-talent-pages-test");

  afterEach(() => {
    rmSync(cacheDirectory, { force: true, recursive: true });
    vi.resetAllMocks();
  });

  test("refuses a wiki error answer rather than caching it", async () => {
    expect.hasAssertions();

    vi.mocked(fetchOk).mockResolvedValueOnce(Response.json({ error: { code: "a", info: "a" } }));

    await expect(readWikiTalentPages("a", cacheDirectory)).rejects.toThrowErrorMatchingInlineSnapshot(`
      [ZodError: [
        {
          "expected": "undefined",
          "code": "invalid_type",
          "path": [
            "error"
          ],
          "message": "Invalid input: expected undefined, received object"
        }
      ]]
    `);
    expect(existsSync(cacheDirectory)).toBe(false);
  });
});
