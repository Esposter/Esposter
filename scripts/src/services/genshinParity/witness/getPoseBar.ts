import { FRAME_GATE_PIXELS } from "#src/services/genshinParity/passes/constants";
import { ParityReferenceMap } from "#src/services/genshinParity/shared/ParityReferenceMap";

// The reprojection, in the reference's pixels, `pose --write` holds a solved camera to: the reference's own bar where it
// Sets one, else the camera pass's gate
export const getPoseBar = (referenceId: string): number =>
  ParityReferenceMap[referenceId]?.poseBar ?? FRAME_GATE_PIXELS;
