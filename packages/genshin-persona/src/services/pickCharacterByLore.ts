import type { Character } from "#src/models/Character";

import { LORE_PICK_TIMEOUT_MS } from "#src/services/constants";
import { findCharacterByName } from "#src/services/findCharacterByName";
import { getLorePickRequest } from "#src/services/getLorePickRequest";
import { getMoment } from "#src/services/getMoment";
import { readCardedRoster } from "#src/services/readCardedRoster";
import { TypeSafeClient } from "@typesafe-ai/sdk";

// The one place the plugin waits on a network, one attempt with a short ceiling: a start that cannot reach the
// Tier has the birthday pick to fall back on, never the failure card, and a settled promise is how a rejection
// Is read without a try — read to stderr, so the fallback leaves a record of why it was taken. The choice is a
// Preference, so the answer is taken however spread its probabilities: a confidence floor guards an action, and
// Nothing here acts
export const pickCharacterByLore = async (
  roster: Character[],
  today: Temporal.PlainDate,
  key: string,
): Promise<Character | undefined> => {
  const client = new TypeSafeClient({ apiKey: key, retry: { maxRetries: 0 }, timeout: LORE_PICK_TIMEOUT_MS });
  const cardedRoster = await readCardedRoster(roster);
  const request = getLorePickRequest(cardedRoster, today, getMoment());
  const [result] = await Promise.allSettled([client.systemOne(request)]);
  if (result?.status !== "fulfilled") {
    console.error(`the lore pick did not answer: ${String(result?.reason)}`);
    return undefined;
  }

  return findCharacterByName(roster, result.value.answers.character.choice);
};
