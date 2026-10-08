import type { Vector3 } from "three";

import { vector3Schema } from "#src/models/world/vector3Schema";
import { z } from "zod";

// One straight length of pipework between its two ends, in metres
export interface PipeRun {
  from: Vector3;
  to: Vector3;
}

export const pipeRunSchema = z.object({ from: vector3Schema, to: vector3Schema }) satisfies z.ZodType<PipeRun>;
