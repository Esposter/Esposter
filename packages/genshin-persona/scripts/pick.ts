import { BASE_SPINNER_CONTENT } from "#src/services/baseSpinnerContent";
import { checkIsPluginSpinner } from "#src/services/checkIsPluginSpinner";
import { TRAVELER } from "#src/services/constants";
import { getCard } from "#src/services/getCard";
import { getSessionStartOutput } from "#src/services/getSessionStartOutput";
import { getSpinner } from "#src/services/getSpinner";
import { parseHookInput } from "#src/services/parseHookInput";
import { readPersonaCard } from "#src/services/readPersonaCard";
import { readRoster } from "#src/services/readRoster";
import { readStdin } from "#src/services/readStdin";
import { readUserSettings } from "#src/services/readUserSettings";
import { registerFailureFallback } from "#src/services/registerFailureFallback";
import { resolveSessionCharacter } from "#src/services/resolveSessionCharacter";
import { writeSpinner } from "#src/services/writeSpinner";
import { writeStatusLauncher } from "#src/services/writeStatusLauncher";

const today = Temporal.Now.plainDateISO();
registerFailureFallback(() => {
  console.log(getSessionStartOutput(getCard(TRAVELER, today, undefined)));
});
const input = await readStdin();
const { session_id: sessionId = "" } = parseHookInput(input);
const roster = readRoster();
const character = (await resolveSessionCharacter(roster, sessionId, today)) ?? TRAVELER;
const card = getCard(character, today, await readPersonaCard(character.name));
writeStatusLauncher();
// The spinner follows the character only where `setup` opted the settings in
const settings = readUserSettings();
if (checkIsPluginSpinner(settings)) writeSpinner(getSpinner(BASE_SPINNER_CONTENT, character.name, card.personaCard));
console.log(getSessionStartOutput(card));
