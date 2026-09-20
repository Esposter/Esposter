import type { Character } from "#src/models/Character";
import type { Moment } from "#src/models/Moment";
import type { Today } from "#src/models/Today";

import { LORE_PICK_INSTRUCTIONS } from "#src/services/constants";
import { getLorePickRequest } from "#src/services/getLorePickRequest";
import { describe, expect, test } from "vitest";

describe(getLorePickRequest, () => {
  const today: Today = { isoDate: "2000-09-20", monthDay: { day: 20, month: 9 } };
  const moment: Moment = { hour: 13, locale: "en-AU", timeZone: "Australia/Sydney", weekday: "Wednesday" };
  const described: Character = {
    birthday: "9/21",
    description: "description",
    element: "Electro",
    name: "described",
    region: "region",
    title: "title",
    version: "1.0",
  };
  const untitled: Character = { ...described, birthday: "", description: "", name: "untitled", title: "" };

  test("asks one choice over the roster, each character described by the game's line, and states what code knows", () => {
    expect.hasAssertions();

    expect(getLorePickRequest([described, untitled], today, moment)).toStrictEqual({
      questions: {
        character: {
          criteria: { described: "description", untitled: null },
          instructions: LORE_PICK_INSTRUCTIONS,
          type: "choice",
        },
      },
      state: {
        characters: [
          {
            birthday: "[Birthday: 21 September, tomorrow]",
            element: "Electro",
            name: "described",
            region: "region",
            title: "title",
            version: "1.0",
          },
          { birthday: "", element: "Electro", name: "untitled", region: "region", title: "", version: "1.0" },
        ],
        today: { date: "2000-09-20", ...moment },
      },
    });
  });
});
