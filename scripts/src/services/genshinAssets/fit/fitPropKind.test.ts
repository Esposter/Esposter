import type { PropKind } from "#src/models/genshinAssets/props/PropKind";

import { PropShape } from "#src/models/genshinAssets/props/PropShape";
import { fitPropKind } from "#src/services/genshinAssets/fit/fitPropKind";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

describe(fitPropKind, () => {
  // A tetrahedron as an OBJ export: four vertices and the four faces between them
  const TETRAHEDRON_OBJ = [
    "v 0 0 0",
    "v 1 0 0",
    "v 0 1 0",
    "v 0 0 1",
    "f 1 2 3",
    "f 1 3 4",
    "f 1 4 2",
    "f 2 4 3",
    "",
  ].join("\n");
  let assets: string;
  let missingAssets: string;

  beforeAll(async () => {
    assets = await mkdtemp(join(tmpdir(), "props-"));
    await mkdir(join(assets, "Mesh"));
    await writeFile(join(assets, "Mesh", "b.obj"), TETRAHEDRON_OBJ);
    missingAssets = join(assets, "missing");
  });

  afterAll(async () => {
    await rm(assets, { force: true, recursive: true });
  });

  test("a kind whose export is missing is named and skipped", async () => {
    expect.hasAssertions();

    const kind: PropKind = { mesh: "b", name: "a", shape: PropShape.Hull };
    await expect(fitPropKind(kind, missingAssets)).resolves.toStrictEqual({
      notes: ["a: export b.obj is not on disk, skipped"],
      objects: {},
    });
  });

  test("a rerun over unchanged exports prints the same counts", async () => {
    expect.hasAssertions();

    const kind: PropKind = { mesh: "b", name: "a", shape: PropShape.Hull };
    const first = await fitPropKind(kind, assets);
    const second = await fitPropKind(kind, assets);
    expect(first.notes).toHaveLength(1);
    expect(second.notes).toStrictEqual(first.notes);
    expect(Object.keys(second.objects)).toStrictEqual(["props/a"]);
  });

  test("a round kind is fitted as a lathe", async () => {
    expect.hasAssertions();

    const kind: PropKind = { bandHeight: 1, mesh: "b", name: "a", shape: PropShape.Lathe, tolerance: 0.1 };
    await expect(fitPropKind(kind, assets)).resolves.toHaveProperty(["objects", "props/a", "shape"], PropShape.Lathe);
  });
});
