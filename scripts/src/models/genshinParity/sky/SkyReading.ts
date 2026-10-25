import type { Vector } from "#src/models/shared/Vector";

// One reference's clear sky as the solve reads it, and the scene's own sky drawn with no cloud beside it
export interface SkyReading {
  data: Buffer;
  height: number;
  image: Buffer;
  ourShot: Buffer;
  pixels: { color: Vector; direction: Vector; pixel: number; slope: Vector }[];
  referenceId: string;
  sky: { moonDirection: Vector; sunDirection: Vector };
  width: number;
}
