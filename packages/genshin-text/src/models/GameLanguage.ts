// The fifteen languages the game is written in, spelt the way the community game-data package spells them, so a
// Language one of them names is a language the other answers in
export enum GameLanguage {
  ChineseSimplified = "ChineseSimplified",
  ChineseTraditional = "ChineseTraditional",
  English = "English",
  French = "French",
  German = "German",
  Indonesian = "Indonesian",
  Italian = "Italian",
  Japanese = "Japanese",
  Korean = "Korean",
  Portuguese = "Portuguese",
  Russian = "Russian",
  Spanish = "Spanish",
  Thai = "Thai",
  Turkish = "Turkish",
  Vietnamese = "Vietnamese",
}

export const GameLanguages: readonly GameLanguage[] = Object.values(GameLanguage);
