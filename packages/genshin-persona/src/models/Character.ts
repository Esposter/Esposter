export interface Character {
  // What the character belongs to — the Knights of Favonius, the Trial Court, Bubu Pharmacy — and the sharpest
  // Occupation signal the data carries; "" for the player character
  affiliation: string;
  // Month and day as the game data spells them, unpadded ("7/15"); "" for the player character
  birthday: string;
  // The in-game constellation the character is named for, which is the nearest thing Teyvat has to a star sign
  constellation: string;
  // The game's one-line introduction: who the character is, in the words the data ships
  description: string;
  element: string;
  name: string;
  region: string;
  title: string;
  // The game patch that introduced the character, as its "major.minor" label
  version: string;
  // The weapon the character fights with: a coarse read on how they carry themselves
  weapon: string;
}
