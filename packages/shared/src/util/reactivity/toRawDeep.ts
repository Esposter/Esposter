import { getRawData } from "@/util/reactivity/getRawData";

export const toRawDeep = <T extends object>(data: T): T => {
  const rawData = getRawData(data);
  // Recurse into every nested object — including class instances — so reactive proxies survive
  // Nowhere in the tree. A shallow `toRaw` on an array only unwraps the array, leaving element
  // Proxies (e.g. `Row`s produced by filtering through a reactive proxy) that break `structuredClone`.
  for (const key in rawData)
    if (Object.hasOwn(rawData, key)) {
      const value = rawData[key];
      if (value !== null && typeof value === "object") rawData[key] = toRawDeep(value);
    }

  return rawData;
};
