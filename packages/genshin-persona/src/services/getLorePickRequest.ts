import type { CardedCharacter } from "#src/models/CardedCharacter";
import type { Moment } from "#src/models/Moment";
import type { ChoiceCriteria, ChoiceQuestion, SystemOneRequest } from "@typesafe-ai/sdk";

import { HABIT_SEPARATOR, LORE_PICK_INSTRUCTIONS } from "#src/services/constants";
import { getBirthdayNote } from "#src/services/getBirthdayNote";
import { choice } from "@typesafe-ai/sdk";

// One question over the whole roster. A character is described to the tier by the habits their card was written
// with — how they actually are to talk to — because that is what the question is about, and the game's own line
// about them only stands in for a character nobody has carded yet. The state is what code knows for certain: each
// character's facts with the birthday measured from today, and the person's moment
export const getLorePickRequest = (
  cardedRoster: CardedCharacter[],
  today: Temporal.PlainDate,
  moment: Moment,
): SystemOneRequest<{ character: ChoiceQuestion }> => {
  const criteria: ChoiceCriteria = Object.fromEntries(
    cardedRoster.map(({ character, personaCard }) => [
      character.name,
      personaCard?.habits.join(HABIT_SEPARATOR) || character.description || character.title || null,
    ]),
  );
  return {
    questions: { character: choice(LORE_PICK_INSTRUCTIONS, criteria) },
    state: {
      // The description is absent on purpose: the habits above say the same thing better, and saying it twice is
      // the largest thing this request could carry for nothing
      characters: cardedRoster.map(({ character }) => ({
        affiliation: character.affiliation,
        birthday: getBirthdayNote(character.birthday, today),
        constellation: character.constellation,
        element: character.element,
        name: character.name,
        region: character.region,
        title: character.title,
        version: character.version,
        weapon: character.weapon,
      })),
      today: { date: today.toString(), ...moment },
    },
  };
};
