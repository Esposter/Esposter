import type { DumpedSkinnedMeshRenderer } from "#src/models/genshinAssets/shared/DumpedSkinnedMeshRenderer";
import type { SceneObject } from "#src/models/genshinAssets/shared/SceneObject";
import type { RosterRenderer } from "#src/services/genshinAssets/avatar/readAvatarRoster";

import { readAvatarRoster } from "#src/services/genshinAssets/avatar/readAvatarRoster";
import { getTransformKey } from "#src/services/genshinAssets/avatar/readRendererBones";
import { describe, expect, test } from "vitest";

// A scene object of the given name in the given CAB, under the given parent, with no transform of its own to speak of
const sceneObject = (name: string, file: string, transformId: string, parentId = "0"): SceneObject => ({
  block: "00/00000000.blk",
  childIds: [],
  components: [],
  file,
  gameObjectId: `game-${transformId}`,
  name,
  parentFile: file,
  parentId,
  position: [0, 0, 0],
  rotation: [0, 0, 0, 1],
  scale: [1, 1, 1],
  transformId,
});

// A renderer of the given mesh name on the given object, switched on or off as its dump says
const renderer = (name: string, object: SceneObject | undefined, m_Enabled?: number): RosterRenderer => ({
  file: object?.file ?? "",
  name,
  object,
  renderer: {
    m_Enabled,
    m_GameObject: { m_PathID: "" },
    m_Materials: [],
    m_Mesh: {},
  } as unknown as DumpedSkinnedMeshRenderer,
});

describe(readAvatarRoster, () => {
  test("takes the LOD0 renderers under the root, in name order, and leaves out the ones outside it", () => {
    expect.hasAssertions();
    const root = sceneObject("Model", "cab-a", "1");
    const body = sceneObject("Body", "cab-a", "2", "1");
    const face = sceneObject("Face", "cab-a", "3", "2");
    const other = sceneObject("Body", "cab-b", "4");
    const objectMap = new Map(
      [root, body, face, other].map((object) => [getTransformKey(object.file, object.transformId), object]),
    );

    const roster = readAvatarRoster(
      [renderer("Face", face), renderer("Body", body), renderer("Body_LOD1", body), renderer("Body", other)],
      getTransformKey(root.file, root.transformId),
      objectMap,
    );

    expect(roster.map(({ name }) => name)).toStrictEqual(["Body", "Face"]);
  });

  test("leaves out a renderer its dump switches off, and keeps one whose dump says nothing of its switch", () => {
    expect.hasAssertions();
    const root = sceneObject("Model", "cab-a", "1");
    const body = sceneObject("Body", "cab-a", "2", "1");
    const effect = sceneObject("EffectMesh", "cab-a", "3", "1");
    const brow = sceneObject("Brow", "cab-a", "4", "1");
    const objectMap = new Map(
      [root, body, effect, brow].map((object) => [getTransformKey(object.file, object.transformId), object]),
    );

    const roster = readAvatarRoster(
      [renderer("Body", body, 1), renderer("EffectMesh", effect, 0), renderer("Brow", brow)],
      getTransformKey(root.file, root.transformId),
      objectMap,
    );

    expect(roster.map(({ name }) => name)).toStrictEqual(["Body", "Brow"]);
  });
});
