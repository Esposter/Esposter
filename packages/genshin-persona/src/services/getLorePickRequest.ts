import type { CardedCharacter } from "#src/models/CardedCharacter";
import type { Moment } from "#src/models/Moment";
import type { ChoiceCriteria, ChoiceQuestion, SystemOneRequest } from "@typesafe-ai/sdk";

import { HABIT_SEPARATOR, LORE_PICK_INSTRUCTIONS } from "#src/services/constants";
import { getBirthdayNote } from "#src/services/getBirthdayNote";
import { choice } from "@typesafe-ai/sdk";

// One question over the whole roster. A character is described to the tier by the habits their card was written
// With — how they actually are to talk to — because that is what the question is about, and the game's own line
// About them only stands in for a character nobody has carded yet. The state is what code knows for certain: each
// Character's facts with the birthday measured from today, and the person's moment
export const getLorePickRequest = (
  cardedRoster: CardedCharacter[],
  today: Temporal.PlainDate,
  moment: Moment,
): SystemOneRequest<{ character: ChoiceQuestion }> => {
  const criteria: ChoiceCriteria = Object.fromEntries(
    cardedRoster.map(({ character: { description, name, title }, personaCard }) => [
      name,
      personaCard?.habits.join(HABIT_SEPARATOR) || description || title || null,
    ]),
  );
  return {
    questions: { character: choice(LORE_PICK_INSTRUCTIONS, criteria) },
    state: {
      // The description is absent on purpose: the habits above say the same thing better, and saying it twice is
      // The largest thing this request could carry for nothing
      characters: cardedRoster.map(
        ({ character: { affiliation, birthday, constellation, element, name, region, title, version, weapon } }) => ({
          affiliation,
          birthday: getBirthdayNote(birthday, today),
          constellation,
          element,
          name,
          region,
          title,
          version,
          weapon,
        }),
      ),
      today: { date: today.toString(), ...moment },
    },
  };
};
