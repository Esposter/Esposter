import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitStrike } from "#src/models/kit/KitStrike";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { OBSIDIAN_CODEX_ARTIFACT_SET_ID } from "#src/services/artifact/constants";
import { createObsidianCodexSetModule } from "#src/services/artifact/sets/createObsidianCodexSetModule";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { readStatTables } from "#src/services/character/readStatTables";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { NIGHTSOUL_BLESSING_STATUS_ID } from "#src/services/kit/constants";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createDeployedCombatant } from "#src/services/party/createDeployedCombatant.test";
import { createParty } from "#src/services/party/createParty";
import { assert, describe, expect, test } from "vitest";

const OTHER_CHARACTER_ID = 2;
const statTables = await readStatTables(GAME_DATA_LOCAL_BASE_URL);
const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const wearer: Combatant = {
  ascension: 0,
  attributes: computeCharacterAttributes([]),
  characterId: TRAVELER_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: KIT,
  level: 1,
};
const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
const strike: KitStrike = {
  attackTag: AttackTag.NormalAttack,
  body: { facing: 0, height: 0, position: { x: 0, z: 0 } },
  combatant: wearer,
  hit: KIT.plungeCollision,
};
const bonusOf = (pieceCount: number) => {
  const bonus = statTables.artifactSetDataMap
    .get(OBSIDIAN_CODEX_ARTIFACT_SET_ID)
    ?.bonuses.find((b) => b.pieceCount === pieceCount);
  assert.exists(bonus);
  return bonus;
};

describe(createObsidianCodexSetModule, () => {
  test("raises the DMG its wearer deals by 15% in Nightsoul's Blessing while on the field from two pieces", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    addKitStatus(kitEffectState, TRAVELER_CHARACTER_ID, { id: NIGHTSOUL_BLESSING_STATUS_ID, secondsRemaining: 10 });
    const { getStrikeDamageBonus } = createObsidianCodexSetModule(bonusOf(2));

    expect(
      getStrikeDamageBonus?.(strike, enemy, createParty([TRAVELER_CHARACTER_ID]), kitEffectState.effects),
    ).toBeCloseTo(0.15);
    expect(
      getStrikeDamageBonus?.(
        strike,
        enemy,
        createParty([OTHER_CHARACTER_ID, TRAVELER_CHARACTER_ID]),
        kitEffectState.effects,
      ),
    ).toBe(0);
  });

  test("raises no DMG outside Nightsoul's Blessing", () => {
    expect.hasAssertions();

    const { getStrikeDamageBonus } = createObsidianCodexSetModule(bonusOf(2));

    expect(getStrikeDamageBonus?.(strike, enemy, createParty([TRAVELER_CHARACTER_ID]), [])).toBe(0);
  });

  test("raises the CRIT Rate of its wearer by 40% for 6 seconds when it consumes a Nightsoul point on the field from four pieces", () => {
    expect.hasAssertions();

    const party = createParty([TRAVELER_CHARACTER_ID]);
    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wearer, { kitEffectState, party });
    const { getPassiveBonuses, onKitEvent } = createObsidianCodexSetModule(bonusOf(4));

    onKitEvent?.(
      { characterId: TRAVELER_CHARACTER_ID, kind: KitEventKind.NightsoulPointsConsumed, points: 1 },
      context,
      wearer,
    );

    expect(
      getPassiveBonuses?.(wearer, 1, [createDeployedCombatant(wearer, { isOnField: true })], kitEffectState.effects),
    ).toStrictEqual([{ amount: 0.4, attribute: Attribute.CriticalRate }]);
  });

  test("raises no CRIT Rate from points consumed while its wearer is off the field", () => {
    expect.hasAssertions();

    const party = createParty([OTHER_CHARACTER_ID, TRAVELER_CHARACTER_ID]);
    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wearer, { kitEffectState, party });
    const { getPassiveBonuses, onKitEvent } = createObsidianCodexSetModule(bonusOf(4));

    onKitEvent?.(
      { characterId: TRAVELER_CHARACTER_ID, kind: KitEventKind.NightsoulPointsConsumed, points: 1 },
      context,
      wearer,
    );

    expect(
      getPassiveBonuses?.(wearer, 1, [createDeployedCombatant(wearer, { isOnField: true })], kitEffectState.effects),
    ).toStrictEqual([{ amount: 0, attribute: Attribute.CriticalRate }]);
  });
});
