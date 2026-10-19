import type { Combatant } from "#src/models/kit/Combatant";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { castKitShield } from "#src/services/kit/effects/castKitShield";
import { getPassiveKit } from "#src/services/kit/getPassiveKit";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { getBuff } from "#src/services/weapon/passives/createPassiveTestHelpers.test";
import { createPrimordialJadeRegaliaPassiveModule } from "#src/services/weapon/passives/createPrimordialJadeRegaliaPassiveModule";
import { describe, expect, test } from "vitest";

const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);

describe(createPrimordialJadeRegaliaPassiveModule, () => {
  // Primordial Jade Regalia at its first rank: for 3 seconds after its wielder's burst or a shield it casts, 0.3% of
  // Its element's DMG Bonus for each 1,000 Max HP, up to 12%, and 4.5 energy restored
  const passiveModule = createPrimordialJadeRegaliaPassiveModule([0.003, 0.12, 3, 2.5, 4.5]);
  const OTHER_CHARACTER_ID = 1;
  const createWielder = (maxHealth: number): Combatant => ({
    ascension: 0,
    attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: maxHealth }]),
    characterId: TRAVELER_CHARACTER_ID,
    constellationCount: 0,
    element: Element.Hydro,
    elementalResonances: [],
    kit: getPassiveKit(TRAVELER_KIT, [passiveModule]),
    level: 1,
  });
  const createContext = (wielder: Combatant) => {
    const context = createKitTestContext(wielder, { party: createParty([TRAVELER_CHARACTER_ID, OTHER_CHARACTER_ID]) });
    getPartyMember(context.party, TRAVELER_CHARACTER_ID).energy = 0;
    return context;
  };

  test.each([
    ["the wielder casts gives it its Elemental DMG Bonus", TRAVELER_CHARACTER_ID, 0.06],
    ["another member casts gives it nothing", OTHER_CHARACTER_ID, 0],
  ])("a shield %s", (_title, casterCharacterId, damageBonus) => {
    expect.hasAssertions();

    const context = createContext(createWielder(20000));
    castKitShield(context, casterCharacterId, { health: 1, secondsRemaining: 10 });

    expect(getBuff(context.kitEffectState, Attribute.HydroDamageBonus)?.amount ?? 0).toBeCloseTo(damageBonus);
  });

  test.each([
    [20000, 0.06],
    [50000, 0.12],
  ])("the wielder's burst at %s Max HP gives it %s Elemental DMG Bonus", (maxHealth, damageBonus) => {
    expect.hasAssertions();

    const wielder = createWielder(maxHealth);
    const context = createContext(wielder);
    passiveModule.onKitEvent?.(
      { characterId: TRAVELER_CHARACTER_ID, energyCost: 60, kind: KitEventKind.BurstUsed },
      context,
      wielder,
    );

    expect(getBuff(context.kitEffectState, Attribute.HydroDamageBonus)?.amount ?? 0).toBeCloseTo(damageBonus);
  });

  test("the energy is restored once, 142 frames after", () => {
    expect.hasAssertions();

    const context = createContext(createWielder(20000));
    castKitShield(context, TRAVELER_CHARACTER_ID, { health: 1, secondsRemaining: 10 });
    stepKitSeconds(context, 2.3);
    const energyBefore = getPartyMember(context.party, TRAVELER_CHARACTER_ID).energy;
    stepKitSeconds(context, 2);

    expect(energyBefore).toBe(0);
    expect(getPartyMember(context.party, TRAVELER_CHARACTER_ID).energy).toBe(4.5);
  });

  test("a trigger before the energy is restored restarts its wait", () => {
    expect.hasAssertions();

    const context = createContext(createWielder(20000));
    castKitShield(context, TRAVELER_CHARACTER_ID, { health: 1, secondsRemaining: 10 });
    stepKitSeconds(context, 2);
    castKitShield(context, TRAVELER_CHARACTER_ID, { health: 1, secondsRemaining: 10 });
    stepKitSeconds(context, 2);
    const energyBefore = getPartyMember(context.party, TRAVELER_CHARACTER_ID).energy;
    stepKitSeconds(context, 0.5);

    expect(energyBefore).toBe(0);
    expect(getPartyMember(context.party, TRAVELER_CHARACTER_ID).energy).toBe(4.5);
  });
});
