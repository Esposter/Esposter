import { InvalidOperationError, Operation } from "@esposter/shared";

const CAMERA_POSE_REGEX = /cameraPose: \{[^}]*\}/u;
// `ParityReferenceMap`'s source with one reference's held camera, its props' `cameraPose`, set to a pose along
// `CAMERA_POSE_AXES` at the three places `pose` prints it: the one value of the map a solve writes, for a screen that
// Holds its camera as a prop (the world's), where the login's is the scene's own constants
export const replaceReferenceCameraPose = (source: string, referenceId: string, pose: readonly number[]): string => {
  const entryStart = source.indexOf(`\n  "${referenceId}": {`);
  // The entry runs to the next reference's key, or to the map's end
  const entryEnd = Math.min(
    ...[source.indexOf('\n  "', entryStart + 1), source.indexOf("\n};", entryStart)].filter((index) => index >= 0),
  );
  const entry = source.slice(entryStart, entryEnd);
  if (entryStart === -1 || !CAMERA_POSE_REGEX.test(entry))
    throw new InvalidOperationError(Operation.Update, referenceId, "holds no camera in its props to write");
  const [x = 0, y = 0, z = 0, yaw = 0, pitch = 0, fov = 0] = pose.map((value) => Number(value.toFixed(3)));
  const cameraPose = `cameraPose: { fov: ${fov}, heading: ${yaw}, pitch: ${pitch}, position: [${x}, ${y}, ${z}] }`;
  return `${source.slice(0, entryStart)}${entry.replace(CAMERA_POSE_REGEX, () => cameraPose)}${source.slice(entryEnd)}`;
};
