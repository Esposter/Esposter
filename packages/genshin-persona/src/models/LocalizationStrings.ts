import type { StatusReport } from "#src/models/StatusReport";

// Every line the plugin writes in its own voice rather than a character's, as a value where it is fixed and a
// Function where it interpolates — so the arity and the pieces are checked by the compiler and no placeholder is
// Parsed at runtime. A language's module fills in what it has translated and inherits the rest from English, so a
// Half-translated language is a legal state rather than a missing key
export interface LocalizationStrings {
  birthdayNote: (date: string, distance: string) => string;
  interfaceLanguageSet: (language: string) => string;
  languageMustBeOneOf: (languages: string) => string;
  muted: string;
  noCharacterNamed: (name: string) => string;
  noReference: (name: string) => string;
  noSession: string;
  pinIgnored: (name: string) => string;
  pinned: string;
  pinnedInSession: string;
  pinRemoved: string;
  pinRemovedInSession: string;
  replyLanguageSet: (language: string) => string;
  replyLanguageSilencesVoice: string;
  runtimeInstalled: string;
  runtimeInstallFailed: string;
  runtimeInstalling: string;
  setupDone: string;
  setupStatusLineKept: string;
  spoke: (name: string, device: string) => string;
  status: (report: StatusReport) => string;
  teardownDone: string;
  unmuted: string;
  usage: (verbs: string) => string;
  usingInSession: string;
  voiceLanguageAvailable: (dub: string) => string;
  voiceLanguageMustBeOneOf: (dubs: string) => string;
  voiceLanguageUnavailable: string;
  voiceLanguageWritten: (dub: string) => string;
  voiceStatus: (isRuntimeInstalled: boolean, dub: string, device: string, logPath: string) => string;
  voiceUnset: string;
  volumeMustBeWholeNumber: (maxVolume: number) => string;
  volumeSet: (volume: string) => string;
  warmRequestUnanswered: (status: string, logPath: string) => string;
  weightsOnCpu: string;
  weightsOnDevice: (device: string) => string;
}
