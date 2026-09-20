import type { Character } from "#src/models/Character";

import { GenshinVerb } from "#src/models/GenshinVerb";
import { checkIsPluginStatusLine } from "#src/services/checkIsPluginStatusLine";
import { CARD_DETAIL_SEPARATOR } from "#src/services/constants";
import { deletePin } from "#src/services/deletePin";
import { findCharacterByName } from "#src/services/findCharacterByName";
import { formatCard } from "#src/services/formatCard";
import { getCard } from "#src/services/getCard";
import { getSettingsWithoutPluginEntries } from "#src/services/getSettingsWithoutPluginEntries";
import { getSettingsWithPluginEntries } from "#src/services/getSettingsWithPluginEntries";
import { getToday } from "#src/services/getToday";
import { pickCharacter } from "#src/services/pickCharacter";
import { readPin } from "#src/services/readPin";
import { readRoster } from "#src/services/readRoster";
import { readUserSettings } from "#src/services/readUserSettings";
import { readVoiceCard } from "#src/services/readVoiceCard";
import { setIsMuted } from "#src/services/setIsMuted";
import { writePin } from "#src/services/writePin";
import { writeStatusLauncher } from "#src/services/writeStatusLauncher";
import { writeUserSettings } from "#src/services/writeUserSettings";

const [verb, ...nameParts] = process.argv.slice(2);
const name = nameParts.join(" ");
const roster = readRoster();
const today = getToday();
const getRosterLine = (character: Character) =>
  [character.name, character.title, character.element, character.region, character.birthday, `v${character.version}`]
    .filter(Boolean)
    .join(CARD_DETAIL_SEPARATOR);
const compareVersionsDescending = (a: Character, b: Character) =>
  b.version.localeCompare(a.version, undefined, { numeric: true }) || a.name.localeCompare(b.name);
const printCard = (character: Character) => {
  const card = getCard(character, today.monthDay, readVoiceCard(character.name));
  console.log(formatCard(card));
};

switch (verb) {
  case GenshinVerb.Mute:
    setIsMuted(true);
    console.log("Spoken replies muted.");
    break;
  case GenshinVerb.Pin: {
    const pinnedCharacter = findCharacterByName(roster, name);
    if (!pinnedCharacter) {
      console.error(`No character named "${name}" is in the roster.`);
      process.exitCode = 1;
      break;
    }

    writePin(pinnedCharacter.name);
    printCard(pinnedCharacter);
    break;
  }
  case GenshinVerb.Roster:
    for (const character of roster) console.log(getRosterLine(character));
    break;
  case GenshinVerb.Setup: {
    writeStatusLauncher();
    const userSettings = readUserSettings();
    const settings = getSettingsWithPluginEntries(userSettings);
    writeUserSettings(settings);
    console.log(
      checkIsPluginStatusLine(settings.statusLine)
        ? "Status line and spinner verbs written to user settings; both show from the next session."
        : "Spinner verbs written to user settings; the status line already there is not ours and was left alone.",
    );
    break;
  }
  case GenshinVerb.Teardown: {
    const userSettings = readUserSettings();
    const settings = getSettingsWithoutPluginEntries(userSettings);
    writeUserSettings(settings);
    console.log("Status line and spinner verbs removed from user settings.");
    break;
  }
  case GenshinVerb.Today: {
    const pin = readPin();
    const pinnedCharacter = findCharacterByName(roster, pin);
    if (pin && !pinnedCharacter) console.log(`The pin "${pin}" names no character in the roster and is ignored.`);

    const character = pinnedCharacter ?? pickCharacter(roster, today.monthDay, today.isoDate);
    if (character) printCard(character);
    break;
  }
  case GenshinVerb.Uncarded:
    for (const character of roster
      .filter((candidate) => !readVoiceCard(candidate.name))
      .toSorted(compareVersionsDescending))
      console.log(getRosterLine(character));
    break;
  case GenshinVerb.Unmute:
    setIsMuted(false);
    console.log("Spoken replies unmuted.");
    break;
  case GenshinVerb.Unpin:
    deletePin();
    console.log("Pin removed; the nearest birthday picks again.");
    break;
  default:
    console.error(`Usage: genshin.ts <${Object.values(GenshinVerb).join(" | ")}> [name]`);
    process.exitCode = 1;
}
