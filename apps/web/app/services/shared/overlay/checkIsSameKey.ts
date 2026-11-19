import type { RowKey } from "#src/models/shared/overlay/RowKey";

import { takeOne } from "@esposter/shared";

export const checkIsSameKey = (key: RowKey, other: RowKey): boolean =>
  key.length === other.length && key.every((part, index) => part === takeOne(other, index));
