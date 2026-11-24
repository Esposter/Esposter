import type { Draft } from "#src/models/shared/overlay/Draft";
import type { DraftHandle } from "#src/models/shared/overlay/DraftHandle";
import type { HeldTables } from "#src/models/shared/overlay/HeldTables";
import type { KeyTrieNode } from "#src/models/shared/overlay/KeyTrieNode";
import type { RowKey } from "#src/models/shared/overlay/RowKey";
import type { Slot } from "#src/models/shared/overlay/Slot";
import type { Table } from "#src/models/shared/overlay/Table";
import type { Versioned } from "#src/models/shared/overlay/Versioned";

import { checkIsForgotten } from "#src/services/shared/overlay/checkIsForgotten";
import { checkIsNewerArrival } from "#src/services/shared/overlay/checkIsNewerArrival";
import { checkIsRowField } from "#src/services/shared/overlay/checkIsRowField";
import { createKeyTrieNode } from "#src/services/shared/overlay/createKeyTrieNode";
import { listKeyTrie } from "#src/services/shared/overlay/listKeyTrie";
import { readKeyTrie } from "#src/services/shared/overlay/readKeyTrie";
import { writeKeyTrie } from "#src/services/shared/overlay/writeKeyTrie";

// The table's trie sits in the store's held tables, which Pinia carries in a server render's payload.
// Each write assigns the held tables a new object.
// So a view that lists it recomputes without making every held row reactive.
export const createSlot = <TRow extends Versioned>(
  table: Table<TRow>,
  heldTables: { value: HeldTables },
): Slot<TRow> => {
  // The trie of this table's rows, typed by the row: the table's name is the one table whose rows the trie holds
  // The held tables are keyed by table name, which relates the trie to its rows at runtime only.
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- so the trie is typed as the table's rows here
  const readHeldTrie = () => (heldTables.value[table.name] ?? createKeyTrieNode<Versioned>()) as KeyTrieNode<TRow>;
  const writeHeldRow = (key: RowKey, row: TRow) => {
    const heldTrie = readHeldTrie();
    writeKeyTrie(heldTrie, key, row);
    heldTables.value = { ...heldTables.value, [table.name]: heldTrie };
  };
  // A held tombstone past the retention is forgotten, so nothing is held for its key.
  // A row arriving for it applies at any version.
  // Every read of held state goes through here, so the arrival gate, the merge and the settle rule agree on it.
  const readHeldRow = (key: RowKey) => {
    const heldRow = readKeyTrie(readHeldTrie(), key);
    return checkIsForgotten(heldRow) ? undefined : heldRow;
  };
  // Rows an entry wrote in the current draft, over held state until the draft ends
  let overrides = createKeyTrieNode<Draft<TRow>>();
  const handle: DraftHandle = {
    clear: () => {
      overrides = createKeyTrieNode<Draft<TRow>>();
    },
  };
  return {
    arrive: (row) => {
      const key = table.keyOf(row);
      const heldRow = readHeldRow(key);
      // A newer arrival replaces the columns it carries and keeps the held value of each column it lacks.
      // That is because a projection carries fewer columns than the row it projects.
      if (checkIsNewerArrival(heldRow, row)) {
        writeHeldRow(key, heldRow ? { ...heldRow, ...row } : row);
        return true;
      }
      // The held row is at this version or newer. An older one is discarded.
      // An arrival at the held version fills only the columns the held row lacks.
      // So a projection and the full row of one write compose in either order.
      if (heldRow === undefined || checkIsNewerArrival(row, heldRow)) return false;

      const fillsHeldRow = Object.keys(row).some((fieldName) => !checkIsRowField(heldRow, fieldName));
      if (fillsHeldRow) writeHeldRow(key, { ...row, ...heldRow });
      return true;
    },
    list: () => {
      const heldTrie = readHeldTrie();
      // The held rows as the draft has written them, then the rows only the draft created
      const heldRows = listKeyTrie(heldTrie).map(([key, row]) => readKeyTrie(overrides, key) ?? row);
      const createdRows = listKeyTrie(overrides)
        .filter(([key]) => readKeyTrie(heldTrie, key) === undefined)
        .map(([, row]) => row);
      return [...heldRows, ...createdRows].filter((row) => !row.deletedAt);
    },
    read: (draft, key) => {
      draft.touches.push({ key, table: table.name });
      return readKeyTrie(overrides, key) ?? readHeldRow(key);
    },
    table,
    versionOf: (key) => readHeldRow(key)?.version,
    write: (draft, key, row) => {
      draft.touches.push({ key, table: table.name });
      draft.handles.add(handle);
      writeKeyTrie(overrides, key, row);
    },
  };
};
