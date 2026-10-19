import type { ReactionType } from "#src/models/combat/ReactionType";
import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { LunarReactionType } from "#src/models/combat/LunarReactionType";
import { TransformativeReactionType } from "#src/models/combat/TransformativeReactionType";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { AUBADE_OF_MORNINGSTAR_AND_MOON_ARTIFACT_SET_ID } from "#src/services/artifact/constants";
import { createAubadeOfMorningstarAndMoonSetModule } from "#src/services/artifact/sets/createAubadeOfMorningstarAndMoonSetModule";
import { getArtifactSetBonus } from "#src/services/artifact/sets/getArtifactSetBonus.test";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { readStatTables } from "#src/services/character/readStatTables";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
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
const OTHER_CHARACTER_ID = 2;
const THIRD_CHARACTER_ID = 3;
const FOURTH_CHARACTER_ID = 4;
// A Moonsign character's kit, which counts toward the team's Moonsign level
const MOONSIGN_KIT: Kit = { ...KIT, moonsignBenediction: { lunarReactionTypes: [] } };
const createCombatant = (characterId: number, kit = KIT): Combatant => {
  const attributes = computeCharacterAttributes([]);
  return { ascension: 0, attributes, characterId, constellationCount: 0, elementalResonances: [], kit, level: 1 };
};
// A wearer of four pieces, the three other members, and the party in the order given, with the members in benedictedIds
// Carrying a Moonsign benediction, which sets the team's Moonsign level
const createTeam = (characterIds: number[], benedictedIds: number[] = []) => {
  const wearer = createCombatant(
    TRAVELER_CHARACTER_ID,
    getPassiveKit(KIT, [
      createAubadeOfMorningstarAndMoonSetModule(
        getArtifactSetBonus(statTables, AUBADE_OF_MORNINGSTAR_AND_MOON_ARTIFACT_SET_ID, 4),
      ),
    ]),
  );
  const characterIdCombatantMap = new Map<number, Combatant>([[TRAVELER_CHARACTER_ID, wearer]]);
  for (const characterId of [OTHER_CHARACTER_ID, THIRD_CHARACTER_ID, FOURTH_CHARACTER_ID])
    characterIdCombatantMap.set(
      characterId,
      createCombatant(characterId, benedictedIds.includes(characterId) ? MOONSIGN_KIT : KIT),
    );
  const kitEffectState: KitEffectState = { effects: [] };
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  let context = createKitTestContext(wearer, {
    characterIdCombatantMap,
    kitEffectState,
    party: createParty(characterIds),
  });
  // The party after a swap, with the swap's event, which the wearer's kit hears as the battle emits it. A battle's opening has no
  // Character it came from, so the event carries none
  const swap = (nextCharacterIds: number[], characterId: number, previousCharacterId?: number) => {
    context = createKitTestContext(wearer, {
      characterIdCombatantMap,
      kitEffectState,
      party: createParty(nextCharacterIds),
    });
    emitKitEvent(
      {
        characterId,
        kind: KitEventKind.CharacterSwapped,
        ...(previousCharacterId === undefined ? {} : { previousCharacterId }),
      },
      context,
    );
  };
  // The DMG Bonus the whole deployed team's hooks add to a reaction the given member makes, in the party as it stands
  const reactionDamageBonus = (combatant: Combatant, reactionType: ReactionType) =>
    getDeployedReactionBonuses({ combatant, element: undefined, enemy, reactionType }, context).damageBonus;
  const step = (seconds: number) => {
    stepKitSeconds(context, seconds);
  };
  return { reactionDamageBonus, step, swap, wearer };
};

describe(createAubadeOfMorningstarAndMoonSetModule, () => {
  test("while its wearer is off the field, a Lunar Reaction the wearer triggers gets 20% DMG, and another member's Lunar Reaction gets none", () => {
    expect.hasAssertions();

    const { reactionDamageBonus, wearer } = createTeam([OTHER_CHARACTER_ID, TRAVELER_CHARACTER_ID]);
    const other = createCombatant(OTHER_CHARACTER_ID);

    expect(reactionDamageBonus(wearer, LunarReactionType.LunarCharged)).toBeCloseTo(0.2);
    expect(reactionDamageBonus(wearer, LunarReactionType.LunarBloom)).toBeCloseTo(0.2);
    expect(reactionDamageBonus(wearer, TransformativeReactionType.Overloaded)).toBe(0);
    expect(reactionDamageBonus(other, LunarReactionType.LunarCharged)).toBe(0);
  });

  test("at Ascendant Gleam the wearer's Lunar Reaction DMG is raised by a further 40%", () => {
    expect.hasAssertions();

    const { reactionDamageBonus, wearer } = createTeam(
      [OTHER_CHARACTER_ID, TRAVELER_CHARACTER_ID, THIRD_CHARACTER_ID, FOURTH_CHARACTER_ID],
      [THIRD_CHARACTER_ID, FOURTH_CHARACTER_ID],
    );

    expect(reactionDamageBonus(wearer, LunarReactionType.LunarCrystallize)).toBeCloseTo(0.6);
  });

  test("a battle that opens on the wearer raises no window, so its Lunar Reactions get nothing until it is swapped off the field", () => {
    expect.hasAssertions();

    const { reactionDamageBonus, swap, wearer } = createTeam([TRAVELER_CHARACTER_ID, OTHER_CHARACTER_ID]);
    swap([TRAVELER_CHARACTER_ID, OTHER_CHARACTER_ID], TRAVELER_CHARACTER_ID);
    expect(reactionDamageBonus(wearer, LunarReactionType.LunarCharged)).toBe(0);

    swap([OTHER_CHARACTER_ID, TRAVELER_CHARACTER_ID], OTHER_CHARACTER_ID, TRAVELER_CHARACTER_ID);
    expect(reactionDamageBonus(wearer, LunarReactionType.LunarCharged)).toBeCloseTo(0.2);
  });

  test("a swap onto the wearer keeps the bonus for three seconds on the field, and it lapses until the wearer is off the field again", () => {
    expect.hasAssertions();

    const { reactionDamageBonus, step, swap, wearer } = createTeam([OTHER_CHARACTER_ID, TRAVELER_CHARACTER_ID]);
    const lunarBonus = () => reactionDamageBonus(wearer, LunarReactionType.LunarCharged);

    swap([TRAVELER_CHARACTER_ID, OTHER_CHARACTER_ID], TRAVELER_CHARACTER_ID, OTHER_CHARACTER_ID);
    expect(lunarBonus()).toBeCloseTo(0.2);

    step(2);
    expect(lunarBonus()).toBeCloseTo(0.2);

    step(1);
    expect(lunarBonus()).toBe(0);

    swap([OTHER_CHARACTER_ID, TRAVELER_CHARACTER_ID], OTHER_CHARACTER_ID, TRAVELER_CHARACTER_ID);
    expect(lunarBonus()).toBeCloseTo(0.2);
  });
});
