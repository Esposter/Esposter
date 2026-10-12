import { DESATURATION_WEIGHTS } from "#src/character/shading/constants";
import { Vector3 } from "three";

// A colour drawn toward its luminance by the desaturation scale, where zero keeps it and one is grey of its own weight
export const getDesaturatedColour = (colour: Vector3, desaturateScale: number): Vector3 => {
  const [weightRed, weightGreen, weightBlue] = DESATURATION_WEIGHTS;
  const luminance = colour.x * weightRed + colour.y * weightGreen + colour.z * weightBlue;
  return new Vector3(
    colour.x + (luminance - colour.x) * desaturateScale,
    colour.y + (luminance - colour.y) * desaturateScale,
    colour.z + (luminance - colour.z) * desaturateScale,
  );
};
