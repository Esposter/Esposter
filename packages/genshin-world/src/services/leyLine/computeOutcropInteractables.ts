import type { Interactable } from "#src/models/interaction/Interactable";
import type { Outcrop } from "#src/models/leyLine/Outcrop";
import type { OutcropPlacement } from "#src/models/leyLine/OutcropPlacement";

import { OutcropStage } from "#src/models/leyLine/OutcropStage";
import { OutcropKindNameKeyMap } from "#src/services/leyLine/OutcropKindNameKeyMap";
import { InteractionKind } from "genshin-interface";

// What the character can act on at each cleared outcrop's place, beneath its point: its blossom to claim, named by its
// Kind's text. An outcrop still waiting, fighting or claimed is not offered
export const computeOutcropInteractables = (
  outcrops: Outcrop[],
  placements: OutcropPlacement[],
  gameText: Readonly<Record<string, string>>,
  getGroundHeight: (x: number, z: number) => number,
): Interactable[] =>
  outcrops.flatMap(({ kind, placeId, stage }): Interactable[] => {
    const place = placements.find(({ id }) => id === placeId);
    if (stage !== OutcropStage.Cleared || !place) return [];
    const { x, z } = place.position;
    return [
      {
        id: String(placeId),
        kind: InteractionKind.Claim,
        name: gameText[OutcropKindNameKeyMap[kind]] ?? "",
        position: { x, y: getGroundHeight(x, z), z },
      },
    ];
  });
