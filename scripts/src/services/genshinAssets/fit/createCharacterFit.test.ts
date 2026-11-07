import type { InterfaceNode } from "#src/models/genshinAssets/shared/InterfaceNode";

import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { createCharacterFit } from "#src/services/genshinAssets/fit/createCharacterFit";
import { GENSHIN_ASSETS_PRODUCER_PATHS } from "#src/services/genshinAssets/shared/constants";
import { writeProvenance } from "#src/services/provenance/writeProvenance";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

// The character component's root is a fixture folder, so the fit reads only what each test writes into it
const { getFixtureRoot, readGameVersion } = vi.hoisted(() => ({
  getFixtureRoot: { root: "" },
  readGameVersion: vi.fn<() => Promise<string>>(),
}));
vi.mock(import("#src/services/genshinAssets/shared/readGameVersion"), () => ({ readGameVersion }));
vi.mock(import("#src/services/genshinAssets/shared/getComponentDirectory"), () => ({
  getComponentDirectory: () => {
    const root = getFixtureRoot.root;
    return { assets: join(root, "assets"), behaviours: "", layout: "", music: "", root, shaders: "", world: "" };
  },
}));

describe(createCharacterFit, () => {
  // A canvas holding one piece, enough for the interface's rects to fit
  const INTERFACE_TREE: InterfaceNode = {
    anchoredPosition: [0, 1],
    anchorMax: [1, 0],
    anchorMin: [0, 0],
    children: [],
    components: [],
    name: "Foot",
    path: "Page/Foot",
    pivot: [0, 0],
    scale: [1, 1],
    sizeDelta: [0, 1],
  };
  const PORTRAIT_NAME = "UI_AvatarIcon_Fixture";
  const PORTRAIT_PIXELS = Buffer.from([200, 100, 0, 255, 0, 100, 200, 255]);

  let root = "";

  beforeEach(async () => {
    root = await mkdtemp(join(tmpdir(), "character-fit-"));
    getFixtureRoot.root = root;
    await mkdir(join(root, "interface"), { recursive: true });
    await writeFile(join(root, "interface", "interface.json"), JSON.stringify({ ...INTERFACE_TREE, children: [] }));
    readGameVersion.mockResolvedValue("a");
    // The interface folder carries the stamp its extraction writes, so the fit reads it through the gate
    await writeProvenance(join(root, "interface"), {
      command: "interface character",
      producerPaths: GENSHIN_ASSETS_PRODUCER_PATHS,
    });
  });

  afterEach(async () => {
    await rm(root, { force: true, recursive: true });
  });

  // The colours are opt-in, so the character fit runs as it did on a machine without the portraits' textures.
  test("a default run without the portraits' textures fits the interface alone", async () => {
    expect.hasAssertions();

    const build = await createCharacterFit([], { isDryRun: true });

    expect(Object.keys(build.objects)).toStrictEqual(["character/interfaceRects"]);
  });

  test("a named run without the portraits' textures fails with its message", async () => {
    expect.hasAssertions();

    await expect(createCharacterFit(["pictureColours"], { isDryRun: true })).rejects.toMatchObject({
      message: expect.stringContaining("holds no exported portrait texture to measure"),
    });
  });

  // A texture folder that holds no portrait is refused too, rather than publishing an empty record over the published one
  test("a named run whose texture folder holds no portrait refuses to publish", async () => {
    expect.hasAssertions();

    const textureDirectory = join(root, "assets", AssetType.Texture2D);
    await mkdir(textureDirectory, { recursive: true });
    await sharp(PORTRAIT_PIXELS, { raw: { channels: 4, height: 1, width: 2 } })
      .png()
      .toFile(join(textureDirectory, "Gcg_CardFace_Fixture.png"));

    await expect(createCharacterFit(["pictureColours"], { isDryRun: true })).rejects.toMatchObject({
      message: expect.stringContaining("holds no exported portrait texture to measure"),
    });
  });

  test("a named run records each portrait's colour under its name", async () => {
    expect.hasAssertions();

    const textureDirectory = join(root, "assets", AssetType.Texture2D);
    await mkdir(textureDirectory, { recursive: true });
    await sharp(PORTRAIT_PIXELS, { raw: { channels: 4, height: 1, width: 2 } })
      .png()
      .toFile(join(textureDirectory, `${PORTRAIT_NAME}.png`));

    const build = await createCharacterFit(["pictureColours"], { isDryRun: true });

    expect(build.objects).toStrictEqual({ "character/pictureColours": { [PORTRAIT_NAME]: [100, 100, 100] } });
  });
});
