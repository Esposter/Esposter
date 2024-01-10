import { type RecursiveDeepOmit } from "@/util/types/RecursiveDeepOmit";
import omitDeepLodash from "omit-deep-lodash";

export const omitDeep = <T extends object, TKeys extends string[]>(value: T, ...keys: TKeys) =>
  omitDeepLodash(value, keys) as RecursiveDeepOmit<T, TKeys>;
