import type { Character } from "#src/models/Character";
import type { Today } from "#src/models/Today";

import { findCharacterByName } from "#src/services/findCharacterByName";
import { pickCurrentCharacter } from "#src/services/pickCurrentCharacter";
import { pruneStalePickRecords } from "#src/services/pruneStalePickRecords";
import { readPickRecords } from "#src/services/readPickRecords";
import { readPin } from "#src/services/readPin";
import { writePickRecords } from "#src/services/writePickRecords";

// A pin wins outright, then the pick already recorded for this session, then a fresh pick — recorded against the
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

  const pickedCharacter = await pickCurrentCharacter(roster, today);
  if (!pickedCharacter) return undefined;

  // Read the file again rather than writing the snapshot above back over it: the pick waits on the network for as
  // Long as the lore ceiling, and a session that started alongside this one records its own character in between
  const otherRecords = pruneStalePickRecords(readPickRecords(), today.isoDate).filter(
    (record) => record.sessionId !== sessionId,
  );
  writePickRecords([
    ...otherRecords,
    { element: pickedCharacter.element, isoDate: today.isoDate, name: pickedCharacter.name, sessionId },
  ]);
  return pickedCharacter;
};
