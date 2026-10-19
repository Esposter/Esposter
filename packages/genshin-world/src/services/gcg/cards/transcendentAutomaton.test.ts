import type { GcgSkill } from "#src/models/gcg/GcgSkill";

import { Element } from "#src/models/Element";
import { GcgSkillKind } from "#src/models/gcg/GcgSkillKind";
import {
  BLUSTERING_BLADE_ID,
  TRANSCENDENT_AUTOMATON_ID,
  VERMILLION_HEREAFTER_ID,
  VERMILLION_HEREAFTER_STATUS_ID,
} from "#src/services/gcg/cards/constants";
import { createDuel } from "#src/services/gcg/cards/createDuel.test";
import { createSideState } from "#src/services/gcg/cards/createSideState.test";
import { transcendentAutomaton } from "#src/services/gcg/cards/transcendentAutomaton";
import { vermillionHereafter } from "#src/services/gcg/cards/vermillionHereafter";
import { createGcgCharacterState } from "#src/services/gcg/createGcgCharacterState.test";
import { createGcgZoneCard } from "#src/services/gcg/effects/createGcgZoneCard";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe("transcendentAutomaton", () => {
  const BLUSTERING_BLADE: GcgSkill = {
    costs: [],
    effect: "Effect_Damage_Cryo_1",
    energyGain: 1,
    id: BLUSTERING_BLADE_ID,
    kind: GcgSkillKind.ElementalSkill,
  };

  test("blustering Blade's switch lands Vermillion Hereafter's status on the character switched in", () => {
    expect.hasAssertions();

    const zoneCard = createGcgZoneCard(TRANSCENDENT_AUTOMATON_ID, transcendentAutomaton);
    const duel = createDuel([
      createSideState([
        { ...createGcgCharacterState({ character: { element: Element.Cryo, id: 1 } }), equipments: [zoneCard] },
        {
          ...createGcgCharacterState({ character: { element: Element.Cryo, id: 2 } }),
          equipments: [createGcgZoneCard(VERMILLION_HEREAFTER_ID, vermillionHereafter)],
        },
      ]),
      createSideState([createGcgCharacterState({ character: { element: Element.Cryo, id: 1 } })]),
    ]);
    transcendentAutomaton.onSkillUsed?.({ characterIndex: 0, duel, sideIndex: 0 }, BLUSTERING_BLADE, zoneCard, []);

    const side = takeOne(duel.sides, 0);
    expect({
      activeIndex: side.activeIndex,
      statusIds: side.characters.map(({ statuses }) => statuses.map(({ cardId }) => cardId)),
    }).toStrictEqual({ activeIndex: 1, statusIds: [[], [VERMILLION_HEREAFTER_STATUS_ID]] });
  });
});
