import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitEvent } from "#src/models/kit/KitEvent";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { VERMILLION_HEREAFTER_ARTIFACT_SET_ID } from "#src/services/artifact/constants";
import { createVermillionHereafterSetModule } from "#src/services/artifact/sets/createVermillionHereafterSetModule";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { readStatTables } from "#src/services/character/readStatTables";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { emitKitEvent } from "#src/services/kit/emitKitEvent";
import { getPassiveKit } from "#src/services/kit/getPassiveKit";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { stepKitEffects } from "#src/services/kit/effects/stepKitEffects";
import { createParty } from "#src/services/party/createParty";
import { FIXED_STEP_SECONDS } from "#src/services/constants";
import { assert, describe, expect, test } from "vitest";

const statTables = await readStatTables(GAME_DATA_LOCAL_BASE_URL);
const KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const OTHER_CHARACTER_ID = 2;
const bonusOf = (pieceCount: number) => {
  const bonus = statTables.artifactSetDataMap
    .get(VERMILLION_HEREAFTER_ARTIFACT_SET_ID)
    ?.bonuses.find((b) => b.pieceCount === pieceCount);
  assert.exists(bonus);
  return bonus;
};
const createWearer = (): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([]),
  characterId: TRAVELER_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: getPassiveKit(KIT, [createVermillionHereafterSetModule(bonusOf(4))]),
  level: 1,
});
const createHpDecrease = (): KitEvent => ({
  bondOfLifeShare: 0,
  characterId: TRAVELER_CHARACTER_ID,
  healthShare: -0.1,
  isFallRefused: false,
  kind: KitEventKind.HealthChanged,
  overflowHealthShare: 0,
});
// The ATK share the wearer's kit adds as it stands
const getAttackBonus = (wearer: Combatant, kitEffectState: KitEffectState): number =>
  (wearer.kit.getPassiveBonuses?.(wearer, 1, [], kitEffectState.effects) ?? [])
    .filter((bonus) => bonus.attribute === Attribute.AttackPercent)
    .reduce((sum, bonus) => sum + bonus.amount, 0);
// The seconds stepped one step at a time, each step's expired effects sent to the team as the world sends them
const stepKitSecondsEmittingExpiries = (context: ReturnType<typeof createKitTestContext>, seconds: number) => {
  for (let stepIndex = 0; stepIndex < Math.round(seconds / FIXED_STEP_SECONDS); stepIndex++) {
    stepKitEffects(FIXED_STEP_SECONDS, context);
    for (const effect of context.expiredEffects) emitKitEvent({ effect, kind: KitEventKind.EffectExpired }, context);
  }
};

describe(createVermillionHereafterSetModule, () => {
  test("a burst gives Nascent Light, ATK +8% for 16 seconds", () => {
    expect.hasAssertions();

    const wearer = createWearer();
    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wearer, { kitEffectState, party: createParty([TRAVELER_CHARACTER_ID]) });

    emitKitEvent({ characterId: TRAVELER_CHARACTER_ID, energyCost: 40, kind: KitEventKind.BurstUsed }, context);
    expect(getAttackBonus(wearer, kitEffectState)).toBeCloseTo(0.08);

    stepKitSeconds(context, 15.9);
    expect(getAttackBonus(wearer, kitEffectState)).toBeCloseTo(0.08);

    stepKitSeconds(context, 0.3);
    expect(getAttackBonus(wearer, kitEffectState)).toBe(0);
  });

  test("each HP decrease adds 10% ATK, up to four, no more than once every 0.8 seconds, and the increases end with Nascent Light", () => {
    expect.hasAssertions();

    const wearer = createWearer();
    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wearer, { kitEffectState, party: createParty([TRAVELER_CHARACTER_ID]) });

    // Before any burst there is no Nascent Light for a decrease to add to
    emitKitEvent(createHpDecrease(), context);
    expect(getAttackBonus(wearer, kitEffectState)).toBe(0);

    emitKitEvent({ characterId: TRAVELER_CHARACTER_ID, energyCost: 40, kind: KitEventKind.BurstUsed }, context);
    emitKitEvent(createHpDecrease(), context);
    emitKitEvent(createHpDecrease(), context);
    expect(getAttackBonus(wearer, kitEffectState)).toBeCloseTo(0.18);

    for (let stacks = 0; stacks < 4; stacks++) {
      stepKitSeconds(context, 0.9);
      emitKitEvent(createHpDecrease(), context);
    }
    expect(getAttackBonus(wearer, kitEffectState)).toBeCloseTo(0.48);

    stepKitSecondsEmittingExpiries(context, 13);
    expect(getAttackBonus(wearer, kitEffectState)).toBe(0);
  });

  test("a second burst dispels the first Nascent Light and its increases", () => {
    expect.hasAssertions();

    const wearer = createWearer();
    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wearer, { kitEffectState, party: createParty([TRAVELER_CHARACTER_ID]) });

    emitKitEvent({ characterId: TRAVELER_CHARACTER_ID, energyCost: 40, kind: KitEventKind.BurstUsed }, context);
    stepKitSeconds(context, 1);
    emitKitEvent(createHpDecrease(), context);
    stepKitSeconds(context, 1);
    emitKitEvent(createHpDecrease(), context);
    expect(getAttackBonus(wearer, kitEffectState)).toBeCloseTo(0.28);

    emitKitEvent({ characterId: TRAVELER_CHARACTER_ID, energyCost: 40, kind: KitEventKind.BurstUsed }, context);
    expect(getAttackBonus(wearer, kitEffectState)).toBeCloseTo(0.08);
  });

  test("the wearer leaving the field dispels Nascent Light and its increases", () => {
    expect.hasAssertions();

    const wearer = createWearer();
    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wearer, {
      kitEffectState,
      party: createParty([TRAVELER_CHARACTER_ID, OTHER_CHARACTER_ID]),
    });

    emitKitEvent({ characterId: TRAVELER_CHARACTER_ID, energyCost: 40, kind: KitEventKind.BurstUsed }, context);
    emitKitEvent(createHpDecrease(), context);
    expect(getAttackBonus(wearer, kitEffectState)).toBeCloseTo(0.18);

    emitKitEvent(
      {
        characterId: OTHER_CHARACTER_ID,
        kind: KitEventKind.CharacterSwapped,
        previousCharacterId: TRAVELER_CHARACTER_ID,
      },
      context,
    );
    expect(getAttackBonus(wearer, kitEffectState)).toBe(0);
  });
});
