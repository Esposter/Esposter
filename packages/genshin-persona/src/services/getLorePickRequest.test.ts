import type { CardedCharacter } from "#src/models/CardedCharacter";
import type { Character } from "#src/models/Character";
import type { Moment } from "#src/models/Moment";
import type { PersonaCard } from "#src/models/PersonaCard";

import { LEAP_YEAR, LORE_PICK_INSTRUCTIONS } from "#src/services/constants";
import { getLorePickRequest } from "#src/services/getLorePickRequest";
import { describe, expect, test } from "vitest";

describe(getLorePickRequest, () => {
  const today = Temporal.PlainDate.from({ day: 20, month: 9, year: LEAP_YEAR });
  const moment: Moment = { hour: 13, locale: "en-AU", timeZone: "Australia/Sydney", weekday: "Wednesday" };
  const character: Character = {
    affiliation: "affiliation",
    birthday: "9/21",
    constellation: "constellation",
    description: "description",
    element: "Electro",
    name: "carded",
    region: "region",
    title: "title",
    version: "1.0",
    weapon: "weapon",
  };
  const personaCard: PersonaCard = {
    greeting: "greeting",
    habits: ["one", "two"],
    signOff: "sign-off",
    tips: ["tip"],
    verbs: ["verb"],
    voice: { name: "" },
  };
  const carded: CardedCharacter = { character, personaCard };
  const uncarded: CardedCharacter = { character: { ...character, name: "uncarded" } };
  const bare: CardedCharacter = {
    character: { ...character, birthday: "", description: "", name: "bare", title: "" },
  };

  test("describes a carded character by their habits and one without by the game's own line", () => {
    expect.hasAssertions();

    const { questions } = getLorePickRequest([carded, uncarded, bare], today, moment);

    expect(questions.character).toStrictEqual({
      criteria: { bare: null, carded: "one two", uncarded: "description" },
      instructions: LORE_PICK_INSTRUCTIONS,
      type: "choice",
    });
  });

  test("states the facts code knows for certain, with the birthday measured from today", () => {
    expect.hasAssertions();

    const { state } = getLorePickRequest([carded], today, moment);

    expect(state).toStrictEqual({
      characters: [
        {
          affiliation: "affiliation",
          birthday: "[Birthday: 21 September, tomorrow]",
          constellation: "constellation",
          element: "Electro",
          name: "carded",
          region: "region",
          title: "title",
          version: "1.0",
          weapon: "weapon",
        },
      ],
      today: { date: "2000-09-20", ...moment },
    });
  });
});
