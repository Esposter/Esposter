import { readMeshBounds } from "#src/services/genshinAssets/bounds/readMeshBounds";
import { TEST_FILENAME } from "#src/services/shared/fixtureConstants.test";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

describe(readMeshBounds, () => {
  let directory: string;

  beforeAll(async () => {
    directory = await mkdtemp(join(tmpdir(), "bounds-"));
  });

  afterAll(async () => {
    await rm(directory, { force: true, recursive: true });
  });

  test("a named mesh's bounds are read from its exported OBJ in metres", async () => {
    expect.hasAssertions();

    // AnimeStudio writes x negated, so the vertex at x -2 is read at x 2, the game's own axis
    const path = join(directory, `${TEST_FILENAME}.obj`);
    await writeFile(path, ["v 1 0 0", "v -2 2 0", "v 0 0 3", "f 1 2 3", ""].join("\n"));

    await expect(readMeshBounds(path)).resolves.toStrictEqual({ maximum: [2, 2, 3], minimum: [-1, 0, 0] });
  });
});
