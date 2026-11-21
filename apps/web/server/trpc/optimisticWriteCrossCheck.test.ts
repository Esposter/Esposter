import type { Context } from "#server/trpc/context";
import type { Entry } from "#src/models/shared/overlay/Entry";
import type { HeldTables } from "#src/models/shared/overlay/HeldTables";
import type { SlotFor } from "#src/models/shared/overlay/SlotFor";
import type { Table } from "#src/models/shared/overlay/Table";
import type { TablesOf } from "#src/models/shared/overlay/TablesOf";
import type { Versioned } from "#src/models/shared/overlay/Versioned";
import type { RowVersion } from "@esposter/db-schema";

import { readRowVersionsHeader } from "#shared/services/realtime/readRowVersionsHeader";
import { createSlotFor } from "#src/services/shared/overlay/createSlotFor";
import { getHeaderRowKey } from "#src/services/shared/overlay/getHeaderRowKey";
import { recordTouches } from "#src/services/shared/overlay/recordTouches";
import { createSelectSchema } from "drizzle-orm/zod";
import { describe } from "vitest";
import { shallowRef } from "vue";

interface UncoveredWritesInput<TRows extends Versioned[]> {
  // Makes the write through a caller built on the context it is handed, so the response headers it names come back
  call: (context: Context) => Promise<unknown>;
  // The seeded state: each table's held rows are the rows the seeded database holds for it before the write
  context: Context;
  // The optimistic entry the write is issued with, built from the state before the call
  entry: Entry;
  // The procedure's name in its router, which is the path its row versions are read under
  path: string;
  // The overlay tables the write involves, the same list the write's store confirms its rows by
  tables: TablesOf<TRows>;
}

// A row the database holds for a table, checked against the table's select model. The row is held as the table's own row
const checkIsRowOf = <TRow extends Versioned>(table: Table<TRow>, row: unknown): row is TRow =>
  createSelectSchema(table.source).safeParse(row).success;

// Loads a table's rows from the database into the held state, through the slot the overlay reads them from
const seedTable = async <TRow extends Versioned>(db: Context["db"], slotFor: SlotFor, table: Table<TRow>) => {
  const rows = await db.select().from(table.source);
  for (const row of rows) if (checkIsRowOf(table, row)) slotFor(table).arrive(row);
};

// The rows a write named in its response, and those of them its entry does not touch, at the state the seeded database
// Holds. A row the entry shows nothing of is a gap: the write changed a row no optimistic change of it is shown on. A row of
// A table the write does not involve is a gap too, since no entry it makes can show that row
export const getUncoveredWrites = async <TRows extends Versioned[]>({
  call,
  context,
  entry,
  path,
  tables,
}: UncoveredWritesInput<TRows>): Promise<{ named: RowVersion[]; uncovered: RowVersion[] }> => {
  const heldTables = shallowRef<HeldTables>({});
  const slotFor = createSlotFor(heldTables);
  await Promise.all(tables.map((table) => seedTable(context.db, slotFor, table)));
  const touchedKeys = new Set(recordTouches(slotFor, entry).map(({ key, table }) => JSON.stringify([table, key])));

  const responseContext = { ...context, responseHeaders: new Headers() };
  await call(responseContext);
  const named = readRowVersionsHeader(responseContext.responseHeaders, path);
  const uncovered = named.filter(
    (rowVersion) =>
      !tables.some((table) => {
        const key = getHeaderRowKey(table, rowVersion);
        return key !== undefined && touchedKeys.has(JSON.stringify([table.name, key]));
      }),
  );
  return { named, uncovered };
};

describe.todo(getUncoveredWrites);
