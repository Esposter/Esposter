import type { CharacterPackReader } from "#src/models/character/CharacterPackReader";
import type { PmxModel } from "genshin-engine";

import { readCharacterMesh } from "#src/services/character/readCharacterMesh";
import {
  createCharacterMaterial,
  createLightUniforms,
  createPmxMesh,
  createPmxTexture,
  createPmxToonTexture,
  parsePmx,
  PmxSphereMode,
} from "genshin-engine";
import { DataTexture, Texture } from "three";
import { afterEach, describe, expect, test, vi } from "vitest";

vi.mock(import("genshin-engine"), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    createCharacterMaterial: vi.fn<typeof actual.createCharacterMaterial>(),
    createPmxMesh: vi.fn<typeof actual.createPmxMesh>(),
    createPmxTexture: vi.fn<typeof actual.createPmxTexture>(),
    createPmxToonTexture: vi.fn<typeof actual.createPmxToonTexture>(),
    parsePmx: vi.fn<typeof actual.parsePmx>(),
  };
});

describe(readCharacterMesh, () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  test("a texture a material uses as a toon ramp is not decoded for its diffuse too", async () => {
    expect.hasAssertions();

    // Node has no ImageBitmap, which the reader names when it checks a decoded image for transparent texels, so a stand-in
    // Class is given it, and no mocked texture carries an image to be an instance of it
    vi.stubGlobal("ImageBitmap", Blob);
    const colourTexture = new Texture();
    const toonTexture = new Texture();
    vi.mocked(createPmxTexture).mockResolvedValue(colourTexture);
    vi.mocked(createPmxToonTexture).mockResolvedValue(toonTexture);
    vi.mocked(parsePmx).mockReturnValue({
      materials: [
        {
          isToonShared: true,
          sphereMode: PmxSphereMode.Disabled,
          sphereTextureIndex: -1,
          textureIndex: 0,
          toonIndex: -1,
        },
        {
          isToonShared: false,
          sphereMode: PmxSphereMode.Disabled,
          sphereTextureIndex: -1,
          textureIndex: 1,
          toonIndex: 0,
        },
      ],
      textures: ["ramp.bmp", "body.png"],
    } as PmxModel);
    const characterPackReader: CharacterPackReader = {
      key: "test",
      readFile: (path) => Promise.resolve(new Blob([path])),
    };

    const result = await readCharacterMesh(characterPackReader, {
      lightUniforms: createLightUniforms(),
      rampTexture: new DataTexture(),
    });

    expect(result.isOk()).toBe(true);
    expect(createPmxMesh).toHaveBeenCalledTimes(1);
    const materialOptions = vi.mocked(createCharacterMaterial).mock.calls.map(([options]) => options);
    expect(materialOptions[0]?.texture).toBe(colourTexture);
    expect(materialOptions[1]?.toonTexture).toBe(toonTexture);
    expect(materialOptions[1]?.toonTexture).not.toBe(materialOptions[0]?.texture);
  });
});
