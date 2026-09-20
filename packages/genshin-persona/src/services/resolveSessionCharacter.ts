import type { Character } from "#src/models/Character";

import { findCharacterByName } from "#src/services/findCharacterByName";
import { pickCurrentCharacter } from "#src/services/pickCurrentCharacter";
import { readPickRecords } from "#src/services/readPickRecords";
import { readPin } from "#src/services/readPin";
import { recordSessionCharacter } from "#src/services/recordSessionCharacter";

// The character this session already has wins outright — recorded against the session id so a clear, compact or
// Resume after midnight keeps the character the conversation started with, and so a `use` or `pin` made inside it
// Holds — then the pin decides what a new session is given, then a fresh pick; whichever it is, the session records
// It. No session id means no session: what a session starting now would be given, recorded nowhere
export const resolveSessionCharacter = async (
  roster: Character[],
  sessionId: string,
  today: Temporal.PlainDate,
): Promise<Character | undefined> => {
  const sessionRecord = sessionId ? readPickRecords().find((record) => record.sessionId === sessionId) : undefined;
  const knownCharacter = findCharacterByName(roster, sessionRecord?.name ?? "");
  if (knownCharacter) return knownCharacter;

  const pin = readPin();
  const pinnedCharacter = findCharacterByName(roster, pin?.name ?? "");
  const character = pinnedCharacter ?? (await pickCurrentCharacter(roster, today));
  if (character && sessionId) recordSessionCharacter(character, sessionId, today.toString());
  return character;
};
