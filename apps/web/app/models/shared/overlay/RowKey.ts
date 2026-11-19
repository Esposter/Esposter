import type { KeyValue } from "#src/models/shared/overlay/KeyValue";

// A row's primary key, one value per key column in the table's order
export type RowKey = readonly KeyValue[];
