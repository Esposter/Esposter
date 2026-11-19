import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { ReactionType } from "#src/models/combat/ReactionType";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { OTHER_CHARACTER_ID } from "#src/services/kit/constants.test";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { getBuffedCombatant } from "#src/services/kit/effects/getBuffedCombatant";
import { createParty } from "#src/services/party/createParty";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { createBalladOfTheCrossroadsPassiveModule } from "#src/services/weapon/passives/createBalladOfTheCrossroadsPassiveModule";
import { createWielderCombatant } from "#src/services/weapon/passives/createWielderCombatant.test";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);

const readHealthPercent = (context: KitContext, wielder: Combatant): number =>
  getBuffedCombatant(wielder, context.kitEffectState.effects, context.party, context.characterIdCombatantMap).attributes
    .attributeTotalMap[Attribute.HealthPercent];

describe(createBalladOfTheCrossroadsPassiveModule, () => {
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  const party = createParty([TRAVELER_CHARACTER_ID]);
  const wielder = createWielderCombatant();
  const other = { ...wielder, characterId: OTHER_CHARACTER_ID };
  const createLunarTriggered = (striker: Combatant) => ({
    enemy,
    kind: KitEventKind.ReactionTriggered,
    reactions: [{ reactionType: ReactionType.LunarCharged }],
    striker,
  });
  // Ballad of the Crossroads at its first rank: 14 Energy and 14% more Max HP for 12 seconds, and 60% CRIT DMG from the
  // Lunar Reaction DMG the wielder deals while the effect lasts, the energy recovery triggered at most once every 18 seconds
  const passiveModule = createBalladOfTheCrossroadsPassiveModule([0.14, 0.6, 12, 14, 18]);

  test("a Lunar reaction the wielder triggers restores the rank's Energy and raises Max HP for the rank's seconds", () => {
    expect.hasAssertions();

    const context = { ...createKitTestContext(wielder), party: structuredClone(party) };
    passiveModule.onKitEvent?.(createLunarTriggered(wielder), context, wielder);

    expect(getPartyMember(context.party, wielder.characterId).energy).toBe(14);
    expect(readHealthPercent(context, wielder)).toBe(0.14);

    stepKitSeconds(context, 12.1);

    expect(readHealthPercent(context, wielder)).toBe(0);
  });

  test("a Lunar reaction a nearby member triggers raises nothing", () => {
    expect.hasAssertions();

    const context = { ...createKitTestContext(wielder), party: structuredClone(party) };
    passiveModule.onKitEvent?.(createLunarTriggered(other), context, wielder);

    expect(getPartyMember(context.party, wielder.characterId).energy).toBe(0);
    expect(readHealthPercent(context, wielder)).toBe(0);
  });

  test("a second Lunar reaction inside the rank's cooldown restores no Energy", () => {
    expect.hasAssertions();

    const context = { ...createKitTestContext(wielder), party: structuredClone(party) };
    passiveModule.onKitEvent?.(createLunarTriggered(wielder), context, wielder);
    stepKitSeconds(context, 5);
    passiveModule.onKitEvent?.(createLunarTriggered(wielder), context, wielder);

    expect(getPartyMember(context.party, wielder.characterId).energy).toBe(14);
  });

  test("the wielder's Lunar reaction DMG gains the rank's CRIT DMG once it triggers a Lunar reaction", () => {
    expect.hasAssertions();

    const context = { ...createKitTestContext(wielder), party: structuredClone(party) };
    const reaction = { combatant: wielder, enemy, reactionType: ReactionType.LunarBloom };

    expect(passiveModule.getPartyReactionBonus?.(wielder, reaction, context)?.criticalDamageBonus ?? 0).toBe(0);

    passiveModule.onKitEvent?.(createLunarTriggered(wielder), context, wielder);

    expect(passiveModule.getPartyReactionBonus?.(wielder, reaction, context)?.criticalDamageBonus).toBe(0.6);
  });
});
