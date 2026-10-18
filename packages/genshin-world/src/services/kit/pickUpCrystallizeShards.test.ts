import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";
import type { KitCrystallizeShard } from "#src/models/kit/KitCrystallizeShard";
import type { KitShield } from "#src/models/kit/KitShield";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import {
  CRYSTALLIZE_SHARD_PICKUP_DELAY_SECONDS,
  CRYSTALLIZE_SHARD_PICKUP_RADIUS,
  CRYSTALLIZE_SHARD_SECONDS,
  CRYSTALLIZE_SHIELD_SECONDS,
} from "#src/services/combat/shield/constants";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { pickUpCrystallizeShards } from "#src/services/kit/pickUpCrystallizeShards";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { describe, expect, test, vi } from "vitest";

const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);

describe(pickUpCrystallizeShards, () => {
  const CHARACTER_ID = 1;
  const OTHER_CHARACTER_ID = 2;
  // The character on the field, its kit told each event the pickup raises
  const createCombatant = (kit: Kit = TRAVELER_KIT): Combatant => ({
    ascension: 0,
    attributes: computeCharacterAttributes([]),
    characterId: CHARACTER_ID,
    constellationCount: 0,
    elementalResonances: [],
    kit,
    level: 1,
  });
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
  ])("leaves a shard %s on the ground", (_description, shard) => {
    expect.hasAssertions();

    const context = createKitTestContext(createCombatant(), { kitEffectState: { effects: [shard] } });
    pickUpCrystallizeShards(context, CHARACTER_ID, { x: 0, z: 0 });

    expect(context.kitEffectState.effects).toStrictEqual([shard]);
    expect(context.outbox).toStrictEqual([]);
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
    const context = createKitTestContext(createCombatant(), {
      kitEffectState: { effects: [ownShield, crystallizeShield, shard] },
    });
    pickUpCrystallizeShards(context, CHARACTER_ID, { x: 0, z: 0 });

    expect(context.kitEffectState.effects).toStrictEqual([
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

  test("sends the shard's pickup by the character on the field, with the shard's element, for each shard it picks up", () => {
    expect.hasAssertions();

    const context = createKitTestContext(createCombatant(), {
      kitEffectState: {
        effects: [createShard(Element.Hydro, 0), createShard(Element.Pyro, CRYSTALLIZE_SHARD_PICKUP_RADIUS)],
      },
    });
    pickUpCrystallizeShards(context, CHARACTER_ID, { x: 0, z: 0 });

    expect(context.outbox).toStrictEqual([
      { characterId: CHARACTER_ID, element: Element.Hydro, kind: KitEventKind.CrystallizeShardPickedUp },
      { characterId: CHARACTER_ID, element: Element.Pyro, kind: KitEventKind.CrystallizeShardPickedUp },
    ]);
  });

  test("tells the team's kits the shard's Crystallize shield is cast, owned by the character whose reaction left it", () => {
    expect.hasAssertions();

    const onKitEvent = vi.fn<NonNullable<Kit["onKitEvent"]>>();
    const combatant = createCombatant({ ...TRAVELER_KIT, onKitEvent });
    const context = createKitTestContext(combatant, { kitEffectState: { effects: [createShard(Element.Hydro, 0)] } });
    pickUpCrystallizeShards(context, CHARACTER_ID, { x: 0, z: 0 });

    expect(onKitEvent).toHaveBeenCalledExactlyOnceWith(
      {
        kind: KitEventKind.ShieldCast,
        shield: {
          characterId: OTHER_CHARACTER_ID,
          element: Element.Hydro,
          health: 1000,
          isCrystallize: true,
          kind: "shield",
          secondsRemaining: CRYSTALLIZE_SHIELD_SECONDS,
        },
      },
      context,
      combatant,
    );
  });
});
