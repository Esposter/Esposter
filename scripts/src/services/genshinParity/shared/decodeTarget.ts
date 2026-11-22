import { WitnessTarget } from "genshin-world/sceneExport";

// A colour output clips what falls below 0, so the normal targets are drawn encoded into 0 to 1 and let down to -1 to 1
// Again, and the position target is drawn lifted by the lift the page hands back and let down by it, each pixel's
// Fourth channel left as it is
export const decodeTarget = (name: string, values: Float32Array, positionLift: number): Float32Array => {
  if (name === WitnessTarget.Normal || name === WitnessTarget.GeometryNormal)
    return values.map((value, index) => (index % 4 === 3 ? value : value * 2 - 1));
  if (name === WitnessTarget.Position)
    return values.map((value, index) => (index % 4 === 3 ? value : value - positionLift));
  return values;
};
