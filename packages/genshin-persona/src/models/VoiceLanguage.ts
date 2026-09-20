// The four dubs the wiki hosts a clip of every line in, by the code the `voice` verb records and every request
// Carries. A frozen object rather than an `enum`: node runs these scripts by stripping types
export const VoiceLanguage = {
  Chinese: "zh",
  English: "en",
  Japanese: "ja",
  Korean: "ko",
} as const;

export type VoiceLanguage = (typeof VoiceLanguage)[keyof typeof VoiceLanguage];
