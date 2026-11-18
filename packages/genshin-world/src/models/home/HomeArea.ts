// One area of a realm's scene, by its id within the scene, whether it is an exterior area, the load it holds at most, and
// The loads its meter turns orange and red at. The load an area holds is the sum of the loads of the furnishings placed in it
export interface HomeArea {
  areaId: number;
  exterior: boolean;
  loadLimit: number;
  orangeLoad: number;
  redLoad: number;
  sceneId: number;
}
