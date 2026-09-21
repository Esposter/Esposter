import type { Character } from "#src/models/Character";
import type { VoiceLanguage } from "#src/models/VoiceLanguage";

import { GenshinVerb } from "#src/models/GenshinVerb";
import { VoiceRequestType } from "#src/models/VoiceRequestType";
import { VoiceStatus } from "#src/models/VoiceStatus";
import { checkIsMuted } from "#src/services/checkIsMuted";
import { checkIsOwnVoiceLine } from "#src/services/checkIsOwnVoiceLine";
import { checkIsPluginSpinner } from "#src/services/checkIsPluginSpinner";
import { checkIsPluginStatusLine } from "#src/services/checkIsPluginStatusLine";
import { checkIsRuntimeInstalled } from "#src/services/checkIsRuntimeInstalled";
import { checkIsVoiceLanguage } from "#src/services/checkIsVoiceLanguage";
import { checkIsVolume } from "#src/services/checkIsVolume";
import { connectVoiceServer } from "#src/services/connectVoiceServer";
import {
  CARD_DETAIL_SEPARATOR,
  DEFAULT_LANGUAGE,
  MAX_VOLUME,
  MODELS_DIRECTORY,
  RUNTIME_MANIFEST_PATH,
  SESSION_ID_ENVIRONMENT_VARIABLE,
  VOICE_CPU_DEVICE,
  VOICE_LOG_PATH,
  VOICE_PROOF_TEXT,
  VOICE_STATUS_SEPARATOR,
  VoiceLanguageNameMap,
} from "#src/services/constants";
import { createVoiceProgressPrinter } from "#src/services/createVoiceProgressPrinter";
import { createVoiceSynthesizer } from "#src/services/createVoiceSynthesizer";
import { deletePin } from "#src/services/deletePin";
import { deleteVoiceDevice } from "#src/services/deleteVoiceDevice";
import { deleteVoiceState } from "#src/services/deleteVoiceState";
import { findCharacterByName } from "#src/services/findCharacterByName";
import { formatCard } from "#src/services/formatCard";
import { getCanonicalLanguage } from "#src/services/getCanonicalLanguage";
import { getCard } from "#src/services/getCard";
import { getSettingsWithoutPluginEntries } from "#src/services/getSettingsWithoutPluginEntries";
import { getSettingsWithStatusLine } from "#src/services/getSettingsWithStatusLine";
import { getSpeechRequest } from "#src/services/getSpeechRequest";
import { installVoiceRuntime } from "#src/services/installVoiceRuntime";
import { pickCurrentCharacter } from "#src/services/pickCurrentCharacter";
import { readCardedRoster } from "#src/services/readCardedRoster";
import { readCharacterReference } from "#src/services/readCharacterReference";
import { readInterfaceLanguage } from "#src/services/readInterfaceLanguage";
import { readLanguageNames } from "#src/services/readLanguageNames";
import { readLocalization } from "#src/services/readLocalization";
import { readPersonaCard } from "#src/services/readPersonaCard";
import { readPin } from "#src/services/readPin";
import { readReplyLanguage } from "#src/services/readReplyLanguage";
import { readRoster } from "#src/services/readRoster";
import { readSpinner } from "#src/services/readSpinner";
import { readUserSettings } from "#src/services/readUserSettings";
import { readVoiceDevice } from "#src/services/readVoiceDevice";
import { readVoiceLanguage } from "#src/services/readVoiceLanguage";
import { readVoiceLines } from "#src/services/readVoiceLines";
import { readVoiceRuntime } from "#src/services/readVoiceRuntime";
import { readVolume } from "#src/services/readVolume";
import { recordSessionCharacter } from "#src/services/recordSessionCharacter";
import { resolveSessionCharacter } from "#src/services/resolveSessionCharacter";
import { sendVoiceRequest } from "#src/services/sendVoiceRequest";
import { setMuted } from "#src/services/setMuted";
import { writeInterfaceLanguage } from "#src/services/writeInterfaceLanguage";
import { writePin } from "#src/services/writePin";
import { writeReplyLanguage } from "#src/services/writeReplyLanguage";
import { writeSessionSpinner } from "#src/services/writeSessionSpinner";
import { writeSpinner } from "#src/services/writeSpinner";
import { writeStatusLauncher } from "#src/services/writeStatusLauncher";
import { writeUserSettings } from "#src/services/writeUserSettings";
import { writeVoiceLanguage } from "#src/services/writeVoiceLanguage";
import { writeVolume } from "#src/services/writeVolume";

