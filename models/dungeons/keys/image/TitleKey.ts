export const TitleKey = {
  TitleScreenBackground: "TitleScreenBackground",
  TitleText: "TitleText",
  TitleTextBackground: "TitleTextBackground",
} as const;
export type TitleKey = keyof typeof TitleKey;
