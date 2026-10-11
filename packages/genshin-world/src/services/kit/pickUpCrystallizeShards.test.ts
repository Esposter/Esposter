import type { KitCrystallizeShard } from "#src/models/kit/KitCrystallizeShard";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitShield } from "#src/models/kit/KitShield";

import { Element } from "#src/models/Element";
import {
  CRYSTALLIZE_SHARD_PICKUP_DELAY_SECONDS,
  CRYSTALLIZE_SHARD_PICKUP_RADIUS,
  CRYSTALLIZE_SHARD_SECONDS,
  CRYSTALLIZE_SHIELD_SECONDS,
} from "#src/services/combat/shield/constants";
import { pickUpCrystallizeShards } from "#src/services/kit/pickUpCrystallizeShards";
import { describe, expect, test } from "vitest";

describe(pickUpCrystallizeShards, () => {
  const CHARACTER_ID = 1;
  const OTHER_CHARACTER_ID = 2;
  const PICKABLE_SECONDS = CRYSTALLIZE_SHARD_SECONDS - CRYSTALLIZE_SHARD_PICKUP_DELAY_SECONDS;

  const createShard = (element: Element, x: number, secondsRemaining = PICKABLE_SECONDS): KitCrystallizeShard => ({
    characterId: OTHER_CHARACTER_ID,
    element,
    health: 1000,
    kind: "crystallizeShard",
    position: { x, z: 0 },
    secondsRemaining,
  });

  test.each<[string, KitCrystallizeShard]>([
    ["before it may be", createShard(Element.Hydro, 0, PICKABLE_SECONDS + 0.01)],
    ["out of reach", createShard(Element.Hydro, CRYSTALLIZE_SHARD_PICKUP_RADIUS + 0.01)],
  ])("leaves a shard %s on the ground", (_, shard) => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [shard] };
    pickUpCrystallizeShards(kitEffectState, { x: 0, z: 0 });

    expect(kitEffectState.effects).toStrictEqual([shard]);
  });

  test("grants a shard's Crystallize shield in reach, overwriting the team's last one and keeping a character's own", () => {
    expect.hasAssertions();

    const ownShield: KitShield = { characterId: OTHER_CHARACTER_ID, health: 500, kind: "shield", secondsRemaining: 12 };
    const crystallizeShield: KitShield = {
      characterId: CHARACTER_ID,
      element: Element.Pyro,
      health: 800,
      isCrystallize: true,
      kind: "shield",
      secondsRemaining: 10,
    };
    const shard = createShard(Element.Hydro, CRYSTALLIZE_SHARD_PICKUP_RADIUS);
    const kitEffectState: KitEffectState = { effects: [ownShield, crystallizeShield, shard] };
    pickUpCrystallizeShards(kitEffectState, { x: 0, z: 0 });

    expect(kitEffectState.effects).toStrictEqual([
      ownShield,
      { ...crystallizeShield, secondsRemaining: 0 },
      { ...shard, secondsRemaining: 0 },
      {
        characterId: OTHER_CHARACTER_ID,
        element: Element.Hydro,
        health: 1000,
        isCrystallize: true,
        kind: "shield",
        secondsRemaining: CRYSTALLIZE_SHIELD_SECONDS,
      },
    ]);
  });
});