const [verb, ...nameParts] = process.argv.slice(2);
const name = nameParts.join(" ");
const language = readInterfaceLanguage();
const roster = readRoster(language);
const { strings } = await readLocalization(language);
const today = Temporal.Now.plainDateISO();
const getRosterLine = ({ birthday, displayElement, displayName, region, title, version }: Character) =>
  [displayName, title, displayElement, region, birthday, `v${version}`].filter(Boolean).join(CARD_DETAIL_SEPARATOR);
const compareVersionsDescending = (a: Character, b: Character) =>
  b.version.localeCompare(a.version, undefined, { numeric: true }) || a.name.localeCompare(b.name);
// Set in every Bash tool subprocess, so a verb the model runs knows the session it runs in; empty from a shell
const sessionId = process.env[SESSION_ID_ENVIRONMENT_VARIABLE] ?? "";
const printCard = async (character: Character) => {
  const localization = await readLocalization(readInterfaceLanguage());
  const card = getCard(character, today, localization, await readPersonaCard(character.name));
  console.log(formatCard(card));
};
// This session's character when run inside one, else the pin, else a fresh pick: the resolution the start hook runs,
// So `today` answers who is speaking now. Under the lore pick a fresh ask may answer differently, which is the point
// Of it
const getCurrentCharacter = () => {
  const pin = readPin();
  if (pin && !findCharacterByName(roster, pin.name)) console.log(strings.pinIgnored(pin.name));

  return resolveSessionCharacter(roster, sessionId, today);
};
// The session speaks as the character from the reply that relays the card: its record is rewritten so every later
// Start, the status line and the speech hook agree, and the spinner follows where `setup` opted it in. The record
// Carries the name the interface language spells them by, so a change of language rewrites it the same way
const switchSessionCharacter = async (character: Character) => {
  const currentLanguage = readInterfaceLanguage();
  recordSessionCharacter(character, sessionId, today.toString());
  await writeSessionSpinner(character, await readPersonaCard(character.name), currentLanguage);
  await printCard(character);
};

