export const getRawData = <T>(data: T): T => (isReactive(data) ? toRaw(data) : data);
