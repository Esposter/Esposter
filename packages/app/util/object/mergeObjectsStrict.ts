import type { MergeObjectsStrict } from "@/util/types/MergeObjectsStrict";

export const mergeObjectsStrict = <T extends object[]>(...objects: T) =>
  Object.assign({}, ...objects) as MergeObjectsStrict<T>;
