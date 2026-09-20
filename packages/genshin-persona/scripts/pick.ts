import { TRAVELER } from "#src/services/constants";
import { getCard } from "#src/services/getCard";
import { getSessionStartOutput } from "#src/services/getSessionStartOutput";
import { getToday } from "#src/services/getToday";
import { parseHookInput } from "#src/services/parseHookInput";
import { readRoster } from "#src/services/readRoster";
import { readStdin } from "#src/services/readStdin";
import { readVoiceCard } from "#src/services/readVoiceCard";
import { registerFailureFallback } from "#src/services/registerFailureFallback";
import { resolveSessionCharacter } from "#src/services/resolveSessionCharacter";
import { writeStatusLauncher } from "#src/services/writeStatusLauncher";

const today = getToday();
registerFailureFallback(() => {
  console.log(getSessionStartOutput(getCard(TRAVELER, today.monthDay, "")));
});
const input = await readStdin();
const { session_id: sessionId = "" } = parseHookInput(input);
const roster = readRoster();
const character = resolveSessionCharacter(roster, sessionId, today) ?? TRAVELER;
const voiceCard = readVoiceCard(character.name);
writeStatusLauncher();
console.log(getSessionStartOutput(getCard(character, today.monthDay, voiceCard)));