switch (verb) {
  case GenshinVerb.Language: {
    const languageNames = readLanguageNames();
    if (!name) {
      console.log(strings.status(await getStatusReport()));
      console.log(strings.languageMustBeOneOf(languageNames.join(", ")));
      break;
    }

    const canonicalLanguage = getCanonicalLanguage(languageNames, name);
    if (!canonicalLanguage) {
      console.error(strings.languageMustBeOneOf(languageNames.join(", ")));
      process.exitCode = 1;
      break;
    }

    writeInterfaceLanguage(canonicalLanguage);
    // Everything downstream reads the language afresh: the roster in it, which builds that language's cache, the
    // Words that are ours in it, and the session's record and spinner, whose name is drawn from it
    const localizedRoster = readRoster(canonicalLanguage);
    const { strings: localizedStrings } = await readLocalization(canonicalLanguage);
    const character = await resolveSessionCharacter(localizedRoster, sessionId, today);
    if (character && sessionId) {
      recordSessionCharacter(character, sessionId, today.toString());
      await writeSessionSpinner(character, await readPersonaCard(character.name), canonicalLanguage);
    }

    const pin = readPin();
    const pinnedCharacter = findCharacterByName(localizedRoster, pin?.name ?? "");
    if (pinnedCharacter) writePin(pinnedCharacter);
    console.log(localizedStrings.interfaceLanguageSet(canonicalLanguage));
    // A multi-gigabyte download is never a side effect of a labels setting, so the dub is reported on and left
    // Alone: whether one of this language exists, and never an install
    const matchingDub = Object.entries(VoiceLanguageNameMap).find(
      ([, languageName]) => languageName === canonicalLanguage,
    );
    if (canonicalLanguage !== DEFAULT_LANGUAGE)
      console.log(
        matchingDub && matchingDub[0] !== readVoiceLanguage()
          ? localizedStrings.voiceLanguageAvailable(matchingDub[0])
          : localizedStrings.voiceLanguageUnavailable,
      );
    if (character) await printCard(character);
    break;
  }
  case GenshinVerb.Lines: {
    const character = findCharacterByName(roster, name);
    if (!character) {
      console.error(strings.noCharacterNamed(name));
      process.exitCode = 1;
      break;
    }

    console.log(`${getRosterLine(character)}\n${character.description}`);
    const voiceLines = await readVoiceLines(character.name, language);
    for (const { text, title } of voiceLines.filter((line) => checkIsOwnVoiceLine(line)))
      console.log(`- ${title}: ${text}`);
    break;
  }
  case GenshinVerb.Mute:
    setMuted(true);
    console.log(strings.muted);
    break;
  case GenshinVerb.Pin: {
    const pinnedCharacter = findCharacterByName(roster, name);
    if (!pinnedCharacter) {
      console.error(strings.noCharacterNamed(name));
      process.exitCode = 1;
      break;
    }

    writePin(pinnedCharacter);
    if (sessionId) {
      await switchSessionCharacter(pinnedCharacter);
      console.log(strings.pinnedInSession);
      break;
    }

    await printCard(pinnedCharacter);
    console.log(strings.pinned);
    break;
  }
  case GenshinVerb.Reply: {
    if (!name) {
      console.log(strings.status(await getStatusReport()));
      break;
    }

    // Anything the model can write is a legal reply language, so this is not held to the data package's fifteen;
    // The canonical spelling is taken where it names one of them, so the common case reads as the language verb's
    const replyLanguage = getCanonicalLanguage(readLanguageNames(), name) ?? name;
    writeReplyLanguage(replyLanguage);
    console.log(strings.replyLanguageSet(replyLanguage));
    if (replyLanguage !== DEFAULT_LANGUAGE && readVoiceLanguage()) console.log(strings.replyLanguageSilencesVoice);
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
    if (character) writeSpinner(await readSpinner(character, await readPersonaCard(character.name), language));
    console.log(checkIsPluginStatusLine(settings.statusLine) ? strings.setupDone : strings.setupStatusLineKept);
    break;
  }
  case GenshinVerb.Status:
    console.log(strings.status(await getStatusReport()));
    break;
  case GenshinVerb.Teardown: {
    const userSettings = readUserSettings();
    const settings = getSettingsWithoutPluginEntries(userSettings);
    writeUserSettings(settings);
    await deleteVoiceState();
    console.log(strings.teardownDone);
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
    console.log(strings.unmuted);
    break;
  case GenshinVerb.Unpin: {
    deletePin();
    const character = sessionId ? await pickCurrentCharacter(roster, today) : undefined;
    if (!character) {
      console.log(strings.pinRemoved);
      break;
    }

    await switchSessionCharacter(character);
    console.log(strings.pinRemovedInSession);
    break;
  }
  case GenshinVerb.Untranslated: {
    // The queue the language modules are filled from, the way `unverbed` is the queue the cards' verbs are: who has
    // No gerunds in this language. English reads them off the cards, so it is never behind
    const { characterVerbs } = await readLocalization(language);
    if (language === DEFAULT_LANGUAGE) break;

    for (const character of roster
      .filter(({ name: characterName }) => !characterVerbs[characterName])
      .toSorted(compareVersionsDescending))
      console.log(getRosterLine(character));
    break;
  }
  case GenshinVerb.Use: {
    const character = findCharacterByName(roster, name);
    if (!character) {
      console.error(strings.noCharacterNamed(name));
      process.exitCode = 1;
      break;
    }

    if (!sessionId) {
      console.error(strings.noSession);
      process.exitCode = 1;
      break;
    }

    await switchSessionCharacter(character);
    console.log(strings.usingInSession);
    break;
  }
  case GenshinVerb.Voice: {
    if (!name) {
      const voiceLanguage = readVoiceLanguage();
      console.log(
        voiceLanguage
          ? strings.voiceStatus(checkIsRuntimeInstalled(), voiceLanguage, readVoiceDevice() ?? "", VOICE_LOG_PATH)
          : strings.voiceUnset,
      );
      break;
    }

    if (!checkIsVoiceLanguage(name)) {
      console.error(strings.voiceLanguageMustBeOneOf(Object.keys(VoiceLanguageNameMap).join(", ")));
      process.exitCode = 1;
      break;
    }

    // The proof walks the device ladder from the top, so a rung this machine once demoted is tried again here and
    // Nowhere else: the rung on file is cleared, and a synthesizer still running — on that rung, or on the runtime
    // Being replaced — is stopped, so the one the warm spawns loads afresh
    deleteVoiceDevice();
    await connectVoiceServer({ type: VoiceRequestType.Stop });
    if (checkIsRuntimeInstalled()) console.log(strings.runtimeInstalled);
    else {
      console.log(strings.runtimeInstalling);
      if (!installVoiceRuntime()) {
        console.error(strings.runtimeInstallFailed);
        process.exitCode = 1;
        break;
      }
    }

    // The runtime's own loader fetches what it is asked to load into the models directory, so the weights are
    // Downloaded by loading the engine once here — with progress, which the detached synthesizer cannot print —
    // And the synthesizer then loads them from the cache inside a hook's budget
    const runtime = readVoiceRuntime(RUNTIME_MANIFEST_PATH);
    const synthesizer = await createVoiceSynthesizer(runtime, MODELS_DIRECTORY, {
      onFallback: console.log,
      onProgress: createVoiceProgressPrinter(),
    });
    console.log(
      synthesizer.device === VOICE_CPU_DEVICE ? strings.weightsOnCpu : strings.weightsOnDevice(synthesizer.device),
    );
    // The dub on disk is the gate every spoken reply passes, so it is written only where this run proved the
    // Voice — a setup that failed after it leaves the replies silent rather than broken in the hooks' silence
    const character = await getCurrentCharacter();
    if (!character) {
      writeVoiceLanguage(name);
      console.log(strings.voiceLanguageWritten(name));
      break;
    }

    const reference = readCharacterReference(character.name, await readPersonaCard(character.name));
    if (!reference) console.log(strings.noReference(character.displayName));

    const warmed = await sendVoiceRequest(await getSpeechRequest(VoiceRequestType.Warm, character.name, name, ""));
    const [status, device] = warmed.split(VOICE_STATUS_SEPARATOR);
    if (status !== VoiceStatus.Ok) {
      console.error(strings.warmRequestUnanswered(status || "unreachable", VOICE_LOG_PATH));
      process.exitCode = 1;
      break;
    }

    writeVoiceLanguage(name);
    await sendVoiceRequest(await getSpeechRequest(VoiceRequestType.Speak, character.name, name, VOICE_PROOF_TEXT));
    console.log(strings.spoke(character.displayName, device ?? ""));
    break;
  }
  case GenshinVerb.Volume:
    if (!checkIsVolume(name)) {
      console.error(strings.volumeMustBeWholeNumber(MAX_VOLUME));
      process.exitCode = 1;
      break;
    }

    writeVolume(name);
    console.log(strings.volumeSet(name));
    break;
  default:
    console.error(strings.usage(Object.values(GenshinVerb).join(" | ")));
    process.exitCode = 1;
}

// Every knob in one read, for the verbs that report rather than change: the status verb, and either language verb
// Given no argument. Declared after the switch because a function declaration is hoisted and this keeps the verbs
// Themselves at the top of the file
async function getStatusReport() {
  const pin = readPin();
  const character = sessionId ? await resolveSessionCharacter(roster, sessionId, today) : undefined;
  const replyLanguage = readReplyLanguage();
  const settings = readUserSettings();
  const voiceLanguage: undefined | VoiceLanguage = readVoiceLanguage();
  return {
    displayName: character?.displayName ?? pin?.displayName ?? "",
    interfaceLanguage: language,
    isFromSessionRecord: Boolean(character),
    isMuted: checkIsMuted(),
    isPluginSpinner: checkIsPluginSpinner(settings),
    isPluginStatusLine: checkIsPluginStatusLine(settings.statusLine),
    isReplyLanguageCascaded: !replyLanguage,
    isRuntimeInstalled: checkIsRuntimeInstalled(),
    pinnedName: pin?.name ?? "",
    replyLanguage: replyLanguage ?? language,
    voiceDevice: readVoiceDevice() ?? "",
    voiceLanguage,
    volume: readVolume(),
  };
}
