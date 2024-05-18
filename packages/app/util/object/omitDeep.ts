import type { RecursiveDeepOmit } from "@/util/types/RecursiveDeepOmit";
import omitDeepLodash from "omit-deep-lodash";

export const omitDeep = <T extends object, TKeys extends string[]>(object: T, ...keys: TKeys) =>
  omitDeepLodash(object, keys) as RecursiveDeepOmit<T, TKeys>;
