// A region's place on the official map: the map's area it lies in, and its Oculi by the map's label and the wiki's count
export interface InteractiveMapRegion {
  areaId: number;
  oculus: { count: number; labelId: number };
}
