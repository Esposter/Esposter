import type { KitContext } from "#src/models/kit/KitContext";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { NIGHTTIME_WHISPERS_IN_THE_ECHOING_WOODS_ARTIFACT_SET_ID } from "#src/services/artifact/constants";
import { createNighttimeWhispersInTheEchoingWoodsSetModule } from "#src/services/artifact/sets/createNighttimeWhispersInTheEchoingWoodsSetModule";
import { getArtifactSetBonus } from "#src/services/artifact/sets/getArtifactSetBonus.test";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { readStatTables } from "#src/services/character/readStatTables";
import { OTHER_CHARACTER_ID } from "#src/services/kit/constants.test";
import { createCharacterSwapped } from "#src/services/kit/createCharacterSwapped.test";
import { createKitCombatant } from "#src/services/kit/createKitCombatant.test";
import { createKitTestContext, stepKitSecondsSendingExpiries } from "#src/services/kit/createKitTestContext.test";
import { castKitShield } from "#src/services/kit/effects/castKitShield";
import { emitKitEvent } from "#src/services/kit/emitKitEvent";
import { getPassiveKit } from "#src/services/kit/getPassiveKit";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { MOONDRIFT_SECONDS } from "#src/services/party/constants";
import { createParty } from "#src/services/party/createParty";
import { describe, expect, test } from "vitest";

const statTables = await readStatTables(GAME_DATA_LOCAL_BASE_URL);
const KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const useSkill = (context: KitContext) => {
  emitKitEvent({ characterId: TRAVELER_CHARACTER_ID, kind: KitEventKind.SkillUsed }, context);
};
// A Crystallize shield the other member's reaction left, picked up by the team, lasting the given seconds
const pickUpCrystallizeShield = (context: KitContext, secondsRemaining = 15) =>
  castKitShield(context, OTHER_CHARACTER_ID, { health: 1, isCrystallize: true, secondsRemaining });
const swapToOther = (context: KitContext) => {
  context.party.activeIndex = 1;
  emitKitEvent(createCharacterSwapped(OTHER_CHARACTER_ID, TRAVELER_CHARACTER_ID), context);
};

describe(createNighttimeWhispersInTheEchoingWoodsSetModule, () => {
  const bonus = getArtifactSetBonus(statTables, NIGHTTIME_WHISPERS_IN_THE_ECHOING_WOODS_ARTIFACT_SET_ID, 4);

  const wearer = createKitCombatant(
    TRAVELER_CHARACTER_ID,
    getPassiveKit(KIT, [createNighttimeWhispersInTheEchoingWoodsSetModule(bonus)]),
  );
  const other = createKitCombatant(OTHER_CHARACTER_ID, KIT);
  // The team of the wearer, on the field, and another member
  const createContext = (): KitContext =>
    createKitTestContext(wearer, {
      characterIdCombatantMap: new Map([
        [OTHER_CHARACTER_ID, other],
        [TRAVELER_CHARACTER_ID, wearer],
      ]),
      party: createParty([TRAVELER_CHARACTER_ID, OTHER_CHARACTER_ID]),
    });
  // The Geo DMG Bonus the set gives its wearer as its hits are priced
  const readGeoDamageBonus = ({ kitEffectState }: KitContext): number =>
    (wearer.kit.getPassiveBonuses?.(wearer, 1, [], kitEffectState.effects) ?? [])
      .filter(({ attribute }) => attribute === Attribute.GeoDamageBonus)
      .reduce((sum, { amount }) => sum + amount, 0);

  test("its wearer's skill gives a 20% Geo DMG Bonus for 10 seconds", () => {
    expect.hasAssertions();

    const context = createContext();
    useSkill(context);
    const geoDamageBonus = readGeoDamageBonus(context);
    stepKitSecondsSendingExpiries(context, 10.1);

    expect(geoDamageBonus).toBeCloseTo(0.2);
    expect(readGeoDamageBonus(context)).toBe(0);
  });

  test("a Crystallize shield the team picks up with the wearer on the field raises it by 150%", () => {
    expect.hasAssertions();

    const context = createContext();
    useSkill(context);
    pickUpCrystallizeShield(context);

    expect(readGeoDamageBonus(context)).toBeCloseTo(0.5);
  });

  test("the raise disappears 1 second after that shield is lost", () => {
    expect.hasAssertions();

    const context = createContext();
    useSkill(context);
    pickUpCrystallizeShield(context, 3);
    stepKitSecondsSendingExpiries(context, 3.9);
    const geoDamageBonusWithinSecond = readGeoDamageBonus(context);
    stepKitSecondsSendingExpiries(context, 0.2);

    expect(geoDamageBonusWithinSecond).toBeCloseTo(0.5);
    expect(readGeoDamageBonus(context)).toBeCloseTo(0.2);
  });

  test("a Crystallize shield picked up with the wearer off the field does not raise it", () => {
    expect.hasAssertions();

    const context = createContext();
    useSkill(context);
    swapToOther(context);
    pickUpCrystallizeShield(context);

    expect(readGeoDamageBonus(context)).toBeCloseTo(0.2);
  });

  test("the wearer leaving the field under the shield ends the raise 1 second later", () => {
    expect.hasAssertions();

    const context = createContext();
    useSkill(context);
    pickUpCrystallizeShield(context);
    swapToOther(context);
    stepKitSecondsSendingExpiries(context, 0.9);
    const geoDamageBonusWithinSecond = readGeoDamageBonus(context);
    stepKitSecondsSendingExpiries(context, 0.2);

    expect(geoDamageBonusWithinSecond).toBeCloseTo(0.5);
    expect(readGeoDamageBonus(context)).toBeCloseTo(0.2);
  });

  test("a Moondrift near the wearer on the field raises it until the check after it is gone", () => {
    expect.hasAssertions();

    const context = createContext();
    context.party.lunarCrystallize.moondrifts.push({ position: { x: 1, z: 0 }, secondsRemaining: MOONDRIFT_SECONDS });
    useSkill(context);
    stepKitSecondsSendingExpiries(context, 0.1);
    const geoDamageBonusNearMoondrift = readGeoDamageBonus(context);
    context.party.lunarCrystallize.moondrifts.length = 0;
    stepKitSecondsSendingExpiries(context, 2.1);

    expect(geoDamageBonusNearMoondrift).toBeCloseTo(0.5);
    expect(readGeoDamageBonus(context)).toBeCloseTo(0.2);
  });
});
