export interface MondstadtBuildingOptions {
  // Along the front and back walls' normal, the footprint's depth in metres
  depth: number;
  // How many dormers sit evenly along each roof slope
  dormerCount: number;
  // The stone ground floor's height in metres
  groundHeight: number;
  // How far each storey overhangs the one below it on the front and back, in metres
  jettyDepth: number;
  // The gable's rise from the top storey's eaves to the ridge, in metres
  roofRise: number;
  // One to three upper storeys of plaster in a timber frame
  storeyCount: number;
  storeyHeight: number;
  // Along the gable walls, the footprint's width in metres
  width: number;
}
