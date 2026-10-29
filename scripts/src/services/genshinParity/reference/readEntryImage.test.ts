import { packScratchImage } from "#src/services/genshinParity/reference/packScratchImage";
import { readEntryImage } from "#src/services/genshinParity/reference/readEntryImage";
import { copyFileSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

describe(readEntryImage, () => {
  const RED = 255;
  const BLUE = 0;
  let directory: string;
  let scratchPath: string;
  let committedPath: string;

  // A two-pixel PNG of one colour, written under the folder and packed the way a scratch copy is
  const packedOf = async (name: string, colour: { b: number; r: number }) => {
    const path = join(directory, `${name}.png`);
    writeFileSync(
      path,
      await sharp({ create: { background: { ...colour, g: 0 }, channels: 3, height: 2, width: 2 } })
        .png()
        .toBuffer(),
    );
    return packScratchImage(path);
  };
  const red = () => packedOf("red", { b: BLUE, r: RED });
  const blue = () => packedOf("blue", { b: RED, r: BLUE });
  // Copies a colour's screenshot to the scratch path, as a run's screenshot lands beside its entry
  const toScratch = (name: string) => copyFileSync(join(directory, `${name}.png`), scratchPath);

  beforeEach(() => {
    directory = mkdtempSync(join(tmpdir(), "parity-entry-"));
    scratchPath = join(directory, "scratch.png");
    committedPath = join(directory, "committed.webp");
  });

  afterEach(() => {
    rmSync(directory, { force: true, recursive: true });
  });

  test("takes the committed file as the held image when no scratch copy is beside it and its bytes hash to the held hash", async () => {
    expect.hasAssertions();

    const held = await red();
    writeFileSync(committedPath, held.data);

    const entry = await readEntryImage(scratchPath, held.image, committedPath);

    expect(entry?.isNew).toBe(false);
    expect(entry?.collision).toBeUndefined();
    expect(entry?.image).toStrictEqual(held.image);
    expect(await entry?.read()).toStrictEqual(held.data);
  });

  test("names a committed file holding other bytes than the held hash as a collision when no scratch copy is beside it", async () => {
    expect.hasAssertions();

    const held = await red();
    const other = await blue();
    writeFileSync(committedPath, other.data);

    const entry = await readEntryImage(scratchPath, held.image, committedPath);

    expect(entry?.collision).toStrictEqual({ committed: other.image.sha256, ours: held.image.sha256 });
  });

  test("writes nothing for a scratch copy whose bytes are already committed under the held hash", async () => {
    expect.hasAssertions();

    const held = await red();
    toScratch("red");
    writeFileSync(committedPath, held.data);

    const entry = await readEntryImage(scratchPath, held.image, committedPath);

    expect(entry?.collision).toBeUndefined();
    expect(entry?.stored).toBeUndefined();
  });

  test("names a scratch copy as a collision when the committed file beside it holds other bytes, though no manifest row names it", async () => {
    expect.hasAssertions();

    const scratch = await blue();
    const committed = await red();
    writeFileSync(committedPath, committed.data);
    toScratch("blue");

    const entry = await readEntryImage(scratchPath, undefined, committedPath);

    expect(entry?.collision).toStrictEqual({ committed: committed.image.sha256, ours: scratch.image.sha256 });
  });

  test("stores the held image from its scratch copy when the committed file is absent, the recovery write", async () => {
    expect.hasAssertions();

    const held = await red();
    toScratch("red");

    const entry = await readEntryImage(scratchPath, held.image, committedPath);

    expect(entry?.collision).toBeUndefined();
    expect(entry?.isNew).toBe(false);
    expect(entry?.stored).toStrictEqual(held.data);
  });
});
