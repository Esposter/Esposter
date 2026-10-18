import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { HUSK_OF_OPULENT_DREAMS_ARTIFACT_SET_ID } from "#src/services/artifact/constants";
import { createHuskOfOpulentDreamsSetModule } from "#src/services/artifact/sets/createHuskOfOpulentDreamsSetModule";
import { getArtifactSetBonus } from "#src/services/artifact/sets/getArtifactSetBonus.test";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { readStatTables } from "#src/services/character/readStatTables";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { emitKitEvent } from "#src/services/kit/emitKitEvent";
import { getPassiveKit } from "#src/services/kit/getPassiveKit";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { stepKitEffects } from "#src/services/kit/effects/stepKitEffects";
import { createParty } from "#src/services/party/createParty";
import { FIXED_STEP_SECONDS } from "#src/services/constants";
import { describe, expect, test } from "vitest";

const statTables = await readStatTables(GAME_DATA_LOCAL_BASE_URL);
const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const OTHER_CHARACTER_ID = 2;
const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
const createWearer = (characterId = TRAVELER_CHARACTER_ID): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([]),
  characterId,
  constellationCount: 0,
  elementalResonances: [],
  kit: getPassiveKit(KIT, [
    createHuskOfOpulentDreamsSetModule(getArtifactSetBonus(statTables, HUSK_OF_OPULENT_DREAMS_ARTIFACT_SET_ID, 4)),
  ]),
  level: 1,
});
// A hit the given combatant deals of the given element, as the kit sends it
const hitEnemy = (striker: Combatant, element: Element, context: KitContext) =>
  emitKitEvent(
    {
      enemy,
      hit: { ...KIT.plungeCollision, element },
      isCritical: false,
      isDefeated: false,
      kind: KitEventKind.DamageTaken,
      striker,
    },
    context,
  );
// The DEF and Geo DMG shares the wearer's kit adds as it stands
const getBonuses = (wearer: Combatant, kitEffectState: KitEffectState) => {
  const bonuses = wearer.kit.getPassiveBonuses?.(wearer, 1, [], kitEffectState.effects) ?? [];
  const sumOf = (attribute: Attribute) =>
    bonuses.filter((bonus) => bonus.attribute === attribute).reduce((sum, bonus) => sum + bonus.amount, 0);
  return { defense: sumOf(Attribute.DefensePercent), geo: sumOf(Attribute.GeoDamageBonus) };
};
// The kit's steps as the world runs them: the team's effects step and their expiries are heard, one step at a time
const stepHuskSeconds = (context: KitContext, seconds: number) => {
  for (let stepIndex = 0; stepIndex < Math.round(seconds / FIXED_STEP_SECONDS); stepIndex++) {
    stepKitEffects(FIXED_STEP_SECONDS, context);
    for (const effect of context.expiredEffects) emitKitEvent({ effect, kind: KitEventKind.EffectExpired }, context);
  }
};
const swapOff = (wearer: Combatant, context: KitContext, to = OTHER_CHARACTER_ID) =>
  emitKitEvent(
    { characterId: to, kind: KitEventKind.CharacterSwapped, previousCharacterId: wearer.characterId },
    context,
  );

