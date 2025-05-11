import type { RecursiveDeepOmit } from "#shared/util/types/RecursiveDeepOmit";
import type { RecursiveKeyOf } from "#shared/util/types/RecursiveKeyOf";

import omitDeepLodash from "omit-deep-lodash";

export const omitDeep = <T extends object, TKeys extends RecursiveKeyOf<T>[] = RecursiveKeyOf<T>[]>(
  object: T,
  ...keys: [...TKeys]
) => omitDeepLodash(object, ...(keys as string[])) as RecursiveDeepOmit<T, TKeys>;
