import type { Character } from "#src/models/Character";

import { GenshinVerb } from "#src/models/GenshinVerb";
import { checkIsPluginStatusLine } from "#src/services/checkIsPluginStatusLine";
import { checkIsSpeechVolume } from "#src/services/checkIsSpeechVolume";
import {
  CARD_DETAIL_SEPARATOR,
  MAX_SPEECH_VOLUME,
  SPEECH_ENDPOINT_ENVIRONMENT_VARIABLE,
  SPEECH_KEY_ENVIRONMENT_VARIABLE,
  SPEECH_VOLUME_LEVELS,
} from "#src/services/constants";
import { deletePin } from "#src/services/deletePin";
import { findCharacterByName } from "#src/services/findCharacterByName";
import { formatCard } from "#src/services/formatCard";
import { getCard } from "#src/services/getCard";
import { getSettingsWithoutPluginEntries } from "#src/services/getSettingsWithoutPluginEntries";
import { getSettingsWithStatusLine } from "#src/services/getSettingsWithStatusLine";
import { getSpeechVoiceFinding } from "#src/services/getSpeechVoiceFinding";
import { getSpinner } from "#src/services/getSpinner";
import { getToday } from "#src/services/getToday";
import { parseVoiceCard } from "#src/services/parseVoiceCard";
import { pickCurrentCharacter } from "#src/services/pickCurrentCharacter";
import { readPin } from "#src/services/readPin";
import { readRoster } from "#src/services/readRoster";
import { readSpeechVoiceDefinitions } from "#src/services/readSpeechVoiceDefinitions";
import { readSpinnerContent } from "#src/services/readSpinnerContent";
import { readUserSettings } from "#src/services/readUserSettings";
import { readVoiceCard } from "#src/services/readVoiceCard";
import { readVoiceLines } from "#src/services/readVoiceLines";
import { setIsMuted } from "#src/services/setIsMuted";
import { writePin } from "#src/services/writePin";
import { writeSpinner } from "#src/services/writeSpinner";
import { writeStatusLauncher } from "#src/services/writeStatusLauncher";
import { writeUserSettings } from "#src/services/writeUserSettings";
import { writeVolume } from "#src/services/writeVolume";

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
// The pin, else a fresh pick: what a session starting now would be given, short of a record it already holds — and
// Under the lore pick a fresh ask may answer differently, which is the point of it
const getCurrentCharacter = async () => {
  const pin = readPin();
  const pinnedCharacter = findCharacterByName(roster, pin?.name ?? "");
  if (pin && !pinnedCharacter) console.log(`The pin "${pin.name}" names no character in the roster and is ignored.`);

  return pinnedCharacter ?? (await pickCurrentCharacter(roster, today));
};

switch (verb) {
  case GenshinVerb.Lines: {
    const character = findCharacterByName(roster, name);
    if (!character) {
      console.error(`No character named "${name}" is in the roster.`);
      process.exitCode = 1;
      break;
    }

    console.log(`${getRosterLine(character)}\n${character.description}`);
    const voiceLines = await readVoiceLines(character.name);
    if (!voiceLines) {
      console.error(`The game data carries no lines for "${character.name}" yet, and the wiki did not answer.`);
      process.exitCode = 1;
      break;
    }

    for (const { text, title } of voiceLines) console.log(`- ${title}: ${text}`);
    break;
  }
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

    writePin(pinnedCharacter);
    printCard(pinnedCharacter);
    console.log("Pinned for every session from the next start; the status line follows at once.");
    break;
  }
  case GenshinVerb.Roster:
    for (const character of roster) console.log(getRosterLine(character));
    break;
  case GenshinVerb.Setup: {
    writeStatusLauncher();
    const userSettings = readUserSettings();
    const settings = getSettingsWithStatusLine(userSettings);
    writeUserSettings(settings);
    const character = await getCurrentCharacter();
    if (character) {
      const voiceCard = parseVoiceCard(readVoiceCard(character.name));
      writeSpinner(getSpinner(readSpinnerContent(), character.name, voiceCard));
    }

    console.log(
      checkIsPluginStatusLine(settings.statusLine)
        ? "Status line and spinner written to user settings; both show from the next session."
        : "Spinner written to user settings; the status line already there is not ours and was left alone.",
    );
    break;
  }
  case GenshinVerb.Teardown: {
    const userSettings = readUserSettings();
    const settings = getSettingsWithoutPluginEntries(userSettings);
    writeUserSettings(settings);
    console.log("Status line and spinner removed from user settings; both go at the next session.");
    break;
  }
  case GenshinVerb.Today: {
    const character = await getCurrentCharacter();
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
    console.log("Pin removed; the pick decides again from the next session.");
    break;
  case GenshinVerb.Untipped:
    for (const character of roster
      .filter((candidate) => {
        const voiceCard = parseVoiceCard(readVoiceCard(candidate.name));
        return voiceCard.context && (voiceCard.tips.length === 0 || voiceCard.verbs.length === 0);
      })
      .toSorted(compareVersionsDescending))
      console.log(getRosterLine(character));
    break;
  case GenshinVerb.Voices: {
    const endpoint = process.env[SPEECH_ENDPOINT_ENVIRONMENT_VARIABLE] ?? "";
    const key = process.env[SPEECH_KEY_ENVIRONMENT_VARIABLE] ?? "";
    if (!endpoint || !key) {
      console.error("No speech endpoint and key are set, so there is no catalogue to check the cards against.");
      process.exitCode = 1;
      break;
    }

    const definitions = await readSpeechVoiceDefinitions(endpoint, key);
    if (!definitions) {
      console.error("The speech resource declined to list its voices.");
      process.exitCode = 1;
      break;
    }

    const voicedCharacters = roster
      .map((character) => ({ character, voice: parseVoiceCard(readVoiceCard(character.name)).voice }))
      .filter(({ voice }) => voice.name);
    for (const { character, voice } of voicedCharacters) {
      const finding = getSpeechVoiceFinding(voice, definitions);
      if (finding) console.log(`${character.name} ${finding}`);
    }

    console.log(
      `${voicedCharacters.length} of ${roster.length} characters name a voice, checked against the ${definitions.length} this resource speaks with.`,
    );
    break;
  }
  case GenshinVerb.Volume:
    if (!checkIsSpeechVolume(name)) {
      console.error(
        `Volume must be one of ${SPEECH_VOLUME_LEVELS.join(", ")}, or a whole number from 0 to ${MAX_SPEECH_VOLUME}.`,
      );
      process.exitCode = 1;
      break;
    }

    writeVolume(name);
    console.log(`Spoken replies at volume ${name} from the next reply.`);
    break;
  default:
    console.error(`Usage: genshin.ts <${Object.values(GenshinVerb).join(" | ")}> [name]`);
    process.exitCode = 1;
}
