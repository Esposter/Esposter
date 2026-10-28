import { InvalidOperationError, Operation, takeOne } from "@esposter/shared";

// The dataset and hash a mirrored object's path names, given the path after the mirror base: the hash is the last
// Segment without `.json`, and the dataset is every segment before it, since a key may hold slashes
export const parseGameDataObjectPath = (path: string): { dataset: string; hash: string } => {
  const segments = path
    .replace(/^\//u, "")
    .replace(/\.json$/u, "")
    .split("/");
  const dataset = segments.slice(0, -1).join("/");
  if (dataset === "") throw new InvalidOperationError(Operation.Read, path, "names no dataset");
  return { dataset, hash: takeOne(segments.slice(-1)) };
};
