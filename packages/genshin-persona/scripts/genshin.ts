import type { Character } from "#src/models/Character";

import { GenshinVerb } from "#src/models/GenshinVerb";
import { BASE_SPINNER_CONTENT } from "#src/services/baseSpinnerContent";
import { checkIsPluginStatusLine } from "#src/services/checkIsPluginStatusLine";
import { checkIsSpeechVolume } from "#src/services/checkIsSpeechVolume";
import {
  CARD_DETAIL_SEPARATOR,
  MAX_SPEECH_VOLUME,
  SESSION_ID_ENVIRONMENT_VARIABLE,
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
import { pickCurrentCharacter } from "#src/services/pickCurrentCharacter";
import { readCardedRoster } from "#src/services/readCardedRoster";
import { readCharacterVoice } from "#src/services/readCharacterVoice";
import { readPersonaCard } from "#src/services/readPersonaCard";
import { readPin } from "#src/services/readPin";
import { readRoster } from "#src/services/readRoster";
import { readSpeechVoiceDefinitions } from "#src/services/readSpeechVoiceDefinitions";
import { readUserSettings } from "#src/services/readUserSettings";
import { readVoiceLines } from "#src/services/readVoiceLines";
import { recordSessionCharacter } from "#src/services/recordSessionCharacter";
import { resolveSessionCharacter } from "#src/services/resolveSessionCharacter";
import { setMuted } from "#src/services/setMuted";
import { writePin } from "#src/services/writePin";
import { writeSessionSpinner } from "#src/services/writeSessionSpinner";
import { writeSpinner } from "#src/services/writeSpinner";
import { writeStatusLauncher } from "#src/services/writeStatusLauncher";
import { writeUserSettings } from "#src/services/writeUserSettings";
import { writeVolume } from "#src/services/writeVolume";

const [verb, ...nameParts] = process.argv.slice(2);
const name = nameParts.join(" ");
const roster = readRoster();
const today = Temporal.Now.plainDateISO();
const getRosterLine = ({ birthday, element, name: characterName, region, title, version }: Character) =>
  [characterName, title, element, region, birthday, `v${version}`].filter(Boolean).join(CARD_DETAIL_SEPARATOR);
const compareVersionsDescending = (a: Character, b: Character) =>
  b.version.localeCompare(a.version, undefined, { numeric: true }) || a.name.localeCompare(b.name);
// Set in every Bash tool subprocess, so a verb the model runs knows the session it runs in; empty from a shell
const sessionId = process.env[SESSION_ID_ENVIRONMENT_VARIABLE] ?? "";
const printCard = async (character: Character) => {
  const card = getCard(character, today, await readPersonaCard(character.name));
  console.log(formatCard(card));
};
// This session's character when run inside one, else the pin, else a fresh pick: the resolution the start hook runs,
// So `today` answers who is speaking now. Under the lore pick a fresh ask may answer differently, which is the point
// Of it
const getCurrentCharacter = () => {
  const pin = readPin();
  if (pin && !findCharacterByName(roster, pin.name))
    console.log(`The pin "${pin.name}" names no character in the roster and is ignored.`);

  return resolveSessionCharacter(roster, sessionId, today);
};
// The session speaks as the character from the reply that relays the card: its record is rewritten so every later
// Start, the status line and the speech hook agree, and the spinner follows where `setup` opted it in
const switchSessionCharacter = async (character: Character) => {
  recordSessionCharacter(character, sessionId, today.toString());
  writeSessionSpinner(character, await readPersonaCard(character.name));
  await printCard(character);
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
    setMuted(true);
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
    if (sessionId) {
      await switchSessionCharacter(pinnedCharacter);
      console.log(
        "Pinned for every session from the next start, and for this one from this reply; the spinner follows at the next session.",
      );
      break;
    }

    await printCard(pinnedCharacter);
    console.log("Pinned for every session from the next start.");
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
      const personaCard = await readPersonaCard(character.name);
      writeSpinner(getSpinner(BASE_SPINNER_CONTENT, character.name, personaCard));
    }

    console.log(
      checkIsPluginStatusLine(settings.statusLine)
        ? "Status line and spinner written to user settings; both show from the next session."
        : "Spinner written to user settings, shown from the next session; the status line already there is not ours and was left alone.",
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
    if (character) await printCard(character);
    break;
  }
  case GenshinVerb.Uncarded: {
    const cardedRoster = await readCardedRoster(roster);
    for (const { character } of cardedRoster
      .filter(({ personaCard }) => !personaCard)
      .toSorted((a, b) => compareVersionsDescending(a.character, b.character)))
      console.log(getRosterLine(character));
    break;
  }
  case GenshinVerb.Unmute:
    setMuted(false);
    console.log("Spoken replies unmuted.");
    break;
  case GenshinVerb.Unpin: {
    deletePin();
    const character = sessionId ? await pickCurrentCharacter(roster, today) : undefined;
    if (!character) {
      console.log("Pin removed; the pick decides again from the next session.");
      break;
    }

    await switchSessionCharacter(character);
    console.log(
      "Pin removed; the pick decides again from the next session, and for this one from this reply; the spinner follows at the next session.",
    );
    break;
  }
  case GenshinVerb.Untipped: {
    const cardedRoster = await readCardedRoster(roster);
    for (const { character } of cardedRoster
      .filter(({ personaCard }) => personaCard && (personaCard.tips.length === 0 || personaCard.verbs.length === 0))
      .toSorted((a, b) => compareVersionsDescending(a.character, b.character)))
      console.log(getRosterLine(character));
    break;
  }
  case GenshinVerb.Use: {
    const character = findCharacterByName(roster, name);
    if (!character) {
      console.error(`No character named "${name}" is in the roster.`);
      process.exitCode = 1;
      break;
    }

    if (!sessionId) {
      console.error("No session to use a character in: this runs from inside a Claude Code session.");
      process.exitCode = 1;
      break;
    }

    await switchSessionCharacter(character);
    console.log(
      "Speaking as this character from this reply, in this session alone; the spinner follows at the next session.",
    );
    break;
  }
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

    const cardedRoster = await readCardedRoster(roster);
    const characterVoices = await Promise.all(
      cardedRoster.map(async ({ character, personaCard }) => ({
        character,
        voice: await readCharacterVoice(character.name, personaCard),
      })),
    );
    const voicedCharacters = characterVoices.flatMap(({ character, voice }) => (voice ? [{ character, voice }] : []));
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
