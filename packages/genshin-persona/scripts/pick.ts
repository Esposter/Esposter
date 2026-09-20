import { getCard } from "#src/services/getCard";
import { getSessionStartOutput } from "#src/services/getSessionStartOutput";
import { parseHookInput } from "#src/services/parseHookInput";
import { readPersonaCard } from "#src/services/readPersonaCard";
import { readRoster } from "#src/services/readRoster";
import { readStdin } from "#src/services/readStdin";
import { registerQuietExit } from "#src/services/registerQuietExit";
import { resolveSessionCharacter } from "#src/services/resolveSessionCharacter";
import { spawnWarm } from "#src/services/spawnWarm";
import { writeSessionSpinner } from "#src/services/writeSessionSpinner";
import { writeStatusLauncher } from "#src/services/writeStatusLauncher";

// A session no character can be found for — the data unreadable, or a roster with no birthday on it — starts with
// No card, and the output style answers plainly
registerQuietExit();
const today = Temporal.Now.plainDateISO();
const input = await readStdin();
const { session_id: sessionId = "" } = parseHookInput(input);
const roster = readRoster();
const character = await resolveSessionCharacter(roster, sessionId, today);
if (character) {
  const card = getCard(character, today, await readPersonaCard(character.name));
  writeStatusLauncher();
  writeSessionSpinner(character, card.personaCard);
  spawnWarm(character.name);
  console.log(getSessionStartOutput(card));
}
