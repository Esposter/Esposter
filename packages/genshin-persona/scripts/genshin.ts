import type { Character } from "#src/models/Character";

import { GenshinVerb } from "#src/models/GenshinVerb";
import { VoiceLanguage } from "#src/models/VoiceLanguage";
import { VoiceRequestType } from "#src/models/VoiceRequestType";
import { VoiceStatus } from "#src/models/VoiceStatus";
import { BASE_SPINNER_CONTENT } from "#src/services/baseSpinnerContent";
import { checkIsPluginStatusLine } from "#src/services/checkIsPluginStatusLine";
import { checkIsRuntimeInstalled } from "#src/services/checkIsRuntimeInstalled";
import { checkIsVoiceLanguage } from "#src/services/checkIsVoiceLanguage";
import { checkIsVolume } from "#src/services/checkIsVolume";
import { connectVoiceServer } from "#src/services/connectVoiceServer";
import {
  CARD_DETAIL_SEPARATOR,
  MAX_VOLUME,
  MODELS_DIRECTORY,
  RUNTIME_MANIFEST_PATH,
  SESSION_ID_ENVIRONMENT_VARIABLE,
  VOICE_CPU_DEVICE,
  VOICE_LOG_PATH,
  VOICE_PROOF_TEXT,
  VOICE_STATUS_SEPARATOR,
} from "#src/services/constants";
import { createVoiceProgressPrinter } from "#src/services/createVoiceProgressPrinter";
import { createVoiceSynthesizer } from "#src/services/createVoiceSynthesizer";
import { deletePin } from "#src/services/deletePin";
import { deleteVoiceState } from "#src/services/deleteVoiceState";
import { findCharacterByName } from "#src/services/findCharacterByName";
import { formatCard } from "#src/services/formatCard";
import { getCard } from "#src/services/getCard";
import { getSettingsWithoutPluginEntries } from "#src/services/getSettingsWithoutPluginEntries";
import { getSettingsWithStatusLine } from "#src/services/getSettingsWithStatusLine";
import { getSpeechRequest } from "#src/services/getSpeechRequest";
import { getSpinner } from "#src/services/getSpinner";
import { installVoiceRuntime } from "#src/services/installVoiceRuntime";
import { pickCurrentCharacter } from "#src/services/pickCurrentCharacter";
import { readCardedRoster } from "#src/services/readCardedRoster";
import { readCharacterReference } from "#src/services/readCharacterReference";
import { readLanguage } from "#src/services/readLanguage";
import { readPersonaCard } from "#src/services/readPersonaCard";
import { readPin } from "#src/services/readPin";
import { readRoster } from "#src/services/readRoster";
import { readUserSettings } from "#src/services/readUserSettings";
import { readVoiceLines } from "#src/services/readVoiceLines";
import { readVoiceRuntime } from "#src/services/readVoiceRuntime";
import { recordSessionCharacter } from "#src/services/recordSessionCharacter";
import { resolveSessionCharacter } from "#src/services/resolveSessionCharacter";
import { sendVoiceRequest } from "#src/services/sendVoiceRequest";
import { setMuted } from "#src/services/setMuted";
import { writeLanguage } from "#src/services/writeLanguage";
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
    await deleteVoiceState();
    console.log(
      "Status line and spinner removed from user settings; both go at the next session. The voice's runtime, weights, references and language are removed; the pick records and the pin stay.",
    );
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
  case GenshinVerb.Voice: {
    if (!name) {
      const language = readLanguage();
      console.log(
        language
          ? `Runtime ${checkIsRuntimeInstalled() ? "installed" : "not installed"}; ${language} dub; the log is ${VOICE_LOG_PATH}.`
          : "No voice set up: run this with a dub to install the engine and choose one.",
      );
      break;
    }

    if (!checkIsVoiceLanguage(name)) {
      console.error(`The dub must be one of ${Object.values(VoiceLanguage).join(", ")}.`);
      process.exitCode = 1;
      break;
    }

    if (checkIsRuntimeInstalled()) console.log("Runtime installed.");
    else {
      console.log("Installing the engine's runtime into the state directory...");
      // A synthesizer still running on the runtime being replaced is stopped, so the next hook loads the new one
      await connectVoiceServer({ type: VoiceRequestType.Stop });
      if (!installVoiceRuntime()) {
        console.error("npm could not install the runtime; the voice stays off.");
        process.exitCode = 1;
        break;
      }
    }

    // The runtime's own loader fetches what it is asked to load into the models directory, so the weights are
    // Downloaded by loading the engine once here — with progress, which the detached synthesizer cannot print —
    // And the synthesizer then loads them from the cache inside a hook's budget
    const runtime = readVoiceRuntime(RUNTIME_MANIFEST_PATH);
    const synthesizer = await createVoiceSynthesizer(runtime, MODELS_DIRECTORY, createVoiceProgressPrinter());
    console.log(
      synthesizer.device === VOICE_CPU_DEVICE
        ? "Weights present; the engine loads on the CPU — no GPU adapter was found, so a reply is synthesized several times slower than real time."
        : `Weights present; the engine loads on ${synthesizer.device}.`,
    );
    // The dub on disk is the gate every spoken reply passes, so it is written only where this run proved the
    // Voice — a setup that failed after it leaves the replies silent rather than broken in the hooks' silence
    const character = await getCurrentCharacter();
    if (!character) {
      writeLanguage(name);
      console.log(`Dub ${name} written; no character to prove the voice with from here.`);
      break;
    }

    const reference = readCharacterReference(character.name, await readPersonaCard(character.name));
    if (!reference)
      console.log(
        `${character.name} has no measured reference, so the longest story line the wiki lists reads for them.`,
      );

    const warmed = await sendVoiceRequest(await getSpeechRequest(VoiceRequestType.Warm, character.name, name, ""));
    const [status, device] = warmed.split(VOICE_STATUS_SEPARATOR);
    if (status !== VoiceStatus.Ok) {
      console.error(
        `The synthesizer did not answer the warm request (${status || "unreachable"}); see ${VOICE_LOG_PATH}.`,
      );
      process.exitCode = 1;
      break;
    }

    writeLanguage(name);
    await sendVoiceRequest(await getSpeechRequest(VoiceRequestType.Speak, character.name, name, VOICE_PROOF_TEXT));
    console.log(`${character.name} spoke through the synthesizer on ${device}; every reply is read from the next one.`);
    break;
  }
  case GenshinVerb.Volume:
    if (!checkIsVolume(name)) {
      console.error(`Volume must be a whole number from 0 to ${MAX_VOLUME}.`);
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
