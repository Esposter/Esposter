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
  // The element and the name as the interface language spells them, equal to the two above under English. Every
  // Other field here is display alone, so it is localized in place and needs no twin
  displayElement: string;
  displayName: string;
  // The English element, which is the status line's colour key and never shown; `displayElement` is what is read
  element: string;
  // The English name, which is the identity: the pin, the pick records, the reference clips, the card modules and
  // Every wiki lookup are keyed by it, so it is stable across a change of interface language
  name: string;
  region: string;
  title: string;
  // The game patch that introduced the character, as its "major.minor" label
  version: string;
  // The weapon the character fights with: a coarse read on how they carry themselves
  weapon: string;
}
