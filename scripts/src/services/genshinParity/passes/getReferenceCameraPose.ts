import { referenceCameraPoseSchema } from "#src/models/genshinParity/shared/ReferenceCameraPose";
import { ParityReferenceMap } from "#src/services/genshinParity/shared/ParityReferenceMap";

// The camera a reference records, along `CAMERA_POSE_AXES` (metres, then degrees): the entry's own `cameraPose`, or the
// `cameraPose` prop a world screen takes its camera from. Undefined when the reference records none, so no scene camera
// Stands in for it
export const getReferenceCameraPose = (referenceId: string): number[] | undefined => {
  const reference = ParityReferenceMap[referenceId];
  const recorded = referenceCameraPoseSchema.safeParse(reference?.cameraPose ?? reference?.props?.cameraPose);
  if (!recorded.success) return undefined;
  const {
    fov,
    heading,
    pitch,
    position: [x, y, z],
  } = recorded.data;
  return [x, y, z, heading, pitch, fov];
};
