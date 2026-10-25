import { InvalidOperationError, Operation } from "@esposter/shared";

// The rig node of a bone's path. Every bone a renderer names is placed in the skeleton, so a path it lacks is an error
export const readNodeOfPath = (nodeOfPath: ReadonlyMap<string, number>, path: string): number => {
  const node = nodeOfPath.get(path);
  if (node === undefined) throw new InvalidOperationError(Operation.Read, path, "is not in the avatar's skeleton");
  return node;
};
