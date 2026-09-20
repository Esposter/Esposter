import { FALLBACK_CHARACTER } from "#src/services/constants";
import { getCard } from "#src/services/getCard";
import { getSessionStartOutput } from "#src/services/getSessionStartOutput";
import { parseHookInput } from "#src/services/parseHookInput";
import { readPersonaCard } from "#src/services/readPersonaCard";
import { readRoster } from "#src/services/readRoster";
import { readStdin } from "#src/services/readStdin";
import { registerFailureFallback } from "#src/services/registerFailureFallback";
import { resolveSessionCharacter } from "#src/services/resolveSessionCharacter";
import { spawnWarm } from "#src/services/spawnWarm";
import { writeSessionSpinner } from "#src/services/writeSessionSpinner";
import { writeStatusLauncher } from "#src/services/writeStatusLauncher";

const today = Temporal.Now.plainDateISO();
registerFailureFallback(() => {
  console.log(getSessionStartOutput(getCard(FALLBACK_CHARACTER, today, undefined)));
});
const input = await readStdin();
const { session_id: sessionId = "" } = parseHookInput(input);
const roster = readRoster();
const character = (await resolveSessionCharacter(roster, sessionId, today)) ?? FALLBACK_CHARACTER;
const card = getCard(character, today, await readPersonaCard(character.name));
writeStatusLauncher();
writeSessionSpinner(character, card.personaCard);
spawnWarm(character.name);
console.log(getSessionStartOutput(card));
