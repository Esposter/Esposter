// The four dubs the wiki hosts a clip of every line in, by the code the `voice` verb records and every request
// Carries. A frozen object rather than an `enum`: node runs these scripts by stripping types
export const VoiceLanguage = {
  Chinese: "zh",
  English: "en",
  Japanese: "ja",
  Korean: "ko",
} as const;

export type VoiceLanguage = (typeof VoiceLanguage)[keyof typeof VoiceLanguage];
// Widened off the as-const union, so a string typed by a person or read off a request can be looked up in it
export const VoiceLanguages: readonly string[] = Object.values(VoiceLanguage);
