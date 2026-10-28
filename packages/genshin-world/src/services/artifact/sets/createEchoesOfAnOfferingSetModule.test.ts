import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitStrike } from "#src/models/kit/KitStrike";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { ECHOES_OF_AN_OFFERING_ARTIFACT_SET_ID } from "#src/services/artifact/constants";
import { createEchoesOfAnOfferingSetModule } from "#src/services/artifact/sets/createEchoesOfAnOfferingSetModule";
import { getArtifactSetBonus } from "#src/services/artifact/sets/getArtifactSetBonus.test";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { readStatTables } from "#src/services/character/readStatTables";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { OTHER_CHARACTER_ID } from "#src/services/kit/constants.test";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { emitKitEvent } from "#src/services/kit/emitKitEvent";
import { getPassiveKit } from "#src/services/kit/getPassiveKit";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const statTables = await readStatTables(GAME_DATA_LOCAL_BASE_URL);
const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const createWearer = (): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([]),
  characterId: TRAVELER_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: getPassiveKit(KIT, [
    createEchoesOfAnOfferingSetModule(getArtifactSetBonus(statTables, ECHOES_OF_AN_OFFERING_ARTIFACT_SET_ID, 4)),
  ]),
  level: 1,
});
const createNormalAttackStrike = (combatant: Combatant): KitStrike => ({
  attackTag: AttackTag.NormalAttack,
  body: { facing: 0, height: 0, position: { x: 0, z: 0 } },
  combatant,
  hit: KIT.plungeCollision,
});
const landNormalAttack = (context: ReturnType<typeof createKitTestContext>) => {
  emitKitEvent({ action: takeOne(KIT.normalAttacks, 0), kind: KitEventKind.NormalAttackLanded }, context);
};

describe(createEchoesOfAnOfferingSetModule, () => {
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  // The flat base DMG a Normal Attack of the wearer's adds as it stands, against the enemy
  const getValleyRiteBonus = (wearer: Combatant, kitEffectState: KitEffectState): number =>
    wearer.kit.getStrikeAdditiveBaseDamageBonus?.(
      createNormalAttackStrike(wearer),
      enemy,
      createParty([TRAVELER_CHARACTER_ID]),
      kitEffectState.effects,
      new Map([[TRAVELER_CHARACTER_ID, wearer]]),
    ) ?? 0;

  test("a Normal Attack that lands and passes the 36% roll adds 70% of its wearer's ATK to its DMG, cleared 0.05 seconds on", () => {
    expect.hasAssertions();

    const wearer = createWearer();
    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wearer, {
      kitEffectState,
      party: createParty([TRAVELER_CHARACTER_ID]),
      random: () => 0.35,
    });

    landNormalAttack(context);
    expect(getValleyRiteBonus(wearer, kitEffectState)).toBeCloseTo(0.7 * wearer.attributes.attack);

    stepKitSeconds(context, 0.1);
    expect(getValleyRiteBonus(wearer, kitEffectState)).toBe(0);
  });

  test("a failed roll raises the odds of the next by 20%, and a Normal Attack checks once every 0.2 seconds", () => {
    expect.hasAssertions();

    const wearer = createWearer();
    const kitEffectState: KitEffectState = { effects: [] };
    let roll = 0.5;
    const context = createKitTestContext(wearer, {
      kitEffectState,
      party: createParty([TRAVELER_CHARACTER_ID]),
      random: () => roll,
    });

    // 0.5 fails the 36% odds, and an immediate Normal Attack is not checked at all, so a roll of 0 would not trigger it
    landNormalAttack(context);
    expect(getValleyRiteBonus(wearer, kitEffectState)).toBe(0);
    roll = 0;
    landNormalAttack(context);
    expect(getValleyRiteBonus(wearer, kitEffectState)).toBe(0);

    // After the 0.2 seconds, the odds stand at 56%, so 0.5 now triggers it
    roll = 0.5;
    stepKitSeconds(context, 0.25);
    landNormalAttack(context);
    expect(getValleyRiteBonus(wearer, kitEffectState)).toBeCloseTo(0.7 * wearer.attributes.attack);
  });

  test("while its wearer is off the field the odds do not rise on a failed roll", () => {
    expect.hasAssertions();

    const wearer = createWearer();
    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wearer, {
      kitEffectState,
      party: createParty([OTHER_CHARACTER_ID, TRAVELER_CHARACTER_ID]),
      random: () => 0.5,
    });

    landNormalAttack(context);
    stepKitSeconds(context, 0.25);
    landNormalAttack(context);
    expect(getValleyRiteBonus(wearer, kitEffectState)).toBe(0);
  });
});
