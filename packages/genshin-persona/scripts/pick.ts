import { deliverWarmRequest } from "#src/services/deliverWarmRequest";
import { formatLoreChart } from "#src/services/formatLoreChart";
import { formatUpcomingBirthdays } from "#src/services/formatUpcomingBirthdays";
import { getCard } from "#src/services/getCard";
import { getSessionStartOutput } from "#src/services/getSessionStartOutput";
import { parseHookInput } from "#src/services/parseHookInput";
import { readInterfaceLanguage } from "#src/services/readInterfaceLanguage";
import { readLocalization } from "#src/services/readLocalization";
import { readPersonaCard } from "#src/services/readPersonaCard";
import { readReplyLanguage } from "#src/services/readReplyLanguage";
import { readRoster } from "#src/services/readRoster";
import { readStdin } from "#src/services/readStdin";
import { readVoiceRemark } from "#src/services/readVoiceRemark";
import { registerQuietExit } from "#src/services/registerQuietExit";
import { resolveSessionCharacter } from "#src/services/resolveSessionCharacter";

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
const pick = await resolveSessionCharacter(roster, sessionId, today);
if (pick) {
  const { character, loreFailure, loreResponse } = pick;
  const localization = await readLocalization(language);
  const personaCard = await readPersonaCard(character.name);
  const card = getCard(character, today, localization, personaCard);
  // What the welcome says under the note: why the tier fell through when it did, the tier's leaning when it chose
  // And who is close when it did not, and the voice once one is set up
  const remarks = [
    loreFailure && localization.strings.lorePickUnanswered(loreFailure),
    loreResponse
      ? formatLoreChart(loreResponse, roster, localization)
      : formatUpcomingBirthdays(roster, today, character.name, localization),
    readVoiceRemark(localization.strings),
  ];
  // The warm waits for no more than a synthesizer's bind
  await deliverWarmRequest(character.name, personaCard);
  console.log(getSessionStartOutput(card, remarks, readReplyLanguage() ?? language, language));
}
