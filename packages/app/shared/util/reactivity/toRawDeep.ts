import { getRawData } from "#shared/util/reactivity/getRawData";
import { isObject } from "@vueuse/core";

export const toRawDeep = <T extends object>(data: T): T => {
  const rawData = getRawData<T>(data);

  for (const key in rawData)
    if (Object.hasOwn(rawData, key)) {
      const value = rawData[key];
      if (!isObject(value) && !Array.isArray(value)) continue;
      rawData[key] = toRawDeep<typeof value>(value);
    }

  return rawData;
};
