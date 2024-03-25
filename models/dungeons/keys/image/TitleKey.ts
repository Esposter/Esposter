export const TitleKey = {
  TitleScreenBackground: "TitleScreenBackground",
  TitleTextBackground: "TitleTextBackground",
  TitleText: "TitleText",
} as const;
export type TitleKey = keyof typeof TitleKey;
