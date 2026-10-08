import { Vector3 } from "three";
import { z } from "zod";

// A point or a direction in metres as region data writes one, read into three's vector
export const vector3Schema = z
  .object({ x: z.number(), y: z.number(), z: z.number() })
  .transform((point) => new Vector3(point.x, point.y, point.z)) satisfies z.ZodType<Vector3>;
