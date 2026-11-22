import type { ColumnValue } from "#shared/models/resource/sheet/column/ColumnValue";

import { getUtf8ByteLength } from "@esposter/shared";

// Measured in UTF-8 bytes, the unit a column's size is displayed in, over the JSON text the value is stored as
export const getValueSize = (value: ColumnValue | undefined) => getUtf8ByteLength(JSON.stringify(value ?? null));
