import type { Character } from "#src/models/Character";
import type { Moment } from "#src/models/Moment";
import type { ChoiceCriteria, ChoiceQuestion, SystemOneRequest } from "@typesafe-ai/sdk";

import { LORE_PICK_INSTRUCTIONS } from "#src/services/constants";
import { getBirthdayNote } from "#src/services/getBirthdayNote";
import { choice } from "@typesafe-ai/sdk";

// One question over the whole roster. Every character is an option described by the game's own line about them,
// And the state is what code knows for certain: each character's facts with the birthday measured from today, and
// The person's moment
export const getLorePickRequest = (
  roster: Character[],
  today: Temporal.PlainDate,
  moment: Moment,
): SystemOneRequest<{ character: ChoiceQuestion }> => {
  const criteria: ChoiceCriteria = Object.fromEntries(
    roster.map(({ description, name, title }) => [name, description || title || null]),
  );
  return {
    questions: { character: choice(LORE_PICK_INSTRUCTIONS, criteria) },
    state: {
      characters: roster.map(({ birthday, element, name, region, title, version }) => ({
        birthday: getBirthdayNote(birthday, today),
        element,
        name,
        region,
        title,
        version,
      })),
      today: { date: today.toString(), ...moment },
    },
  };
};
