import { Vector3 } from "three";

// Longitude zero faces the positive z axis, which is where the camera looks from
export const latLngToVector3 = (lat: number, lng: number, radius: number) => {
  const phi = (lat * Math.PI) / 180;
  const lambda = (lng * Math.PI) / 180;
  return new Vector3(Math.cos(phi) * Math.sin(lambda), Math.sin(phi), Math.cos(phi) * Math.cos(lambda)).multiplyScalar(
    radius,
  );
};
