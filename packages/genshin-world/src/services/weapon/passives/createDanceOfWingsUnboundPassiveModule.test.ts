import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { StellarReactionType } from "#src/models/combat/StellarReactionType";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { OTHER_CHARACTER_ID } from "#src/services/kit/constants.test";
import { createCharacterSwapped } from "#src/services/kit/createCharacterSwapped.test";
import { createKitTestContext, readBuffTuples } from "#src/services/kit/createKitTestContext.test";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { createDanceOfWingsUnboundPassiveModule } from "#src/services/weapon/passives/createDanceOfWingsUnboundPassiveModule";
import { createWielderCombatant } from "#src/services/weapon/passives/createWielderCombatant.test";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const skillUsed = { characterId: TRAVELER_CHARACTER_ID, kind: KitEventKind.SkillUsed };

describe(createDanceOfWingsUnboundPassiveModule, () => {
  const wielder = createWielderCombatant();
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  // Beyond the Chrysalis at its first rank: CRIT DMG 56%, Stellar Swirl DMG 36%, 5 Energy every four seconds, for ten seconds
  const passiveModule = createDanceOfWingsUnboundPassiveModule([0.56, 0.36, 5, 10, 4]);

  test("the first skill use gives the rank's CRIT DMG for its ten seconds", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    passiveModule.onKitEvent?.(skillUsed, context, wielder);

    expect(readBuffTuples(context.kitEffectState.effects)).toStrictEqual([[Attribute.CriticalDamage, 0.56, 10]]);
  });

  test("the second use gives the rank's Stellar Swirl DMG, and no other Stellar reaction is raised", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    passiveModule.onKitEvent?.(skillUsed, context, wielder);
    passiveModule.onKitEvent?.(skillUsed, context, wielder);

    expect(
      passiveModule.getPartyReactionBonus?.(
        wielder,
        { combatant: wielder, enemy, reactionType: StellarReactionType.StellarSwirl },
        context,
      ),
    ).toStrictEqual({ damageBonus: 0.36 });
    expect(
      passiveModule.getPartyReactionBonus?.(
        wielder,
        { combatant: wielder, enemy, reactionType: StellarReactionType.StellarConduct },
        context,
      ),
    ).toStrictEqual({});
  });

  test("the third use regenerates the rank's Energy, and a sixth within four seconds of it regenerates none", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    const startingEnergy = getPartyMember(context.party, TRAVELER_CHARACTER_ID).energy;
    for (let useIndex = 0; useIndex < 3; useIndex++) passiveModule.onKitEvent?.(skillUsed, context, wielder);
    const afterThirdUse = getPartyMember(context.party, TRAVELER_CHARACTER_ID).energy;
    for (let useIndex = 0; useIndex < 3; useIndex++) passiveModule.onKitEvent?.(skillUsed, context, wielder);

    expect(afterThirdUse - startingEnergy).toBe(5);
    expect(getPartyMember(context.party, TRAVELER_CHARACTER_ID).energy - startingEnergy).toBe(5);
  });

  test("leaving the field resets the sequence, so the next use is the first effect again", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    passiveModule.onKitEvent?.(skillUsed, context, wielder);
    passiveModule.onKitEvent?.(createCharacterSwapped(OTHER_CHARACTER_ID, TRAVELER_CHARACTER_ID), context, wielder);
    passiveModule.onKitEvent?.(skillUsed, context, wielder);

    expect(
      passiveModule.getPartyReactionBonus?.(
        wielder,
        { combatant: wielder, enemy, reactionType: StellarReactionType.StellarSwirl },
        context,
      ),
    ).toStrictEqual({});
  });
});
