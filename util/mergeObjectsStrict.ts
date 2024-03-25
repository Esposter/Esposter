import type { MergeObjectsStrict } from "@/util/types/MergeObjectsStrict";

export const mergeObjectsStrict = <T extends object[]>(...objects: T) => {
  const mergedObject = {};

  for (const object of objects) Object.assign(mergedObject, object);

  return mergedObject as MergeObjectsStrict<T>;
};
