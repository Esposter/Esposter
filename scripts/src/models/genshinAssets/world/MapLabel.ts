// A level-two area's label on the map as the open world's record holds it.
// It holds the text id of its name, the level-one area it lies in, and its own id in the game's area table.
// It also holds the point its label sits at in the catalogue's axes
export interface MapLabel {
  levelOneAreaId: number;
  levelTwoAreaId: number;
  nameTextId: string;
  x: number;
  z: number;
}
