import type { TrounceBlossom } from "#src/models/bosses/TrounceBlossom";
import type { Interactable } from "#src/models/interaction/Interactable";

import { GameTextKey } from "genshin-text";
import { InteractionKind } from "genshin-interface";

// The interactables the unclaimed Trounce Blossoms are, each standing where its blossom lies on the ground
export const computeTrounceBlossomInteractables = (
  trounceBlossoms: ReadonlyMap<string, TrounceBlossom>,
  gameText: Readonly<Record<string, string>>,
  getGroundHeight: (x: number, z: number) => number,
): Interactable[] =>
  [...trounceBlossoms].flatMap(([spawnKey, { claimedAt, place }]): Interactable[] => {
    if (claimedAt) return [];
    const { x, z } = place;
    return [
      {
        id: spawnKey,
        kind: InteractionKind.Claim,
        name: gameText[GameTextKey.TrounceBlossom] ?? "",
        position: { x, y: getGroundHeight(x, z), z },
      },
    ];
  });
