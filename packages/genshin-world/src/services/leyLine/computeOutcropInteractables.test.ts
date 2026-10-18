import type { Outcrop } from "#src/models/leyLine/Outcrop";

import { OutcropKind } from "#src/models/leyLine/OutcropKind";
import { OutcropStage } from "#src/models/leyLine/OutcropStage";
import { computeOutcropInteractables } from "#src/services/leyLine/computeOutcropInteractables";
import { OutcropKindNameKeyMap } from "#src/services/leyLine/OutcropKindNameKeyMap";
import { InteractionKind } from "genshin-interface";
import { describe, expect, test } from "vitest";

describe(computeOutcropInteractables, () => {
  const PLACEMENTS = [{ id: 1, position: { x: 3, z: 4 } }];
  const GAME_TEXT = { [OutcropKindNameKeyMap[OutcropKind.Revelation]]: "Blossom of Revelation" };

  test("a cleared outcrop is offered to claim at its place", () => {
    expect.hasAssertions();

    const cleared: Outcrop = { kind: OutcropKind.Revelation, placeId: 1, stage: OutcropStage.Cleared };
    expect(computeOutcropInteractables([cleared], PLACEMENTS, GAME_TEXT, () => 2)).toStrictEqual([
      { id: "1", kind: InteractionKind.Claim, name: "Blossom of Revelation", position: { x: 3, y: 2, z: 4 } },
    ]);
  });

  test("an outcrop still waiting, fighting or claimed is not offered", () => {
    expect.hasAssertions();

    for (const stage of [OutcropStage.Waiting, OutcropStage.Fighting, OutcropStage.Claimed])
      expect(
        computeOutcropInteractables(
          [{ kind: OutcropKind.Revelation, placeId: 1, stage }],
          PLACEMENTS,
          GAME_TEXT,
          () => 0,
        ),
      ).toStrictEqual([]);
  });
});
