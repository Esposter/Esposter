import type { TrounceBlossom } from "#src/models/bosses/TrounceBlossom";
import type { Interactable } from "#src/models/interaction/Interactable";

import { checkIsTrounceBlossomClaimable } from "#src/services/bosses/checkIsTrounceBlossomClaimable";
import { GameTextKey } from "genshin-text";
import { InteractionKind } from "genshin-interface";

// The interactables the claimable Trounce Blossoms are at the time given, each standing where its blossom lies on the ground
export const computeTrounceBlossomInteractables = (
  trounceBlossoms: ReadonlyMap<string, TrounceBlossom>,
  gameText: Readonly<Record<string, string>>,
  getGroundHeight: (x: number, z: number) => number,
  now: Temporal.Instant,
): Interactable[] =>
  [...trounceBlossoms].flatMap(([spawnKey, trounceBlossom]): Interactable[] => {
    if (!checkIsTrounceBlossomClaimable(trounceBlossom, now)) return [];
    const { x, z } = trounceBlossom.place;
    return [
      {
        id: spawnKey,
        kind: InteractionKind.Claim,
        name: gameText[GameTextKey.TrounceBlossom] ?? "",
        position: { x, y: getGroundHeight(x, z), z },
      },
    ];
  });
