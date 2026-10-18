import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBuff } from "#src/models/kit/KitBuff";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { createUsedActionTeamBuffSetModule } from "#src/services/artifact/sets/createUsedActionTeamBuffSetModule";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { describe, expect, test } from "vitest";

const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const OTHER_CHARACTER_ID = 2;
const createCombatant = (characterId: number): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([]),
  characterId,
  constellationCount: 0,
  elementalResonances: [],
  kit: TRAVELER_KIT,
  level: 1,
});

describe(createUsedActionTeamBuffSetModule, () => {
  const wearer = createCombatant(TRAVELER_CHARACTER_ID);
  const party = createParty([TRAVELER_CHARACTER_ID, OTHER_CHARACTER_ID]);
  const module = createUsedActionTeamBuffSetModule({
    actions: ["skill", "burst"],
    amount: 0.2,
    attribute: Attribute.IncomingHealingBonus,
    seconds: 10,
    source: "Set",
  });

  test.each([
    ["Elemental Skill", { characterId: TRAVELER_CHARACTER_ID, kind: KitEventKind.SkillUsed }],
    ["Elemental Burst", { characterId: TRAVELER_CHARACTER_ID, energyCost: 40, kind: KitEventKind.BurstUsed }],
  ] as const)("gives every deployed member the buff for its seconds when its wearer uses its %s", (_action, event) => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    module.onKitEvent?.(event, createKitTestContext(wearer, { kitEffectState, party }), wearer);
    expect(
      kitEffectState.effects
        .filter((effect): effect is KitBuff => effect.kind === "buff")
        .map(({ amount, attribute, characterId, secondsRemaining }) => ({
          amount,
          attribute,
          characterId,
          secondsRemaining,
        })),
    ).toStrictEqual([
      {
        amount: 0.2,
        attribute: Attribute.IncomingHealingBonus,
        characterId: TRAVELER_CHARACTER_ID,
        secondsRemaining: 10,
      },
      { amount: 0.2, attribute: Attribute.IncomingHealingBonus, characterId: OTHER_CHARACTER_ID, secondsRemaining: 10 },
    ]);
  });

  test("is not triggered by another member's skill", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    module.onKitEvent?.(
      { characterId: OTHER_CHARACTER_ID, kind: KitEventKind.SkillUsed },
      createKitTestContext(wearer, { kitEffectState, party }),
      wearer,
    );
    expect(kitEffectState.effects).toStrictEqual([]);
  });
});
