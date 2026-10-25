import type { ArchiveViewpoint } from "#src/models/archive/ArchiveViewpoint";

import { SceneGroupSource } from "#src/models/sceneGroup/SceneGroupSource";
import { computeViewpointInteractables } from "#src/services/archive/computeViewpointInteractables";
import { getViewpointInteractableId } from "#src/services/archive/getViewpointInteractableId";
import { InteractionKind } from "genshin-interface";
import { describe, expect, test } from "vitest";

describe(computeViewpointInteractables, () => {
  // Made-up viewpoint, text and ids, so the test reads no game data
  const GROUND_HEIGHT = 3;
  const getGroundHeight = () => GROUND_HEIGHT;
  const VIEWPOINT: ArchiveViewpoint = { configId: 90_011, groupId: 90_010, id: 90_021, nameTextId: "90031" };
  const TEXT_MAP = { [VIEWPOINT.nameTextId]: "Viewpoint" };
  const placeMap = new Map([[VIEWPOINT.id, { position: { x: 1, z: 2 }, source: SceneGroupSource.OfficialMap }]]);

  test("an offered viewpoint is offered on the ground beneath its place", () => {
    expect.hasAssertions();

    expect(computeViewpointInteractables([VIEWPOINT], placeMap, TEXT_MAP, getGroundHeight)).toStrictEqual([
      {
        id: getViewpointInteractableId(VIEWPOINT.id),
        kind: InteractionKind.Activate,
        name: "Viewpoint",
        position: { x: 1, y: GROUND_HEIGHT, z: 2 },
      },
    ]);
  });
});
