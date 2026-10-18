import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createDeployedCombatant } from "#src/services/party/createDeployedCombatant.test";
import { createFangsFlyingToAndFroPassiveModule } from "#src/services/weapon/passives/createFangsFlyingToAndFroPassiveModule";
import { describe, expect, test } from "vitest";

const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const createCombatant = (characterId: number, element: Element): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([]),
  characterId,
  constellationCount: 0,
  element,
  elementalResonances: [],
  kit: TRAVELER_KIT,
  level: 1,
});
const wielder = createCombatant(TRAVELER_CHARACTER_ID, Element.Hydro);

describe(createFangsFlyingToAndFroPassiveModule, () => {
  // Fangs Flying To and Fro at its first rank: 20% Max HP for ten seconds after an Elemental Skill, once every fifteen,
  // And another 12% for each Hydro member of the party, 24% at most
  const passiveModule = createFangsFlyingToAndFroPassiveModule([0.15, 0.2, 10, 15, 0.12, 2]);
  const useSkill = (context: KitContext) =>
    passiveModule.onKitEvent?.({ characterId: TRAVELER_CHARACTER_ID, kind: KitEventKind.SkillUsed }, context, wielder);
  // The Max HP percentage the wielder reads on a team of it and members of the given elements
  const readHealthPercent = ({ kitEffectState }: KitContext, teamElements: Element[]) =>
    passiveModule
      .getPassiveBonuses?.(
        wielder,
        1,
        [
          createDeployedCombatant(wielder, { isOnField: true }),
          ...teamElements.map((element, index) =>
            createDeployedCombatant(createCombatant(index + 1, element), { isOnField: false }),
          ),
        ],
        kitEffectState.effects,
      )
      .find(({ attribute }) => attribute === Attribute.HealthPercent)?.amount ?? 0;

  test.each([
    [[Element.Pyro], 0.32],
    [[Element.Hydro, Element.Pyro], 0.44],
    [[Element.Hydro, Element.Hydro, Element.Hydro], 0.44],
  ])("after an Elemental Skill, a team with %j beside the Hydro wielder raises Max HP by %s", (elements, amount) => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    useSkill(context);

    expect(readHealthPercent(context, elements)).toBeCloseTo(amount);
  });

  test("it ends after ten seconds, and a skill within fifteen seconds of its start does not renew it", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    useSkill(context);
    stepKitSeconds(context, 9.9);
    useSkill(context);
    const beforeEnd = readHealthPercent(context, []);
    stepKitSeconds(context, 0.2);

    expect(beforeEnd).toBeCloseTo(0.32);
    expect(readHealthPercent(context, [])).toBe(0);
  });
});
