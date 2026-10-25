import type { ArchiveViewpoint } from "#src/models/archive/ArchiveViewpoint";
import type { SceneGroups } from "#src/models/sceneGroup/SceneGroups";

import { SceneGroupMemberKind } from "#src/models/sceneGroup/SceneGroupMemberKind";
import { SceneGroupSource } from "#src/models/sceneGroup/SceneGroupSource";
import { getViewpointPlaces } from "#src/services/archive/getViewpointPlaces";
import { describe, expect, test } from "vitest";

describe(getViewpointPlaces, () => {
  // Made-up ids, so the test reads no game data
  const GROUP_ID = 90_010;
  const PLACE = { position: { x: 1, z: 2 }, source: SceneGroupSource.OfficialMap };
  const PLACED_VIEWPOINT: ArchiveViewpoint = { configId: 90_011, groupId: GROUP_ID, id: 90_021, nameTextId: "90031" };
  const UNPLACED_VIEWPOINT: ArchiveViewpoint = { configId: 90_012, groupId: GROUP_ID, id: 90_022, nameTextId: "90032" };
  const sceneGroups: SceneGroups = {
    buildings: {},
    groups: {
      [GROUP_ID]: [
        {
          configId: PLACED_VIEWPOINT.configId,
          kind: SceneGroupMemberKind.Gadget,
          objectId: 70_001,
          place: PLACE,
          source: SceneGroupSource.ViewCodex,
        },
        {
          configId: UNPLACED_VIEWPOINT.configId,
          kind: SceneGroupMemberKind.Gadget,
          objectId: 70_002,
          source: SceneGroupSource.ViewCodex,
        },
      ],
    },
  };

  test("a viewpoint is placed at the point its scene group record gives", () => {
    expect.hasAssertions();

    expect(getViewpointPlaces(sceneGroups, [PLACED_VIEWPOINT, UNPLACED_VIEWPOINT])).toStrictEqual(
      new Map([[PLACED_VIEWPOINT.id, PLACE]]),
    );
  });
});
