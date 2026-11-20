import type { Draft } from "#src/models/shared/overlay/Draft";
import type { DraftHandle } from "#src/models/shared/overlay/DraftHandle";
import type { RowKey } from "#src/models/shared/overlay/RowKey";
import type { Slot } from "#src/models/shared/overlay/Slot";
import type { Table } from "#src/models/shared/overlay/Table";
import type { Versioned } from "#src/models/shared/overlay/Versioned";

import { checkIsForgotten } from "#src/services/shared/overlay/checkIsForgotten";
import { checkIsNewerArrival } from "#src/services/shared/overlay/checkIsNewerArrival";
import { createKeyTrieNode } from "#src/services/shared/overlay/createKeyTrieNode";
import { listKeyTrie } from "#src/services/shared/overlay/listKeyTrie";
import { readKeyTrie } from "#src/services/shared/overlay/readKeyTrie";
import { writeKeyTrie } from "#src/services/shared/overlay/writeKeyTrie";

// The trie sits in a shallow ref and is triggered on each write, so a view that lists it recomputes without making
// Every held row reactive
export const createSlot = <TRow extends Versioned>(table: Table<TRow>): Slot<TRow> => {
  const held = shallowRef(createKeyTrieNode<TRow>());
  // A held tombstone past the retention is forgotten, so nothing is held for its key and a row arriving for it applies at
  // Any version. Every read of held state goes through here, so the arrival gate and the settle rule agree on it
  const readHeldRow = (key: RowKey) => {
    const heldRow = readKeyTrie(held.value, key);
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
      if (!checkIsNewerArrival(readHeldRow(key), row)) return;

      writeKeyTrie(held.value, key, row);
      triggerRef(held);
    },
    list: () => {
      // The held rows as the draft has written them, then the rows only the draft created
      const heldRows = listKeyTrie(held.value).map(([key, row]) => readKeyTrie(overrides, key) ?? row);
      const createdRows = listKeyTrie(overrides)
        .filter(([key]) => readKeyTrie(held.value, key) === undefined)
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
