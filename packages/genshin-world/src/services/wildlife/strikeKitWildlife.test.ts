import type { DroppedItem } from "#src/models/enemy/DroppedItem";
import type { AttackArea } from "#src/models/kit/AttackArea";
import type { KitBody } from "#src/models/kit/KitBody";
import type { Wildlife } from "#src/models/wildlife/Wildlife";

import { WildlifeKind } from "#src/models/wildlife/WildlifeKind";
import { WildlifeState } from "#src/models/wildlife/WildlifeState";
import { createWildlife } from "#src/services/wildlife/createWildlife";
import { strikeKitWildlife } from "#src/services/wildlife/strikeKitWildlife";
import { describe, expect, test, vi } from "vitest";

describe(strikeKitWildlife, () => {
  const AREA: AttackArea = { angle: Math.PI / 2, height: 2, radius: 3 };
  const BODY: KitBody = { facing: 0, height: 0, position: { x: 0, z: 0 } };

  test("a hit in the attack area strikes a bird", () => {
    expect.hasAssertions();

    const whitePigeon = createWildlife({ id: "pigeon", kind: WildlifeKind.WhitePigeon, position: { x: 0, z: -2 } });
    const placeWildlifeDrops = vi.fn<(wildlife: Wildlife, droppedItems: DroppedItem[]) => void>();
    strikeKitWildlife(AREA, BODY, [whitePigeon], placeWildlifeDrops);
    expect(whitePigeon.state).toBe(WildlifeState.Struck);
    expect(placeWildlifeDrops).toHaveBeenCalledExactlyOnceWith(whitePigeon, [{ count: 1, itemId: 100_064 }]);
  });

  test("a hit outside the attack area does not strike a bird", () => {
    expect.hasAssertions();

    const whitePigeon = createWildlife({ id: "pigeon", kind: WildlifeKind.WhitePigeon, position: { x: 0, z: 2 } });
    const placeWildlifeDrops = vi.fn<(wildlife: Wildlife, droppedItems: DroppedItem[]) => void>();
    strikeKitWildlife(AREA, BODY, [whitePigeon], placeWildlifeDrops);
    expect(whitePigeon.state).toBe(WildlifeState.Idle);
    expect(placeWildlifeDrops).not.toHaveBeenCalled();
  });

  test("a hit returns the animals it struck and skips one already struck", () => {
    expect.hasAssertions();

    const whitePigeon = createWildlife({ id: "pigeon", kind: WildlifeKind.WhitePigeon, position: { x: 0, z: -2 } });
    const struckPigeon = createWildlife({ id: "struck", kind: WildlifeKind.WhitePigeon, position: { x: 0, z: -1 } });
    struckPigeon.state = WildlifeState.Struck;
    const placeWildlifeDrops = vi.fn<(wildlife: Wildlife, droppedItems: DroppedItem[]) => void>();
    expect(strikeKitWildlife(AREA, BODY, [whitePigeon, struckPigeon], placeWildlifeDrops)).toStrictEqual([whitePigeon]);
  });
});