describe(createHuskOfOpulentDreamsSetModule, () => {
  test("each Geo hit the wearer lands on the field adds a stack of 6% DEF and Geo DMG, up to four", () => {
    expect.hasAssertions();

    const wearer = createWearer();
    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wearer, { kitEffectState, party: createParty([TRAVELER_CHARACTER_ID]) });

    hitEnemy(wearer, Element.Geo, context);
    expect(getBonuses(wearer, kitEffectState)).toEqual({ defense: expect.closeTo(0.06), geo: expect.closeTo(0.06) });

    for (const stacks of [2, 3, 4, 4]) {
      stepHuskSeconds(context, 0.35);
      hitEnemy(wearer, Element.Geo, context);
      expect(getBonuses(wearer, kitEffectState)).toEqual({
        defense: expect.closeTo(0.06 * stacks),
        geo: expect.closeTo(0.06 * stacks),
      });
    }
  });

  test("a hit inside 0.3 seconds of the last stack gained adds none, and so does a hit that is not Geo or another character's", () => {
    expect.hasAssertions();

    const wearer = createWearer();
    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wearer, { kitEffectState, party: createParty([TRAVELER_CHARACTER_ID]) });

    hitEnemy(wearer, Element.Geo, context);
    hitEnemy(wearer, Element.Geo, context);
    expect(getBonuses(wearer, kitEffectState).defense).toBeCloseTo(0.06);

    stepHuskSeconds(context, 0.35);
    hitEnemy(wearer, Element.Hydro, context);
    expect(getBonuses(wearer, kitEffectState).defense).toBeCloseTo(0.06);

    hitEnemy(createWearer(OTHER_CHARACTER_ID), Element.Geo, context);
    expect(getBonuses(wearer, kitEffectState).defense).toBeCloseTo(0.06);
  });

  test("a stack is lost each six seconds after the last one gained, and each gain restarts the six", () => {
    expect.hasAssertions();

    const wearer = createWearer();
    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wearer, { kitEffectState, party: createParty([TRAVELER_CHARACTER_ID]) });

    hitEnemy(wearer, Element.Geo, context);
    stepHuskSeconds(context, 0.35);
    hitEnemy(wearer, Element.Geo, context);

    stepHuskSeconds(context, 5.9);
    expect(getBonuses(wearer, kitEffectState).defense).toBeCloseTo(0.12);

    stepHuskSeconds(context, 0.2);
    expect(getBonuses(wearer, kitEffectState).defense).toBeCloseTo(0.06);

    stepHuskSeconds(context, 5.8);
    expect(getBonuses(wearer, kitEffectState).defense).toBeCloseTo(0.06);

    stepHuskSeconds(context, 0.2);
    expect(getBonuses(wearer, kitEffectState).defense).toBe(0);
  });

  test("a wearer off the field gains a stack every three seconds after it leaves, up to four", () => {
    expect.hasAssertions();

    const wearer = createWearer();
    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wearer, {
      characterIdCombatantMap: new Map([
        [TRAVELER_CHARACTER_ID, wearer],
        [OTHER_CHARACTER_ID, createWearer(OTHER_CHARACTER_ID)],
      ]),
      kitEffectState,
      party: createParty([OTHER_CHARACTER_ID, TRAVELER_CHARACTER_ID]),
    });

    swapOff(wearer, context);
    for (const stacks of [1, 2, 3, 4, 4]) {
      stepHuskSeconds(context, 3.1);
      expect(getBonuses(wearer, kitEffectState).defense).toBeCloseTo(0.06 * stacks);
    }
  });

  test("a wearer that starts the battle off the field gains its first stack three seconds in", () => {
    expect.hasAssertions();

    const wearer = createWearer();
    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wearer, {
      characterIdCombatantMap: new Map([
        [TRAVELER_CHARACTER_ID, wearer],
        [OTHER_CHARACTER_ID, createWearer(OTHER_CHARACTER_ID)],
      ]),
      kitEffectState,
      party: createParty([OTHER_CHARACTER_ID, TRAVELER_CHARACTER_ID]),
    });

    emitKitEvent({ characterId: OTHER_CHARACTER_ID, kind: KitEventKind.CharacterSwapped }, context);
    stepHuskSeconds(context, 2.9);
    expect(getBonuses(wearer, kitEffectState).defense).toBe(0);

    stepHuskSeconds(context, 0.2);
    expect(getBonuses(wearer, kitEffectState).defense).toBeCloseTo(0.06);
  });

  test("a wearer back on the field before its three seconds run out gains nothing from them", () => {
    expect.hasAssertions();

    const wearer = createWearer();
    const otherWearer = createWearer(OTHER_CHARACTER_ID);
    const characterIdCombatantMap = new Map([
      [TRAVELER_CHARACTER_ID, wearer],
      [OTHER_CHARACTER_ID, otherWearer],
    ]);
    const kitEffectState: KitEffectState = { effects: [] };
    const awayContext = createKitTestContext(otherWearer, {
      characterIdCombatantMap,
      kitEffectState,
      party: createParty([OTHER_CHARACTER_ID, TRAVELER_CHARACTER_ID]),
    });
    const backContext = createKitTestContext(wearer, {
      characterIdCombatantMap,
      kitEffectState,
      party: createParty([TRAVELER_CHARACTER_ID, OTHER_CHARACTER_ID]),
    });

    swapOff(wearer, awayContext);
    stepHuskSeconds(awayContext, 1);
    emitKitEvent(
      {
        characterId: TRAVELER_CHARACTER_ID,
        kind: KitEventKind.CharacterSwapped,
        previousCharacterId: OTHER_CHARACTER_ID,
      },
      backContext,
    );
    stepHuskSeconds(backContext, 3.1);
    expect(getBonuses(wearer, kitEffectState).defense).toBe(0);
  });
});
