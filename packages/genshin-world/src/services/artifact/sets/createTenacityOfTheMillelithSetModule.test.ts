import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";

import { KitEventKind } from "#src/models/kit/KitEventKind";

import { TENACITY_OF_THE_MILLELITH_ARTIFACT_SET_ID } from "#src/services/artifact/constants";
import { createTenacityOfTheMillelithSetModule } from "#src/services/artifact/sets/createTenacityOfTheMillelithSetModule";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { readStatTables } from "#src/services/character/readStatTables";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
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
const damageDealtBy = (attackTag: AttackTag) =>
  ({
    attackTag,
    enemy,
    hit: KIT.plungeCollision,
    isCritical: false,
    isDefeated: false,
    kind: KitEventKind.DamageTaken,
    striker: wearer,
  }) as const;
const bonusOf = (pieceCount: number) => {
  const bonus = statTables.artifactSetDataMap
    .get(TENACITY_OF_THE_MILLELITH_ARTIFACT_SET_ID)
    ?.bonuses.find((b) => b.pieceCount === pieceCount);
  assert.exists(bonus);
  return bonus;
};

describe(createTenacityOfTheMillelithSetModule, () => {
  test("gives every deployed member 20% ATK and 30% Shield Strength for 3 seconds when its wearer's Elemental Skill hits, from four pieces", () => {
    expect.hasAssertions();

    const party = createParty([TRAVELER_CHARACTER_ID, OTHER_CHARACTER_ID]);
    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wearer, { kitEffectState, party });
    const { onKitEvent } = createTenacityOfTheMillelithSetModule(bonusOf(4));

    onKitEvent?.(damageDealtBy(AttackTag.ElementalSkill), context, wearer);

    expect(
      kitEffectState.effects
        .filter(({ kind }) => kind === "buff")
        .map(({ amount, attribute, characterId, secondsRemaining }) => ({
          amount,
          attribute,
          characterId,
          secondsRemaining,
        })),
    ).toStrictEqual([
      { amount: 0.2, attribute: Attribute.AttackPercent, characterId: TRAVELER_CHARACTER_ID, secondsRemaining: 3 },
      { amount: 0.2, attribute: Attribute.AttackPercent, characterId: OTHER_CHARACTER_ID, secondsRemaining: 3 },
      { amount: 0.3, attribute: Attribute.ShieldStrength, characterId: TRAVELER_CHARACTER_ID, secondsRemaining: 3 },
      { amount: 0.3, attribute: Attribute.ShieldStrength, characterId: OTHER_CHARACTER_ID, secondsRemaining: 3 },
    ]);
  });

  test("triggers no sooner than once every half a second, and not on a hit that is not an Elemental Skill", () => {
    expect.hasAssertions();

    const party = createParty([TRAVELER_CHARACTER_ID, OTHER_CHARACTER_ID]);
    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wearer, { kitEffectState, party });
    const { onKitEvent } = createTenacityOfTheMillelithSetModule(bonusOf(4));

    onKitEvent?.(damageDealtBy(AttackTag.NormalAttack), context, wearer);
    expect(kitEffectState.effects).toHaveLength(0);

    onKitEvent?.(damageDealtBy(AttackTag.ElementalSkill), context, wearer);
    const buffCount = kitEffectState.effects.length;
    onKitEvent?.(damageDealtBy(AttackTag.ElementalSkill), context, wearer);
    expect(kitEffectState.effects).toHaveLength(buffCount);
  });
});
