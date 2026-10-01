// The four dubs the wiki hosts a clip of every line in, by the code the `voice` verb records and every request
// Carries
export enum VoiceLanguage {
  Chinese = "zh",
  English = "en",
  Japanese = "ja",
  Korean = "ko",
}
// Widened to strings, so a string typed by a person or read off a request can be looked up in it
export const VoiceLanguages: readonly string[] = Object.values(VoiceLanguage);
