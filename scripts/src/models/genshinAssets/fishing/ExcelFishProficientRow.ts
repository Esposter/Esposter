// One proficiency row of the game's table: each reel gear, the number it is reached at, and how fast the tension rises
// And falls while the reel is held and released at it
export interface ExcelFishProficientRow {
  gear: { inSpeed: number; num: number; outSpeed: number }[];
  id: number;
}
