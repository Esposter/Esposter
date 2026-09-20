import type { CardedCharacter } from "#src/models/CardedCharacter";
import type { Character } from "#src/models/Character";
import type { Moment } from "#src/models/Moment";
import type { PersonaCard } from "#src/models/PersonaCard";

import { HABIT_SEPARATOR, LORE_PICK_INSTRUCTIONS } from "#src/services/constants";
import { TEST_EPOCH_DATE } from "#src/services/constants.test";
import { getBirthdayNote } from "#src/services/getBirthdayNote";
import { getLorePickRequest } from "#src/services/getLorePickRequest";
import { describe, expect, test } from "vitest";

describe(getLorePickRequest, () => {
  const today = TEST_EPOCH_DATE;
  const nextDay = TEST_EPOCH_DATE.add({ days: 1 });
  // The game spells a birthday month-first and unpadded, which is the shape the request parses
  const birthday = `${nextDay.month}/${nextDay.day}`;
  const moment: Moment = { hour: 0, locale: "locale", timeZone: "timeZone", weekday: "weekday" };
  // Every fact the request states, apart from the birthday it replaces with the note
  const facts = {
    affiliation: "affiliation",
    birthday,
    constellation: "constellation",
    element: "element",
    name: "name",
    region: "region",
    title: "title",
    version: "version",
    weapon: "weapon",
  };
  const character: Character = { ...facts, description: "description" };
  const personaCard: PersonaCard = {
    greeting: "greeting",
    habits: ["", " "],
    signOff: "signOff",
    tips: ["tip"],
    verbs: ["verb"],
  };
  const carded: CardedCharacter = { character, personaCard };
  const uncarded: CardedCharacter = { character: { ...character, name: "uncarded" } };
  const untitled: CardedCharacter = { character: { ...character, description: "", name: "untitled", title: "" } };

  test("describes a carded character by their habits and one without by the game's own line", () => {
    expect.hasAssertions();

    const { questions } = getLorePickRequest([carded, uncarded, untitled], today, moment);

    expect(questions.character).toStrictEqual({
      criteria: {
        name: personaCard.habits.join(HABIT_SEPARATOR),
        uncarded: character.description,
        untitled: null,
      },
      instructions: LORE_PICK_INSTRUCTIONS,
      type: "choice",
    });
  });

  test("states the facts code knows for certain, with the birthday measured from today", () => {
    expect.hasAssertions();

    const { state } = getLorePickRequest([carded], today, moment);

    expect(state).toStrictEqual({
      characters: [{ ...facts, birthday: getBirthdayNote(birthday, today) }],
      today: { date: today.toString(), ...moment },
    });
  });
});
