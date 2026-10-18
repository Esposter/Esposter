import type { CharacterPackReader } from "#src/models/character/CharacterPackReader";
import type { PmxModel } from "genshin-engine";

import { CHARACTER_MODEL_PATH, TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { getCharacterPmxUnitMetres } from "#src/services/character/getCharacterPmxUnitMetres";
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
  const actual = await importOriginal<typeof import("genshin-engine")>();
  return {
    ...actual,
    createCharacterMaterial: vi.fn(),
    createPmxMesh: vi.fn(),
    createPmxTexture: vi.fn(),
    createPmxToonTexture: vi.fn(),
    parsePmx: vi.fn(),
  };
});

describe(readCharacterMesh, () => {
  const readFile = vi.fn((path: string) => Promise.resolve(new Blob([path])));
  const characterPackReader: CharacterPackReader = { key: "", readFile };
  const meshOptions = {
    characterId: TRAVELER_CHARACTER_ID,
    lightUniforms: createLightUniforms(),
    rampTexture: new DataTexture(),
  };

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  test("a texture drawn both as a colour and as a toon ramp is decoded once each way, not shared", async () => {
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
    const result = await readCharacterMesh(characterPackReader, meshOptions);

    expect(result.isOk()).toBe(true);
    expect(createPmxMesh).toHaveBeenCalledTimes(1);
    const materialOptions = vi.mocked(createCharacterMaterial).mock.calls.map(([options]) => options);
    expect(materialOptions[0]?.texture).toBe(colourTexture);
    expect(materialOptions[1]?.toonTexture).toBe(toonTexture);
    expect(materialOptions[1]?.toonTexture).not.toBe(materialOptions[0]?.texture);
  });

  test.each([
    ["multiplied", PmxSphereMode.Multiply, [CHARACTER_MODEL_PATH, "a", "b"]],
    ["read through the second UV set", PmxSphereMode.AdditionalUv, [CHARACTER_MODEL_PATH, "a"]],
  ] as const)("reads a sphere texture only where its mode is drawn: %s", async (_name, sphereMode, expectedPaths) => {
    expect.hasAssertions();

    vi.stubGlobal("ImageBitmap", Blob);
    vi.mocked(createPmxTexture).mockResolvedValue(new Texture());
    vi.mocked(parsePmx).mockReturnValue({
      materials: [{ isToonShared: true, sphereMode, sphereTextureIndex: 1, textureIndex: 0, toonIndex: -1 }],
      textures: ["a", "b"],
    } as PmxModel);
    await readCharacterMesh(characterPackReader, meshOptions);

    expect(readFile.mock.calls.map(([path]) => path)).toStrictEqual(expectedPaths);
  });

  test("a model is drawn at its character's unit", async () => {
    expect.hasAssertions();

    vi.mocked(parsePmx).mockReturnValue({ materials: [], textures: [] } as unknown as PmxModel);

    await readCharacterMesh(characterPackReader, meshOptions);

    expect(createPmxMesh).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      getCharacterPmxUnitMetres(TRAVELER_CHARACTER_ID),
    );
  });
});
