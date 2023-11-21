export const isObject = (value: unknown): boolean =>
  value !== null && !Array.isArray(value) && typeof value === "object";

export const getRawData = <T>(data: T): T => (isReactive(data) ? toRaw(data) : data);

export function toDeepRaw<T>(data: T): T {
  const rawData = getRawData<T>(data);

  for (const key in rawData) {
    const value = rawData[key];

    if (!isObject(value) && !Array.isArray(value)) continue;

    rawData[key] = toDeepRaw<typeof value>(value);
  }

  return rawData;
}
