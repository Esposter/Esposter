import { getDesaturatedColour } from "#src/character/shading/getDesaturatedColour";
import { Vector3 } from "three";

// The output tone: the desaturated colour pushed away from mid grey by the contrast scale
export const getToneColour = (colour: Vector3, desaturateScale: number, contrastScale: number): Vector3 => {
  const desaturated = getDesaturatedColour(colour, desaturateScale);
  const gain = 1 + contrastScale;
  return new Vector3(
    0.5 + (desaturated.x - 0.5) * gain,
    0.5 + (desaturated.y - 0.5) * gain,
    0.5 + (desaturated.z - 0.5) * gain,
  );
};
