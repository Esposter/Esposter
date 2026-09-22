import type { Character } from "#src/models/Character";
import type { LorePick } from "#src/models/LorePick";

import { LORE_PICK_TIMEOUT_MS, LORE_PICK_UNKNOWN_NAME } from "#src/services/constants";
import { findCharacterByName } from "#src/services/findCharacterByName";
import { getLorePickRequest } from "#src/services/getLorePickRequest";
import { getMoment } from "#src/services/getMoment";
import { readCardedRoster } from "#src/services/readCardedRoster";
import { TypeSafeClient } from "@typesafe-ai/sdk";

// The one place the plugin waits on a network, one attempt with a short ceiling: a start that cannot reach the
// Tier has the birthday pick to fall back on, and a settled promise is how a rejection is read without a try. The
// Reason rides back with the fallback, because a hook's stderr reaches nobody and the welcome does. The choice is a
// Preference, so the answer is taken however spread its probabilities: a confidence floor guards an action, and
// Nothing here acts
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

  const response = result.value.answers.character;
  const character = findCharacterByName(roster, response.choice);
  return character ? { character, response } : { failure: LORE_PICK_UNKNOWN_NAME(response.choice) };
};
