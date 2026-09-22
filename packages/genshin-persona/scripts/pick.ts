import {
  SPEAK_LAUNCHER_PATH,
  SPEAK_SCRIPT_PATH,
  SPINNER_SCRIPT_PATH,
  STATUS_LAUNCHER_PATH,
  STATUS_SCRIPT_PATH,
} from "#src/services/constants";
import { deliverWarmRequest } from "#src/services/deliverWarmRequest";
import { getCard } from "#src/services/getCard";
import { getSessionStartOutput } from "#src/services/getSessionStartOutput";
import { parseHookInput } from "#src/services/parseHookInput";
import { readInterfaceLanguage } from "#src/services/readInterfaceLanguage";
import { readLocalization } from "#src/services/readLocalization";
import { readPersonaCard } from "#src/services/readPersonaCard";
import { readReplyLanguage } from "#src/services/readReplyLanguage";
import { readRoster } from "#src/services/readRoster";
import { readStdin } from "#src/services/readStdin";
import { registerQuietExit } from "#src/services/registerQuietExit";
import { resolveSessionCharacter } from "#src/services/resolveSessionCharacter";
import { spawnDetachedScript } from "#src/services/spawnDetachedScript";
import { writeLauncher } from "#src/services/writeLauncher";

// A session no character can be found for — the data unreadable, or a roster with no birthday on it — starts with
// No card, and the output style answers plainly
registerQuietExit();
const today = Temporal.Now.plainDateISO();
const input = await readStdin();
const { session_id: sessionId = "" } = parseHookInput(input);
// Both are a file read on this path: what was written to either was checked against the data package then, and the
// Roster cache is keyed by the interface language, so a language changed since is a cache miss and not a mismatch
const language = readInterfaceLanguage();
const roster = readRoster(language);
const character = await resolveSessionCharacter(roster, sessionId, today);
if (character) {
  const localization = await readLocalization(language);
  const personaCard = await readPersonaCard(character.name);
  const card = getCard(character, today, localization, personaCard);
  writeLauncher(STATUS_LAUNCHER_PATH, STATUS_SCRIPT_PATH);
  writeLauncher(SPEAK_LAUNCHER_PATH, SPEAK_SCRIPT_PATH);
  // The spinner's lines cost the data package or the wiki, so they are read off this path; the warm waits for no
  // More than a synthesizer's bind
  spawnDetachedScript(SPINNER_SCRIPT_PATH, character.name);
  await deliverWarmRequest(character.name, personaCard);
  console.log(getSessionStartOutput(card, readReplyLanguage() ?? language, language));
}
