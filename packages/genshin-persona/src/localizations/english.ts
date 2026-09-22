import type { ResolvedLocalization } from "#src/models/ResolvedLocalization";

// The language the plugin is written in, and the one every other inherits what it has not translated from. Its
// Base verbs are the Teyvat gerunds every spinner shows ahead of a character's own
const english: ResolvedLocalization = {
  characters: {},
  locale: "en-AU",
  strings: {
    birthdayNote: (date, distance) => `[Birthday: ${date}, ${distance}]`,
    interfaceLanguageSet: (language) =>
      `Everything the plugin writes is in ${language} from this reply; the spinner follows at the next session.`,
    languageMustBeOneOf: (languages) => `The language must be one of ${languages}.`,
    muted: "Spoken replies muted.",
    noCharacterNamed: (name) => `No character named "${name}" is in the roster.`,
    noReference: (name) =>
      `${name} has no measured reference, so the longest story line the wiki lists reads for them.`,
    noSession: "No session to use a character in: this runs from inside a Claude Code session.",
    pinIgnored: (name) => `The pin "${name}" names no character in the roster and is ignored.`,
    pinned: "Pinned for every session from the next start.",
    pinnedInSession:
      "Pinned for every session from the next start, and for this one from this reply; the spinner follows at the next session.",
    pinRemoved: "Pin removed; the pick decides again from the next session.",
    pinRemovedInSession: "Pin removed; the pick decides again from the next session, and for this one from this reply.",
    replyLanguageSet: (language) => `Replies are written in ${language} from the next reply.`,
    replyLanguageSilencesVoice:
      "The voice reads English and is not asked for a reply in another script, so replies stay silent in this language until the engine reads it.",
    runtimeInstalled: "Runtime installed.",
    runtimeInstallFailed: "npm could not install the runtime; the voice stays off.",
    runtimeInstalling: "Installing the engine's runtime into the state directory...",
    setupDone: "Status line and spinner written to user settings; both show from the next session.",
    setupStatusLineKept:
      "Spinner written to user settings, shown from the next session; the status line already there is not ours and was left alone.",
    spoke: (name, device) =>
      `${name} spoke through the synthesizer on ${device}, where it starts from now. The hook that reads each reply's spoken lines is written to user settings and runs from the next session.`,
    status: ({
      displayName,
      interfaceLanguage,
      isFromSessionRecord,
      isMuted,
      isPluginSpeakHook,
      isPluginSpinner,
      isPluginStatusLine,
      isReplyLanguageCascaded,
      isRuntimeInstalled,
      pinnedName,
      replyLanguage,
      voiceDevice,
      voiceLanguage,
      volume,
    }) =>
      [
        displayName
          ? `Speaking as ${displayName}, ${isFromSessionRecord ? "this session's own record" : "read off the pin"}.`
          : "No character: this runs from inside a Claude Code session, or nothing is pinned.",
        `Pinned: ${pinnedName || "nothing; the pick decides every session"}.`,
        `Interface language ${interfaceLanguage}; replies in ${replyLanguage}, ${isReplyLanguageCascaded ? "cascaded from it" : "set on its own"}.`,
        voiceLanguage
          ? `Voice: the ${voiceLanguage} dub, runtime ${isRuntimeInstalled ? "installed" : "not installed"}, ${voiceDevice ? `speaking on ${voiceDevice}` : "not yet spoken"}.`
          : "Voice: not set up, so no reply is read aloud.",
        `Replies ${isMuted ? "muted" : `unmuted at volume ${volume}`}.`,
        `Status line ${isPluginStatusLine ? "ours" : "not ours, and left alone"}; spinner ${isPluginSpinner ? "ours" : "not ours"}; speak hook ${isPluginSpeakHook ? "ours" : "not written"}.`,
        isPluginSpinner
          ? "A character or language changed since this session started shows in the spinner at the next one."
          : "",
      ]
        .filter(Boolean)
        .join("\n"),
    teardownDone:
      "Status line, spinner and speak hook removed from user settings; all three go at the next session. The voice's runtime, weights, references and dub are removed; the pick records, the pin and the languages stay.",
    unmuted: "Spoken replies unmuted.",
    usage: (verbs) => `Usage: genshin.ts <${verbs}> [name]`,
    usingInSession: "Speaking as this character from this reply, in this session alone.",
    voiceLanguageAvailable: (dub) => `A ${dub} dub exists; install it with the voice verb to hear replies read in it.`,
    voiceLanguageMustBeOneOf: (dubs) => `The dub must be one of ${dubs}.`,
    voiceLanguageUnavailable:
      "No dub of this language exists, so replies keep reading in whichever voice is already set up.",
    voiceLanguageWritten: (dub) => `Dub ${dub} written; no character to prove the voice with from here.`,
    voiceStatus: (isRuntimeInstalled, dub, device, logPath) =>
      `Runtime ${isRuntimeInstalled ? "installed" : "not installed"}; ${dub} dub; the engine ${device ? `speaks on ${device}` : "has not spoken yet"}; the log is ${logPath}.`,
    voiceUnset: "No voice set up: run this with a dub to install the engine and choose one.",
    volumeMustBeWholeNumber: (maxVolume) => `Volume must be a whole number from 0 to ${maxVolume}.`,
    volumeSet: (volume) => `Spoken replies at volume ${volume} from the next reply.`,
    warmRequestUnanswered: (status, logPath) =>
      `The synthesizer did not answer the warm request (${status}); see ${logPath}.`,
    weightsOnCpu:
      "Weights present; the engine loads on the CPU — no GPU adapter was found, so a reply is synthesized several times slower than real time.",
    weightsOnDevice: (device) =>
      `Weights present; the engine loads on ${device}, and moves down to the CPU by itself if what it synthesizes there is not speech.`,
    weightsPresent: "Weights present.",
  },
  verbs: [
    "Adventuring",
    "Alchemizing",
    "Ascending",
    "Brewing",
    "Charting",
    "Climbing",
    "Commissioning",
    "Cooking",
    "Crafting",
    "Dashing",
    "Delving",
    "Diving",
    "Enhancing",
    "Exploring",
    "Farming",
    "Fishing",
    "Foraging",
    "Forging",
    "Gathering",
    "Gliding",
    "Harvesting",
    "Hunting",
    "Leveling",
    "Mapping",
    "Mining",
    "Questing",
    "Refining",
    "Resting",
    "Roasting",
    "Sailing",
    "Scouting",
    "Sprinting",
    "Surveying",
    "Swimming",
    "Teleporting",
    "Tracking",
    "Trekking",
    "Wandering",
    "Wayfinding",
    "Wishing",
  ],
};

export default english;
