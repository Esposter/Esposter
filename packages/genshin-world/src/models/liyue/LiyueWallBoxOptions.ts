// A box lying in a wall's plane: across the wall it is a thickness centred on its face, and along the wall it runs from
// Its start to its end, along x when it is along x and along z otherwise
export interface LiyueWallBoxOptions {
  bottom: number;
  end: number;
  face: number;
  isAlongX: boolean;
  start: number;
  thickness: number;
  top: number;
}
