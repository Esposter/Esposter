// One difficulty of the Imaginarium Theater: its id, its level from one to five, and the level floor a cast member must
// Reach to take part at it, the acts it runs, and the Alternate Cast it needs beyond its six opening characters: a
// Minimum and the extra it allows past that, absent where the game's table leaves it out
export interface ImaginariumDifficulty {
  actCount: number;
  alternateCastExtra?: number | undefined;
  alternateCastMinimum: number;
  id: number;
  level: number;
  levelFloor: number;
}
