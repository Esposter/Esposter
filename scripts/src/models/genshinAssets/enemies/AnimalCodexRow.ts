// The fields read off one row of the game's archive of living beings: the description it is filed under, and the
// Archive's group it is shown in
export interface AnimalCodexRow {
  describeId: number;
  id: number;
  subType: string;
  type: string;
}
