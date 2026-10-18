// The fields read off one row of the game's archive of living beings: the description it is filed under, and the
// Archive's group it is shown in. The dump leaves out a kind or a group at its default, which the reader names
export interface AnimalCodexRow {
  describeId: number;
  id: number;
  subType?: string;
  type?: string;
}
