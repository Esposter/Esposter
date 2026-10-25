import { Matrix4, Quaternion, Vector3 } from "three";

// A pose between two of a clip's samples, its place along the line between theirs and its turn along the arc
export const interpolatePose = (poses: readonly Matrix4[], sample: number): Matrix4 => {
  const last = poses.length - 1;
  const clamped = Math.min(Math.max(sample, 0), last);
  const index = Math.floor(clamped);
  const [startPosition, endPosition] = [new Vector3(), new Vector3()];
  const [startTurn, endTurn] = [new Quaternion(), new Quaternion()];
  const scale = new Vector3();
  poses[index]?.decompose(startPosition, startTurn, scale);
  poses[Math.min(index + 1, last)]?.decompose(endPosition, endTurn, scale);
  const share = clamped - index;
  return new Matrix4().compose(
    startPosition.lerp(endPosition, share),
    startTurn.slerp(endTurn, share),
    new Vector3(1, 1, 1),
  );
};
