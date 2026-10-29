// The open map's frame: a catalogue point's place in the view, in metres from the view's centre, with the catalogue's x
// Up the map and its z to the right, as the game's map draws the catalogue (a quarter turn with no mirror, measured
// Against the map over Jueyun Karst). Every mark, name and the player's pointer on the map is placed through it
export const projectMapPoint = (
  point: { x: number; z: number },
  centre: { x: number; z: number },
): { x: number; y: number } => ({ x: point.z - centre.z, y: centre.x - point.x });
