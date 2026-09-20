import { checkIsPluginSpinner } from "#src/services/checkIsPluginSpinner";
import { TRAVELER } from "#src/services/constants";
import { getCard } from "#src/services/getCard";
import { getSessionStartOutput } from "#src/services/getSessionStartOutput";
import { getSpinner } from "#src/services/getSpinner";
import { getToday } from "#src/services/getToday";
import { parseHookInput } from "#src/services/parseHookInput";
import { readRoster } from "#src/services/readRoster";
import { readSpinnerContent } from "#src/services/readSpinnerContent";
import { readStdin } from "#src/services/readStdin";
import { readUserSettings } from "#src/services/readUserSettings";
import { readVoiceCard } from "#src/services/readVoiceCard";
import { registerFailureFallback } from "#src/services/registerFailureFallback";
import { resolveSessionCharacter } from "#src/services/resolveSessionCharacter";
import { writeSpinner } from "#src/services/writeSpinner";
import { writeStatusLauncher } from "#src/services/writeStatusLauncher";

const today = getToday();
registerFailureFallback(() => {
  console.log(getSessionStartOutput(getCard(TRAVELER, today.monthDay, "")));
});
const input = await readStdin();
const { session_id: sessionId = "" } = parseHookInput(input);
const roster = readRoster();
const character = resolveSessionCharacter(roster, sessionId, today) ?? TRAVELER;
const card = getCard(character, today.monthDay, readVoiceCard(character.name));
writeStatusLauncher();
// The spinner follows the character only where `setup` opted the settings in
const settings = readUserSettings();
if (checkIsPluginSpinner(settings)) writeSpinner(getSpinner(readSpinnerContent(), character.name, card.voiceCard));
console.log(getSessionStartOutput(card));
