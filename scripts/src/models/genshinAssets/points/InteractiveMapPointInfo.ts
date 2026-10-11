import type { InteractiveMapPoint } from "#src/models/genshinAssets/points/InteractiveMapPoint";

// A point of the official map as its info endpoint gives it: the point and the text its contributors wrote on it, which
// For a viewpoint opens with the viewpoint's name, often after its area's and before a note on how it is reached
export interface InteractiveMapPointInfo extends InteractiveMapPoint {
  content: string;
}
