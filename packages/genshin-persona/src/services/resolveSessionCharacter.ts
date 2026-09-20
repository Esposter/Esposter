import type { Character } from "#src/models/Character";
import type { Today } from "#src/models/Today";

import { findCharacterByName } from "#src/services/findCharacterByName";
import { pruneStalePickRecords } from "#src/services/pruneStalePickRecords";
import { readPickRecords } from "#src/services/readPickRecords";
import { readPin } from "#src/services/readPin";
import { resolveDayCharacter } from "#src/services/resolveDayCharacter";
import { writePickRecords } from "#src/services/writePickRecords";

// A pin wins outright, then the pick already recorded for this session, then the day's — recorded against the
// Session id so a clear, compact or resume after midnight keeps the character the conversation started with
export const resolveSessionCharacter = async (
  roster: Character[],
  sessionId: string,
  today: Today,
): Promise<Character | undefined> => {
  const pickRecords = pruneStalePickRecords(readPickRecords(), today.isoDate);
  const pin = readPin();
  const pinnedCharacter = findCharacterByName(roster, pin?.name ?? "");
  if (pinnedCharacter) {
    writePickRecords(pickRecords);
    return pinnedCharacter;
  }

  const sessionRecord = pickRecords.find((record) => record.sessionId === sessionId);
  const knownCharacter = findCharacterByName(roster, sessionRecord?.name ?? "");
  if (knownCharacter) {
    writePickRecords(pickRecords);
    return knownCharacter;
  }

  const dayCharacter = await resolveDayCharacter(roster, today);
  if (!dayCharacter) return undefined;

  const otherRecords = pickRecords.filter((record) => record.sessionId !== sessionId);
  writePickRecords([
    ...otherRecords,
    { element: dayCharacter.element, isoDate: today.isoDate, name: dayCharacter.name, sessionId },
  ]);
  return dayCharacter;
};
