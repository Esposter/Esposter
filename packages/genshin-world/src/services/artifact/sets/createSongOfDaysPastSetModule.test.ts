import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { SONG_OF_DAYS_PAST_ARTIFACT_SET_ID } from "#src/services/artifact/constants";
import { createSongOfDaysPastSetModule } from "#src/services/artifact/sets/createSongOfDaysPastSetModule";
import { getArtifactSetBonus } from "#src/services/artifact/sets/getArtifactSetBonus.test";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { readStatTables } from "#src/services/character/readStatTables";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { OTHER_CHARACTER_ID } from "#src/services/kit/constants.test";
import { createKitStrike } from "#src/services/kit/createKitStrike.test";
import { createKitTestContext, stepKitSecondsSendingExpiries } from "#src/services/kit/createKitTestContext.test";
import { emitKitEvent } from "#src/services/kit/emitKitEvent";
import { getPassiveKit } from "#src/services/kit/getPassiveKit";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { describe, expect, test } from "vitest";

const statTables = await readStatTables(GAME_DATA_LOCAL_BASE_URL);
const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);

describe(createSongOfDaysPastSetModule, () => {
  const MAX_HEALTH = 10_000;
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  const createCombatant = (characterId: number, kit = KIT): Combatant => {
    const attributes = computeCharacterAttributes([]);
    attributes.maxHealth = MAX_HEALTH;
    return { ascension: 0, attributes, characterId, constellationCount: 0, elementalResonances: [], kit, level: 1 };
  };
  // The team of the wearer, who wears four pieces, and another member, in the party order given. The wearer's kit hears
  // Every event the team sends, and the other member's kit is the Traveler's, which carries no set
  const createTeam = (characterIds: number[]) => {
    const wearer = createCombatant(
      TRAVELER_CHARACTER_ID,
      getPassiveKit(KIT, [
        createSongOfDaysPastSetModule(getArtifactSetBonus(statTables, SONG_OF_DAYS_PAST_ARTIFACT_SET_ID, 4)),
      ]),
    );
    const other = createCombatant(OTHER_CHARACTER_ID);
    const kitEffectState: KitEffectState = { effects: [] };
    const party = createParty(characterIds);
    const characterIdCombatantMap = new Map([
      [OTHER_CHARACTER_ID, other],
      [TRAVELER_CHARACTER_ID, wearer],
    ]);
    const context = createKitTestContext(wearer, { characterIdCombatantMap, kitEffectState, party });
    // A heal of the given share of the wearer's Max HP by the given member, as the party records it
    const heal = (healthShare: number, sourceCharacterId: number) => {
      emitKitEvent(
        {
          bondOfLifeShare: 0,
          characterId: TRAVELER_CHARACTER_ID,
          healthShare,
          isFallRefused: false,
          kind: KitEventKind.HealthChanged,
          overflowHealthShare: 0,
          sourceCharacterId,
        },
        context,
      );
    };
    // The step of the team's effects, each expired effect sent as the step ends it
    const stepSeconds = (seconds: number) => {
      stepKitSecondsSendingExpiries(context, seconds);
    };
    // The flat base damage a strike by the given member adds as it is priced, read from the hook that prices it: the
    // Wearer's own hook for its own strike, and the party hook it lends the others
    const priceStrike = (striker: Combatant, attackTag: AttackTag) => {
      const strike = createKitStrike(striker, attackTag);
      if (striker.characterId === wearer.characterId)
        return (
          wearer.kit.getStrikeAdditiveBaseDamageBonus?.(
            strike,
            enemy,
            party,
            kitEffectState.effects,
            characterIdCombatantMap,
          ) ?? 0
        );
      return (
        wearer.kit.getPartyStrikeBonus?.(wearer, strike, enemy, party, kitEffectState.effects, characterIdCombatantMap)
          ?.additiveBaseDamageBonus ?? 0
      );
    };
    // A hit the striker lands on the enemy, priced first and then sent to the team as it lands
    const land = (striker: Combatant, attackTag: AttackTag) => {
      const bonus = priceStrike(striker, attackTag);
      emitKitEvent({ attackTag, element: undefined, enemy, kind: KitEventKind.EnemyHit, striker }, context);
      return bonus;
    };
    return { heal, land, other, priceStrike, stepSeconds, wearer };
  };

  test("a heal its wearer gives opens a Yearning that records it, and the Waves stage it leads to adds 8% of the record to the active member's next hits", () => {
    expect.hasAssertions();

    const { heal, other, priceStrike, stepSeconds } = createTeam([OTHER_CHARACTER_ID, TRAVELER_CHARACTER_ID]);
    heal(0.2, TRAVELER_CHARACTER_ID);
    stepSeconds(6.5);

    expect(priceStrike(other, AttackTag.NormalAttack)).toBeCloseTo(0.08 * 0.2 * MAX_HEALTH);
  });

  test("a heal another member gives opens no Yearning, so no Waves stage follows", () => {
    expect.hasAssertions();

    const { heal, other, priceStrike, stepSeconds } = createTeam([OTHER_CHARACTER_ID, TRAVELER_CHARACTER_ID]);
    heal(0.2, OTHER_CHARACTER_ID);
    stepSeconds(6.5);

    expect(priceStrike(other, AttackTag.NormalAttack)).toBe(0);
  });

  test("the Yearning records the heals of its window up to 15,000 HP, and no more", () => {
    expect.hasAssertions();

    const { heal, other, priceStrike, stepSeconds } = createTeam([OTHER_CHARACTER_ID, TRAVELER_CHARACTER_ID]);
    for (let healIndex = 0; healIndex < 4; healIndex++) {
      heal(0.5, TRAVELER_CHARACTER_ID);
      stepSeconds(1);
    }
    stepSeconds(2.5);

    expect(priceStrike(other, AttackTag.NormalAttack)).toBeCloseTo(0.08 * 15_000);
  });

  test("a Waves stage takes five of the active member's Normal, Charged, Plunging, Skill and Burst hits, each adding the same share, and then none", () => {
    expect.hasAssertions();

    const { heal, land, other, stepSeconds } = createTeam([OTHER_CHARACTER_ID, TRAVELER_CHARACTER_ID]);
    heal(0.2, TRAVELER_CHARACTER_ID);
    stepSeconds(6.5);
    const bonuses = [
      AttackTag.NormalAttack,
      AttackTag.ChargedAttack,
      AttackTag.PlungingAttack,
      AttackTag.ElementalSkill,
      AttackTag.ElementalBurst,
      AttackTag.NormalAttack,
    ].map((attackTag) => land(other, attackTag));

    const share = 0.08 * 0.2 * MAX_HEALTH;
    expect(bonuses.slice(0, 5)).toStrictEqual([share, share, share, share, share]);
    expect(bonuses[5]).toBe(0);
  });

  test("a Waves stage ends ten seconds after its Yearning does, and adds nothing past that", () => {
    expect.hasAssertions();

    const { heal, other, priceStrike, stepSeconds } = createTeam([OTHER_CHARACTER_ID, TRAVELER_CHARACTER_ID]);
    heal(0.2, TRAVELER_CHARACTER_ID);
    stepSeconds(15);
    expect(priceStrike(other, AttackTag.NormalAttack)).toBeCloseTo(0.08 * 0.2 * MAX_HEALTH);

    stepSeconds(2);
    expect(priceStrike(other, AttackTag.NormalAttack)).toBe(0);
  });

  test("a Waves stage adds to the active member's hits only, the wearer's own included while it is the active member", () => {
    expect.hasAssertions();

    const { heal, other, priceStrike, stepSeconds, wearer } = createTeam([TRAVELER_CHARACTER_ID, OTHER_CHARACTER_ID]);
    heal(0.2, TRAVELER_CHARACTER_ID);
    stepSeconds(6.5);

    expect(priceStrike(other, AttackTag.NormalAttack)).toBe(0);
    expect(priceStrike(wearer, AttackTag.NormalAttack)).toBeCloseTo(0.08 * 0.2 * MAX_HEALTH);
  });
});
