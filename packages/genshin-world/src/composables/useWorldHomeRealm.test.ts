import type { GadgetRow } from "#src/models/gadget/GadgetRow";
import type { WorldJumpPose } from "#src/models/world/WorldJumpPose";

import { useWorldHomeRealm } from "#src/composables/useWorldHomeRealm";
import { GadgetKind } from "#src/models/gadget/GadgetKind";
import { HOME_POT_GADGET_ID, HOME_REALM_SPAWN } from "#src/services/home/constants";
import { describe, expect, test, vi } from "vitest";

describe(useWorldHomeRealm, () => {
  const POT: GadgetRow = {
    cooldownGroup: 0,
    cooldownOnFailSeconds: 0,
    cooldownSeconds: 0,
    gatherItemId: 0,
    id: HOME_POT_GADGET_ID,
    isEquipable: true,
    kind: GadgetKind.Detector,
    maxCountByPlayer: 1,
    maxCountInScene: 1,
    maxPoints: 0,
    region: "",
  };
  const standing = { position: { x: 3, y: 5, z: -4 }, yaw: 1 };

  test("the pot's gadget sets the pot down at the feet, and any other gadget sets nothing down", () => {
    expect.hasAssertions();

    const { homePotPoint, placeUsedGadget } = useWorldHomeRealm();
    placeUsedGadget({ ...POT, id: HOME_POT_GADGET_ID + 1 }, { x: 1, z: 1 });

    expect(homePotPoint.value).toBeUndefined();

    placeUsedGadget(POT, { x: 3, z: -4 });

    expect(homePotPoint.value).toStrictEqual({ x: 3, z: -4 });
  });

  test("the gadget goes into the realm from where the player stands, and out to that place, and the pot is not set down inside it", () => {
    expect.hasAssertions();

    const jumpTo = vi.fn<(pose: WorldJumpPose) => void>();
    const { homePotPoint, homeRealmVisit, placeUsedGadget, toggleHomeRealm } = useWorldHomeRealm();
    toggleHomeRealm({ getGroundHeight: () => 2, jumpTo, standing });
    const visit = homeRealmVisit.value;

    expect(visit).toBeDefined();
    expect(jumpTo).toHaveBeenLastCalledWith(HOME_REALM_SPAWN);

    placeUsedGadget(POT, { x: 9, z: 9 });

    expect(homePotPoint.value).toBeUndefined();

    toggleHomeRealm({ getGroundHeight: () => 2, jumpTo, standing });

    expect(homeRealmVisit.value).toBeUndefined();
    expect(jumpTo).toHaveBeenLastCalledWith(visit?.pose);
  });
});
