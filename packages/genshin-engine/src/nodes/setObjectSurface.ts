import type { SurfaceDetail } from "#src/models/nodes/SurfaceDetail";
import type { ColorRepresentation, Object3D } from "three";

import { ObjectSurface } from "#src/models/nodes/ObjectSurface";
import { computeSurfaceOctaves } from "#src/nodes/computeSurfaceOctaves";
import { OBJECT_SURFACE_KEY } from "#src/nodes/constants";
import { Color } from "three";

// Gives a mesh its own colour and detail, which a toon material made with `isObjectSurface` draws it in
export const setObjectSurface = (object: Object3D, color: ColorRepresentation, detail?: SurfaceDetail): void => {
  const amplitudes = detail ? computeSurfaceOctaves(detail).map(({ amplitude }) => amplitude) : [];
  object.userData[OBJECT_SURFACE_KEY] = new ObjectSurface(new Color(color), amplitudes);
};
