import type { PipeRun } from "#src/models/nod-krai/PipeRun";
import type { Smokestack } from "#src/models/nod-krai/Smokestack";

// A dieselpunk structure's massing: its boxes, as createBoxesGeometry takes them, the pipework running over it and the
// smokestacks standing on it
export interface DieselpunkOptions {
  boxes: readonly (readonly number[])[];
  pipeRadius: number;
  pipeRuns: PipeRun[];
  smokestacks: Smokestack[];
}
