// The inverse of `projectMapPoint`: a place in the view's metres from its centre, turned back into a catalogue point, so
// a press or a drag on the map is read in the world
export const unprojectMapPoint = (
  place: { x: number; y: number },
  centre: { x: number; z: number },
): { x: number; z: number } => ({ x: centre.x - place.y, z: centre.z + place.x });
