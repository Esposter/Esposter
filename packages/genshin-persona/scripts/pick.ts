import { SPINNER_SCRIPT_PATH } from "#src/services/constants";
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
import { spawnWarm } from "#src/services/spawnWarm";
import { writeStatusLauncher } from "#src/services/writeStatusLauncher";

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
  const card = getCard(character, today, localization, await readPersonaCard(character.name));
  writeStatusLauncher();
  // The spinner's lines cost the data package or the wiki, so they are read off this path
  spawnDetachedScript(SPINNER_SCRIPT_PATH, character.name);
  spawnWarm(character.name);
  console.log(getSessionStartOutput(card, readReplyLanguage() ?? language));
}
