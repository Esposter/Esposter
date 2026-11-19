import type { Slot } from "#src/models/shared/overlay/Slot";
import type { Table } from "#src/models/shared/overlay/Table";
import type { Versioned } from "#src/models/shared/overlay/Versioned";

export type SlotFor = <TRow extends Versioned>(table: Table<TRow>) => Slot<TRow>;
