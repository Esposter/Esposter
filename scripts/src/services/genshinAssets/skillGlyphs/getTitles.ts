// The wiki files a talent's name with its colons dropped, or, for a few, made dashes
export const getTitles = (talentName: string): string[] => [
  ...new Set(["", "-"].map((colon) => `File:Talent ${talentName.replaceAll(":", colon)}.png`)),
];
