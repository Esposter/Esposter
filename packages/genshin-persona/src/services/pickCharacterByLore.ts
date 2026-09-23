import type { Character } from "#src/models/Character";
import type { LorePick } from "#src/models/LorePick";

import { LORE_PICK_TIMEOUT_MS, LORE_PICK_UNKNOWN_NAME } from "#src/services/constants";
import { drawLoreChoice } from "#src/services/drawLoreChoice";
import { findCharacterByName } from "#src/services/findCharacterByName";
import { getLorePickRequest } from "#src/services/getLorePickRequest";
import { getMoment } from "#src/services/getMoment";
import { readCardedRoster } from "#src/services/readCardedRoster";
import { TypeSafeClient } from "@typesafe-ai/sdk";

// The one place the plugin waits on a network, one attempt with a short ceiling: a start that cannot reach the
// Tier has the birthday pick to fall back on, and a settled promise is how a rejection is read without a try. The
// Reason rides back with the fallback, because a hook's stderr reaches nobody and the welcome does. The choice is a
// Preference, so it is drawn from the tier's odds (`drawLoreChoice`) and the answer carries the drawn name as its
// Choice: a confidence floor guards an action, and nothing here acts
export const pickCharacterByLore = async (
  roster: Character[],
  today: Temporal.PlainDate,
  key: string,
): Promise<LorePick> => {
  const client = new TypeSafeClient({ apiKey: key, retry: { maxRetries: 0 }, timeout: LORE_PICK_TIMEOUT_MS });
  const cardedRoster = await readCardedRoster(roster);
  const request = getLorePickRequest(cardedRoster, today, getMoment());
  const [result] = await Promise.allSettled([client.systemOne(request)]);
  if (result?.status !== "fulfilled") return { failure: String(result?.reason) };

  const { answers } = result.value;
  const draw = Math.random();
  const choice = drawLoreChoice(answers.character.probabilities, draw) ?? answers.character.choice;
  const character = findCharacterByName(roster, choice);
  return character
    ? { character, response: { ...answers.character, choice } }
    : { failure: LORE_PICK_UNKNOWN_NAME(choice) };
};
