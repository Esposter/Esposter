import type { KeyValue } from "#src/models/shared/overlay/KeyValue";

export const checkIsKeyValue = <TValue>(value: TValue): value is KeyValue & TValue =>
  typeof value === "string" || typeof value === "number";
