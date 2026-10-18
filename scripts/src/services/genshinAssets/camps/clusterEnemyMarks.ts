import type { MapPointPlace } from "#src/models/genshinAssets/points/MapPointPlace";

// Groups a region's enemy marks into camps. Marks of one kind join one camp when a chain of them, each within the
// Clustering distance of the next, links them, and marks of different kinds never join. Returns the camps in the order
// Their first marks were given
export const clusterEnemyMarks = <Kind>(
  places: readonly MapPointPlace<Kind>[],
  clusterDistance: number,
): MapPointPlace<Kind>[][] => {
  const kindPlacesMap = Map.groupBy(places, ({ kind }) => kind);
  return [...kindPlacesMap.values()].flatMap((kindPlaces) => {
    const clustered = new Set<MapPointPlace<Kind>>();
    const camps: MapPointPlace<Kind>[][] = [];
    for (const startPlace of kindPlaces) {
      if (clustered.has(startPlace)) continue;
      clustered.add(startPlace);
      const camp: MapPointPlace<Kind>[] = [];
      const frontier = [startPlace];
      for (let place = frontier.shift(); place !== undefined; place = frontier.shift()) {
        camp.push(place);
        for (const neighbour of kindPlaces) {
          if (clustered.has(neighbour)) continue;
          const distance = Math.hypot(neighbour.position.x - place.position.x, neighbour.position.z - place.position.z);
          if (distance > clusterDistance) continue;
          clustered.add(neighbour);
          frontier.push(neighbour);
        }
      }
      camps.push(camp);
    }
    return camps;
  });
};
