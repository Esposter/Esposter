// The game's title logos, one for each client language that has its own; every other language shows the English one
export const TitleLogo = {
  ChineseSimplified: "ChineseSimplified",
  ChineseTraditional: "ChineseTraditional",
  English: "English",
  Japanese: "Japanese",
  Korean: "Korean",
} as const;
export type TitleLogo = (typeof TitleLogo)[keyof typeof TitleLogo];
