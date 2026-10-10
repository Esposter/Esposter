import { downloadGameDataObject } from "#scripts/gameData/mirror/downloadGameDataObject";
import { readMirroredGameDataObject } from "#scripts/gameData/mirror/readMirroredGameDataObject";
import { existsSync } from "node:fs";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

vi.mock(import("#scripts/gameData/mirror/downloadGameDataObject"), () => ({
  downloadGameDataObject: vi.fn<typeof downloadGameDataObject>(),
}));

describe(readMirroredGameDataObject, () => {
  const hash = "a".repeat(64);
  let mirrorDirectory: string;

  beforeEach(async () => {
    mirrorDirectory = await mkdtemp(join(tmpdir(), "game-data-mirror-"));
  });

  afterEach(async () => {
    vi.mocked(downloadGameDataObject).mockReset();
    await rm(mirrorDirectory, { force: true, recursive: true });
  });

  test("reads an object the mirror holds without downloading it", async () => {
    expect.hasAssertions();

    await writeFile(join(mirrorDirectory, `${hash}.json`), "{}");

    await expect(readMirroredGameDataObject(hash, mirrorDirectory)).resolves.toBe("{}");
    expect(downloadGameDataObject).not.toHaveBeenCalled();
  });

  // A download is kept only as the object its name promises, or every later read would serve the wrong record
  test("refuses a download that does not hash to its name", async () => {
    expect.hasAssertions();

    vi.mocked(downloadGameDataObject).mockResolvedValueOnce("{}");

    await expect(readMirroredGameDataObject(hash, mirrorDirectory)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa, does not hash to its name]`,
    );
    expect(existsSync(join(mirrorDirectory, `${hash}.json`))).toBe(false);
  });
});
