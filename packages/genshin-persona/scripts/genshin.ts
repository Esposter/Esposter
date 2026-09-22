import type { CardedCharacter } from "#src/models/CardedCharacter";
import type { Character } from "#src/models/Character";

import { GenshinVerb, GenshinVerbs } from "#src/models/GenshinVerb";
import { VoiceRequestType } from "#src/models/VoiceRequestType";
import { VoiceStatus } from "#src/models/VoiceStatus";
import { checkHasWeights } from "#src/services/checkHasWeights";
import { checkIsMuted } from "#src/services/checkIsMuted";
import { checkIsOwnVoiceLine } from "#src/services/checkIsOwnVoiceLine";
import { checkIsPluginHookEntry } from "#src/services/checkIsPluginHookEntry";
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
  STATUS_LAUNCHER_PATH,
  STATUS_SCRIPT_PATH,
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
import { getLanguageDisplayName } from "#src/services/getLanguageDisplayName";
import { getSettingsWithoutPluginEntries } from "#src/services/getSettingsWithoutPluginEntries";
import { getSettingsWithStatusLine } from "#src/services/getSettingsWithStatusLine";
import { getSpeechRequest } from "#src/services/getSpeechRequest";
import { getWarmRequest } from "#src/services/getWarmRequest";
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
import { writeLauncher } from "#src/services/writeLauncher";
import { writePin } from "#src/services/writePin";
import { writeReplyLanguage } from "#src/services/writeReplyLanguage";
import { writeSessionSpinner } from "#src/services/writeSessionSpinner";
import { writeSpeakHook } from "#src/services/writeSpeakHook";
import { writeSpinner } from "#src/services/writeSpinner";
import { writeUserSettings } from "#src/services/writeUserSettings";
import { writeVoiceLanguage } from "#src/services/writeVoiceLanguage";
import { writeVolume } from "#src/services/writeVolume";

const [verb, ...nameParts] = process.argv.slice(2);
const name = nameParts.join(" ");
const language = readInterfaceLanguage();
const roster = readRoster(language);
const { locale, strings } = await readLocalization(language);
// A choice a verb offers is a list in the interface language's own punctuation, which the runtime knows
const listFormat = new Intl.ListFormat(locale, { type: "disjunction" });
const today = Temporal.Now.plainDateISO();
const getRosterLine = ({ birthday, displayElement, displayName, region, title, version }: Character) =>
  [displayName, title, displayElement, region, birthday, `v${version}`].filter(Boolean).join(CARD_DETAIL_SEPARATOR);
// An authoring queue prints the characters that meet it newest first, so a patch's arrivals are at the top
const printQueue = async (checkIsQueued: (cardedCharacter: CardedCharacter) => boolean) => {
  const cardedRoster = await readCardedRoster(roster);
  for (const { character } of cardedRoster
    .filter((cardedCharacter) => checkIsQueued(cardedCharacter))
    .toSorted(
      ({ character: a }, { character: b }) =>
        b.version.localeCompare(a.version, undefined, { numeric: true }) || a.name.localeCompare(b.name),
    ))
    console.log(getRosterLine(character));
};
// Empty from a shell, where the tool set nothing
const sessionId = process.env[SESSION_ID_ENVIRONMENT_VARIABLE] ?? "";
// The language is read again rather than closed over, because the `language` verb changes it and then prints the
// Card: the card a verb prints is always in the language in force at the end of that verb
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
// Start, the status line and the speech hook agree. The spinner is not rewritten here: the tool read its keys when
// This session started, so a write now reaches only some other session, and a switch scoped to this one must not
const switchSessionCharacter = async (character: Character) => {
  recordSessionCharacter(character, sessionId, today.toString());
  await printCard(character);
};

// Every knob in one read, for the verbs that report rather than change: the status verb, and either language verb
// Given no argument
const getStatusReport = async () => {
  const pin = readPin();
  const character = sessionId ? await resolveSessionCharacter(roster, sessionId, today) : undefined;
  const replyLanguage = readReplyLanguage();
  const settings = readUserSettings();
  return {
    displayName: character?.displayName ?? pin?.displayName ?? "",
    interfaceLanguage: getLanguageDisplayName(language, language),
    isFromSessionRecord: Boolean(character),
    isMuted: checkIsMuted(),
    isPluginSpeakHook: settings.hooks?.MessageDisplay?.some((entry) => checkIsPluginHookEntry(entry)) ?? false,
    isPluginSpinner: checkIsPluginSpinner(settings),
    isPluginStatusLine: checkIsPluginStatusLine(settings.statusLine),
    isReplyLanguageCascaded: !replyLanguage,
    isRuntimeInstalled: checkIsRuntimeInstalled(),
    pinnedName: pin?.name ?? "",
    replyLanguage: getLanguageDisplayName(replyLanguage ?? language, language),
    voiceDevice: readVoiceDevice(),
    voiceLanguage: readVoiceLanguage(),
    volume: readVolume(),
  };
};

