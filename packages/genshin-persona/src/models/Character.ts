export interface Character {
  // Month and day as the game data spells them, unpadded ("7/15"); "" for the player character
  birthday: string;
  // The game's one-line introduction: who the character is, in the words the data ships
  description: string;
  element: string;
  name: string;
  region: string;
  title: string;
  // The game patch that introduced the character, as its "major.minor" label
  version: string;
}
