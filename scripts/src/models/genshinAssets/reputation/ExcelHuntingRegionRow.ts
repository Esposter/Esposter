// One row of the game's hunting region table, of the fields a bounty's spawn needs: its id and the centre and radius of
// The region, which a region the dump does not place leaves empty
export interface ExcelHuntingRegionRow {
  centerPosList: number[];
  centerRadius: number;
  id: number;
}