switch (verb) {
  case GenshinVerb.Language: {
    const languageNames = readLanguageNames();
    // Each language is offered in its own words beside the word a person types for it, and either resolves
    const offered = listFormat.format(
      languageNames.map((languageName) => {
        const ownName = getLanguageDisplayName(languageName, languageName);
        return ownName === languageName ? languageName : `${languageName} (${ownName})`;
      }),
    );
    if (!name) {
      console.log(strings.status(await getStatusReport()));
      console.log(strings.languageMustBeOneOf(offered));
      break;
    }

    const canonicalLanguage = getCanonicalLanguage(languageNames, name);
    if (!canonicalLanguage) {
      console.error(strings.languageMustBeOneOf(offered));
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
    console.log(localizedStrings.interfaceLanguageSet(getLanguageDisplayName(canonicalLanguage, canonicalLanguage)));
    // A multi-gigabyte download is never a side effect of a labels setting, so the dub is reported on and left
    // Alone. Three states and three answers: no dub of this language, one that is not installed, and one that
    // Already is — which is the quiet case, since there is nothing for the person to do about it
    const [matchingDub] =
      Object.entries(VoiceLanguageNameMap).find(([, languageName]) => languageName === canonicalLanguage) ?? [];
    if (canonicalLanguage !== DEFAULT_LANGUAGE)
      if (!matchingDub) console.log(localizedStrings.voiceLanguageUnavailable);
      else if (matchingDub !== readVoiceLanguage()) console.log(localizedStrings.voiceLanguageAvailable(matchingDub));

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
    // The pinned character is what every later session speaks as, so the spinner may follow where `setup` opted it in
    await writeSessionSpinner(pinnedCharacter, await readPersonaCard(pinnedCharacter.name), language);
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
    console.log(strings.replyLanguageSet(getLanguageDisplayName(replyLanguage, language)));
    if (replyLanguage !== DEFAULT_LANGUAGE && readVoiceLanguage()) console.log(strings.replyLanguageSilencesVoice);
    break;
  }
  case GenshinVerb.Roster:
    for (const character of roster) console.log(getRosterLine(character));
    break;
  case GenshinVerb.Setup: {
    writeLauncher(STATUS_LAUNCHER_PATH, STATUS_SCRIPT_PATH);
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
  case GenshinVerb.Uncarded:
    await printQueue(({ personaCard }) => !personaCard);
    break;
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
    // No gerunds in this language, or a card whose greeting it has not written. English reads both off the cards,
    // So it is never behind
    if (language === DEFAULT_LANGUAGE) break;

    const { characters } = await readLocalization(language);
    await printQueue(({ character: { name: characterName }, personaCard }) => {
      const localizedPersonaCard = characters[characterName];
      return !localizedPersonaCard?.verbs || (Boolean(personaCard) && !localizedPersonaCard.greeting);
    });
    break;
  }
  case GenshinVerb.Unverbed:
    await printQueue(({ personaCard }) => personaCard?.verbs.length === 0);
    break;
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
          ? strings.voiceStatus(checkIsRuntimeInstalled(), voiceLanguage, readVoiceDevice(), VOICE_LOG_PATH)
          : strings.voiceUnset,
      );
      break;
    }

    if (!checkIsVoiceLanguage(name)) {
      console.error(strings.voiceLanguageMustBeOneOf(listFormat.format(Object.keys(VoiceLanguageNameMap))));
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
    // And the synthesizer then loads them from the cache inside a hook's budget. A cache already holding them skips
    // The load, since the rung the engine speaks on is the proof's to report
    if (checkHasWeights(MODELS_DIRECTORY)) console.log(strings.weightsPresent);
    else {
      const runtime = readVoiceRuntime(RUNTIME_MANIFEST_PATH);
      const synthesizer = await createVoiceSynthesizer(runtime, MODELS_DIRECTORY, {
        onFallback: console.log,
        onProgress: createVoiceProgressPrinter(),
      });
      console.log(
        synthesizer.device === VOICE_CPU_DEVICE ? strings.weightsOnCpu : strings.weightsOnDevice(synthesizer.device),
      );
    }
    // The dub on disk is the gate every spoken reply passes, so it is written only where this run proved the
    // Voice — a setup that failed after it leaves the replies silent rather than broken in the hooks' silence
    const character = await getCurrentCharacter();
    if (!character) {
      writeVoiceLanguage(name);
      writeSpeakHook();
      console.log(strings.voiceLanguageWritten(name));
      break;
    }

    const personaCard = await readPersonaCard(character.name);
    if (!readCharacterReference(character.name, personaCard)) console.log(strings.noReference(character.displayName));

    const warmed = await sendVoiceRequest(getWarmRequest(character.name, personaCard, name));
    const [status, device] = warmed.split(VOICE_STATUS_SEPARATOR);
    if (status !== VoiceStatus.Ok) {
      console.error(strings.warmRequestUnanswered(status || "unreachable", VOICE_LOG_PATH));
      process.exitCode = 1;
      break;
    }

    writeVoiceLanguage(name);
    writeSpeakHook();
    await sendVoiceRequest(
      getSpeechRequest(VoiceRequestType.Speak, character.name, personaCard, name, [VOICE_PROOF_TEXT]),
    );
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
    console.error(strings.usage(GenshinVerbs.join(" | ")));
    process.exitCode = 1;
}
