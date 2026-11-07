import type { AssetPlacement } from "#src/models/genshinAssets/shared/AssetPlacement";
import type { MaterialValues } from "#src/models/genshinAssets/shared/MaterialValues";
import type { fitStatueComponent as baseFitStatueComponent } from "#src/services/genshinAssets/fit/fitStatueComponent";
import type { readTexture as baseReadTexture } from "#src/services/genshinAssets/fit/readTexture";
import type { nameMeshPlacements as baseNameMeshPlacements } from "#src/services/genshinAssets/shared/nameMeshPlacements";
import type { readAssetNames as baseReadAssetNames } from "#src/services/genshinAssets/shared/readAssetNames";
import type { readComponentMaterials as baseReadComponentMaterials } from "#src/services/genshinAssets/shared/readComponentMaterials";
import type { readComponentPlacements as baseReadComponentPlacements } from "#src/services/genshinAssets/shared/readComponentPlacements";
import type { readObjMesh as baseReadObjMesh } from "#src/services/genshinAssets/shared/readObjMesh";
import type { toDiffusePath as baseToDiffusePath } from "#src/services/genshinAssets/shared/toDiffusePath";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { fitRegionStatue } from "#src/services/genshinAssets/fit/fitRegionStatue";
import { MAIN_TEXTURE_SLOT } from "#src/services/genshinAssets/shared/constants";
import { beforeEach, describe, expect, test, vi } from "vitest";

const {
  fitStatueComponent,
  nameMeshPlacements,
  readAssetNames,
  readComponentMaterials,
  readComponentPlacements,
  readObjMesh,
  readTexture,
  toDiffusePath,
} = vi.hoisted(() => ({
  fitStatueComponent: vi.fn<typeof baseFitStatueComponent>(),
  nameMeshPlacements: vi.fn<typeof baseNameMeshPlacements>(),
  readAssetNames: vi.fn<typeof baseReadAssetNames>(),
  readComponentMaterials: vi.fn<typeof baseReadComponentMaterials>(),
  readComponentPlacements: vi.fn<typeof baseReadComponentPlacements>(),
  readObjMesh: vi.fn<typeof baseReadObjMesh>(),
  readTexture: vi.fn<typeof baseReadTexture>(),
  toDiffusePath: vi.fn<typeof baseToDiffusePath>(),
}));

vi.mock(import("#src/services/genshinAssets/shared/nameMeshPlacements"), () => ({ nameMeshPlacements }));
vi.mock(import("#src/services/genshinAssets/shared/readAssetNames"), () => ({ readAssetNames }));
vi.mock(import("#src/services/genshinAssets/shared/readComponentMaterials"), () => ({ readComponentMaterials }));
vi.mock(import("#src/services/genshinAssets/shared/readComponentPlacements"), () => ({ readComponentPlacements }));
vi.mock(import("#src/services/genshinAssets/shared/readObjMesh"), () => ({ readObjMesh }));
vi.mock(import("#src/services/genshinAssets/fit/fitStatueComponent"), () => ({ fitStatueComponent }));
vi.mock(import("#src/services/genshinAssets/fit/readTexture"), () => ({ readTexture }));
vi.mock(import("#src/services/genshinAssets/shared/toDiffusePath"), () => ({ toDiffusePath }));

// A placement of one mesh drawn with the one material, standing at the origin
const createPlacement = (mesh: string): AssetPlacement => ({
  father: "",
  materials: ["1"],
  mesh,
  name: mesh,
  position: [0, 0, 0],
  root: "statue",
  rotation: [0, 0, 0, 1],
  scale: [1, 1, 1],
});

describe(fitRegionStatue, () => {
  beforeEach(() => {
    const material: MaterialValues = {
      colors: {},
      floats: {},
      keywords: [],
      name: "Stages_MdGoddess01_Mat",
      shaderPathId: "0",
      textures: { [MAIN_TEXTURE_SLOT]: { fileIndex: 0, offset: [0, 0], pathId: "2", scale: [1, 1] } },
    };
    nameMeshPlacements.mockResolvedValue(undefined);
    readAssetNames.mockResolvedValue(
      new Map([
        ["1", "Stages_MdGoddess01_Mat"],
        ["2", "Stages_MdGoddess01_Diffuse"],
      ]),
    );
    readComponentMaterials.mockResolvedValue([material]);
    readObjMesh.mockResolvedValue({
      faceGroups: ["", "", "", ""],
      faceNormals: [
        [0, 0, 1],
        [0, 0, 1],
        [0, 0, 1],
        [0, 0, 1],
      ],
      faces: [
        [0, 1, 2],
        [0, 1, 3],
        [0, 2, 3],
        [1, 2, 3],
      ],
      faceUvs: [
        [0, 1, 2],
        [0, 1, 3],
        [0, 2, 3],
        [1, 2, 3],
      ],
      normals: [[0, 0, 1]],
      uvs: [
        [0, 0],
        [1, 0],
        [0, 1],
        [1, 1],
      ],
      vertices: [
        [0, 0, 0],
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1],
      ],
    });
    readTexture.mockResolvedValue({
      data: Buffer.from([255, 255, 255, 255]),
      info: { channels: 4, height: 1, width: 1 },
    });
    toDiffusePath.mockReturnValue("/fixture/Stages_MdGoddess01_Diffuse.png");
    // The statue kit's stack fit is the one step that takes seconds, and it is not what a record's key depends on
    fitStatueComponent.mockReturnValue({ score: 0, stacks: [] });
  });

  test("keys a region's statue record by its own component", async () => {
    expect.hasAssertions();

    readComponentPlacements.mockResolvedValue([createPlacement("Stages_MdGoddess01_Base_Lod0")]);

    const { objects } = await fitRegionStatue(DerivedAssetComponent.Liyue);

    expect(Object.keys(objects)).toStrictEqual([`${DerivedAssetComponent.Liyue}/statue`]);
  });

  test("publishes no statue record where the layout places no Goddess stone mesh", async () => {
    expect.hasAssertions();

    readComponentPlacements.mockResolvedValue([createPlacement("Stages_MdGoddess_Lite01_Lod0")]);

    await expect(fitRegionStatue(DerivedAssetComponent.Liyue)).resolves.toStrictEqual({
      notes: ["liyue: no Goddess statue stone mesh in its layout, so no statue record is published"],
      objects: {},
    });
  });

  test("reports a mesh that splits into no pieces with a mean score of zero, not NaN", async () => {
    expect.hasAssertions();

    readComponentPlacements.mockResolvedValue([createPlacement("Stages_MdGoddess01_Base_Lod0")]);
    readObjMesh.mockResolvedValueOnce({
      faceGroups: [],
      faceNormals: [],
      faces: [],
      faceUvs: [],
      normals: [],
      uvs: [],
      vertices: [
        [0, 0, 0],
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1],
      ],
    });

    await expect(fitRegionStatue(DerivedAssetComponent.Liyue)).resolves.toStrictEqual({
      notes: ["Stages_MdGoddess01_Base_Lod0: 0 pieces as 0 stacks, mean score 0.00", "statue: 0 stacks"],
      objects: { [`${DerivedAssetComponent.Liyue}/statue`]: { parts: [] } },
    });
  });
});
