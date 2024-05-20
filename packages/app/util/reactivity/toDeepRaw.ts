import { getRawData } from "@/util/reactivity/getRawData";
import { isObject } from "@vueuse/core";

export const toDeepRaw = <T>(data: T): T => {
  const rawData = getRawData<T>(data);

  for (const key in rawData) {
    const value = rawData[key];
    if (!isObject(value) && !Array.isArray(value)) continue;
    rawData[key] = toDeepRaw<typeof value>(value);
  }

  return rawData;
};
