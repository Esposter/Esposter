import { TravelerGender } from "#src/models/TravelerGender";

// The game data spells the player through placeholders the game fills in as it shows a line: the nickname they
// Chose, which speaks every one of the twins' own turns, and a word per gender as `{M#…}` and `{F#…}` — side by
// Side in either order, or apart, so each is kept or dropped on its own
const NICKNAME_PLACEHOLDER = "{NICKNAME}";
const GENDERED_WORD_REGEX = /\{(?<initial>[FM])#(?<word>[^}]*)\}/gu;
const TravelerGenderInitialMap: Record<TravelerGender, string> = {
  [TravelerGender.Female]: "F",
  [TravelerGender.Male]: "M",
};
// A line of the game data's as the game shows it to a player of this name and gender
export const fillLinePlaceholders = (text: string, nickname: string, gender: TravelerGender): string =>
  text
    .replaceAll(NICKNAME_PLACEHOLDER, nickname)
    .replaceAll(GENDERED_WORD_REGEX, (_placeholder, initial: string, word: string) =>
      initial === TravelerGenderInitialMap[gender] ? word : "",
    );
