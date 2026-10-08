// A point of the official Teyvat Interactive Map as its point list gives it: its label, its place in the map's own
// Coordinates, the map's area it lies in and its layer, zero for the ground and above
export interface InteractiveMapPoint {
  area_id: number;
  label_id: number;
  x_pos: number;
  y_pos: number;
  z_level: number;
}
