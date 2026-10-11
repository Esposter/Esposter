import type { Combatant } from "#src/models/kit/Combatant";
import type { KitDamageTakenEvent } from "#src/models/kit/KitDamageTakenEvent";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitStance } from "#src/models/kit/KitStance";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { RAIDEN_CHARACTER_ID } from "#src/services/kit/characters/raidenKit";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createRaidenKit } from "#src/services/kit/characters/raidenKit";
import { createKitEventContext } from "#src/services/kit/createKitEventContext.test";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";
import { createKitStepContext } from "#src/services/kit/createKitStepContext.test";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const RAIDEN_KIT = createRaidenKit(await readTalentMultipliers(GAME_DATA_LOCAL_BASE_URL, [RAIDEN_CHARACTER_ID]));

const createRaidenCombatant = (): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 10_000 }]),
  characterId: RAIDEN_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: RAIDEN_KIT,
  level: 90,
  weaponType: WeaponType.Polearm,
});

const body = { facing: 0, height: 0, position: { x: 0, z: 0 } };

// The team's effects once the burst is cast with the Resolve stacks given, and the Musou Isshin stance it takes
const castBurst = (stacks: number): { kitEffectState: KitEffectState; stance?: KitStance } => {
  const kitEffectState: KitEffectState = {
    effects: [{ characterId: RAIDEN_CHARACTER_ID, id: "raiden-resolve", kind: "status", secondsRemaining: 1, stacks }],
  };
  RAIDEN_KIT.elementalBurst.onStart?.(createKitStepContext(createRaidenCombatant(), { body, kitEffectState }));
  return {
    kitEffectState,
    stance: kitEffectState.effects.find((effect): effect is KitStance => effect.kind === "stance"),
  };
};

describe(createRaidenKit, () => {
  test("the burst spends resolve's stacks into musou no hitotachi and each musou isshin strike", () => {
    expect.hasAssertions();
    const { kitEffectState, stance } = castBurst(1);
    const summon = kitEffectState.effects.find((effect) => effect.kind === "summon");
    if (summon?.kind !== "summon") throw new Error("the burst casts no Musou no Hitotachi");

    expect(summon.hits[0]?.talentMultiplier).toBeCloseTo(4.008 + 0.03888);
    expect(stance?.actions.normalAttacks[0]?.hits[0]?.talentMultiplier).toBeCloseTo(0.447374 + 0.007262);
    expect(kitEffectState.effects.some((effect) => effect.kind === "status")).toBe(false);
  });

  test("musou isshin's strikes restore the team's energy once a second", () => {
    expect.hasAssertions();
    const { kitEffectState, stance } = castBurst(0);
    const context = createKitEventContext(createRaidenCombatant(), { kitEffectState });
    const event: KitDamageTakenEvent = {
      enemy: createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, ""),
      hit: takeOne(takeOne(stance?.actions.normalAttacks ?? []).hits),
      isCritical: false,
      isDefeated: false,
      kind: KitEventKind.DamageTaken,
      striker: createRaidenCombatant(),
    };

    RAIDEN_KIT.onKitEvent?.(event, context);
    RAIDEN_KIT.onKitEvent?.(event, context);

    expect(getPartyMember(context.party, RAIDEN_CHARACTER_ID).energy).toBeCloseTo(1.6);
  });

  test("a member holding the eye sets off one coordinated attack in 0.9 seconds", () => {
    expect.hasAssertions();
    const kitEffectState: KitEffectState = {
      effects: [{ characterId: RAIDEN_CHARACTER_ID, id: "raiden-eye", kind: "status", secondsRemaining: 1 }],
    };
    const context = createKitEventContext(createRaidenCombatant(), { kitEffectState });
    const event: KitDamageTakenEvent = {
      enemy: createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, ""),
      hit: takeOne(takeOne(RAIDEN_KIT.normalAttacks).hits),
      isCritical: false,
      isDefeated: false,
      kind: KitEventKind.DamageTaken,
      striker: createRaidenCombatant(),
    };

    RAIDEN_KIT.onKitEvent?.(event, context);
    RAIDEN_KIT.onKitEvent?.(event, context);

    expect(kitEffectState.effects.filter((effect) => effect.kind === "summon")).toHaveLength(1);
  });
});
