import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { LunarReactionType } from "#src/models/combat/LunarReactionType";
import { ReactionType } from "#src/models/combat/ReactionType";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { SILKEN_MOON_SERENADE_ARTIFACT_SET_ID } from "#src/services/artifact/constants";
import { createSilkenMoonsSerenadeSetModule } from "#src/services/artifact/sets/createSilkenMoonsSerenadeSetModule";
import { getArtifactSetBonus } from "#src/services/artifact/sets/getArtifactSetBonus.test";
import { getBuffAmounts } from "#src/services/artifact/sets/getBuffAmounts.test";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { readStatTables } from "#src/services/character/readStatTables";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { OTHER_CHARACTER_ID, THIRD_CHARACTER_ID } from "#src/services/kit/constants.test";
import { createKitCombatant } from "#src/services/kit/createKitCombatant.test";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { emitKitEvent } from "#src/services/kit/emitKitEvent";
import { getDeployedReactionBonuses } from "#src/services/kit/getDeployedReactionBonuses";
import { getPassiveKit } from "#src/services/kit/getPassiveKit";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { describe, expect, test } from "vitest";

const statTables = await readStatTables(GAME_DATA_LOCAL_BASE_URL);
const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
describe(createSilkenMoonsSerenadeSetModule, () => {
  const FOURTH_CHARACTER_ID = 4;
  // A Moonsign character's kit, which counts toward the team's Moonsign level
  const MOONSIGN_KIT: Kit = { ...KIT, moonsignBenediction: { lunarReactionTypes: [] } };
  // The wearer, who wears four pieces, and the other members in the map, the ones in benedictedIds carrying a Moonsign benediction
  const createTeam = (characterIds: number[], benedictedIds: number[] = []) => {
    const wearer = createKitCombatant(
      TRAVELER_CHARACTER_ID,
      getPassiveKit(KIT, [
        createSilkenMoonsSerenadeSetModule(getArtifactSetBonus(statTables, SILKEN_MOON_SERENADE_ARTIFACT_SET_ID, 4)),
      ]),
    );
    const createMember = (characterId: number) =>
      createKitCombatant(characterId, benedictedIds.includes(characterId) ? MOONSIGN_KIT : KIT);
    const other = createMember(OTHER_CHARACTER_ID);
    const characterIdCombatantMap = new Map<number, Combatant>([
      [FOURTH_CHARACTER_ID, createMember(FOURTH_CHARACTER_ID)],
      [OTHER_CHARACTER_ID, other],
      [THIRD_CHARACTER_ID, createMember(THIRD_CHARACTER_ID)],
      [TRAVELER_CHARACTER_ID, wearer],
    ]);
    const kitEffectState: KitEffectState = { effects: [] };
    const party = createParty(characterIds);
    const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
    const context = createKitTestContext(wearer, { characterIdCombatantMap, kitEffectState, party });
    // A hit the striker lands on the enemy, dealt as the element given, if it deals one
    const hit = (striker: Combatant, element: Element | undefined) => {
      emitKitEvent({ element, enemy, kind: KitEventKind.EnemyHit, striker }, context);
    };
    // The DMG Bonus the whole deployed team's hooks add to a reaction the given member makes
    const teamReactionDamageBonus = (combatant: Combatant, reactionType: ReactionType) =>
      getDeployedReactionBonuses({ combatant, element: undefined, enemy, reactionType }, context).damageBonus;
    return { context, hit, other, teamReactionDamageBonus, wearer };
  };

  test("an Elemental DMG hit the wearer deals gives every party member 60 Elemental Mastery for eight seconds at Nascent Gleam, restarted rather than stacked", () => {
    expect.hasAssertions();

    const { context, hit, wearer } = createTeam(
      [TRAVELER_CHARACTER_ID, OTHER_CHARACTER_ID, THIRD_CHARACTER_ID],
      [THIRD_CHARACTER_ID],
    );

    hit(wearer, Element.Pyro);
    hit(wearer, Element.Pyro);
    expect(getBuffAmounts(context.kitEffectState, Attribute.ElementalMastery)).toStrictEqual([60, 60, 60]);

    stepKitSeconds(context, 7);
    expect(getBuffAmounts(context.kitEffectState, Attribute.ElementalMastery)).toStrictEqual([60, 60, 60]);

    stepKitSeconds(context, 1);
    expect(getBuffAmounts(context.kitEffectState, Attribute.ElementalMastery)).toStrictEqual([]);
  });

  test("the same hit gives 120 Elemental Mastery at Ascendant Gleam", () => {
    expect.hasAssertions();

    const { context, hit, wearer } = createTeam(
      [TRAVELER_CHARACTER_ID, OTHER_CHARACTER_ID, THIRD_CHARACTER_ID, FOURTH_CHARACTER_ID],
      [THIRD_CHARACTER_ID, FOURTH_CHARACTER_ID],
    );

    hit(wearer, Element.Hydro);

    expect(getBuffAmounts(context.kitEffectState, Attribute.ElementalMastery)).toStrictEqual([120, 120, 120, 120]);
  });

  test("a hit that deals no element, or one another member deals, gives no Elemental Mastery", () => {
    expect.hasAssertions();

    const { context, hit, other, wearer } = createTeam(
      [TRAVELER_CHARACTER_ID, OTHER_CHARACTER_ID, THIRD_CHARACTER_ID],
      [THIRD_CHARACTER_ID],
    );

    hit(wearer, undefined);
    hit(other, Element.Cryo);

    expect(getBuffAmounts(context.kitEffectState, Attribute.ElementalMastery)).toStrictEqual([]);
  });

  test("the wearer's Elemental DMG gives the effect while it is off the field", () => {
    expect.hasAssertions();

    const { context, hit, wearer } = createTeam(
      [OTHER_CHARACTER_ID, TRAVELER_CHARACTER_ID, THIRD_CHARACTER_ID],
      [THIRD_CHARACTER_ID],
    );

    hit(wearer, Element.Electro);

    expect(getBuffAmounts(context.kitEffectState, Attribute.ElementalMastery)).toStrictEqual([60, 60, 60]);
  });

  test("while the effect lasts, every party member's Lunar Reaction DMG is raised by 10%, with no Moonsign too, and its other reactions are not", () => {
    expect.hasAssertions();

    const { context, hit, other, teamReactionDamageBonus, wearer } = createTeam([
      TRAVELER_CHARACTER_ID,
      OTHER_CHARACTER_ID,
    ]);

    hit(wearer, Element.Geo);

    expect(teamReactionDamageBonus(other, LunarReactionType.LunarCrystallize)).toBeCloseTo(0.1);
    expect(teamReactionDamageBonus(wearer, ReactionType.Quicken)).toBe(0);

    stepKitSeconds(context, 8);
    expect(teamReactionDamageBonus(other, LunarReactionType.LunarCrystallize)).toBe(0);
  });
});
