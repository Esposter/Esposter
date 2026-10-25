import { getPixelDisplayColor } from "#src/services/genshinParity/sky/getPixelDisplayColor";

// A shot's pixels as linear colours in a four-float target, which `compareFamilyColour` reads as it reads a surface's
export const toColourTarget = (shot: Buffer, pixelCount: number): Float32Array => {
  const colour = new Float32Array(pixelCount * 4);
  for (let pixel = 0; pixel < pixelCount; pixel++) colour.set(getPixelDisplayColor(shot, pixel), pixel * 4);
  return colour;
};
