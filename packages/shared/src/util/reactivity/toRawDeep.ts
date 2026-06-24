import { checkIsPlainObject } from "@/util/object/checkIsPlainObject";
import { getRawData } from "@/util/reactivity/getRawData";

export const toRawDeep = <T extends object>(data: T): T => {
  const rawData = getRawData(data);

  for (const key in rawData)
    if (Object.hasOwn(rawData, key)) {
      const value = rawData[key];
      if (!checkIsPlainObject(value) && !Array.isArray(value)) continue;
      rawData[key] = toRawDeep(value);
    }

  return rawData;
};
