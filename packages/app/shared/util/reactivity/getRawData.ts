import { isReactive, toRaw } from "vue";

export const getRawData = <T>(data: T): T => (isReactive(data) ? toRaw(data) : data);
