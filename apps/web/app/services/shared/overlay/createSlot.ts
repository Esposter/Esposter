import type { Slot } from "#src/models/shared/overlay/Slot";
import type { Table } from "#src/models/shared/overlay/Table";
import type { Versioned } from "#src/models/shared/overlay/Versioned";

import { checkIsNewerArrival } from "#src/services/shared/overlay/checkIsNewerArrival";
import { createKeyTrieNode } from "#src/services/shared/overlay/createKeyTrieNode";
import { listKeyTrie } from "#src/services/shared/overlay/listKeyTrie";
import { readKeyTrie } from "#src/services/shared/overlay/readKeyTrie";
import { writeKeyTrie } from "#src/services/shared/overlay/writeKeyTrie";

// The trie sits in a shallow ref and is triggered on each write, so a view that lists it recomputes without making
// Every held row reactive
export const createSlot = <TRow extends Versioned>(table: Table<TRow>): Slot<TRow> => {
  const held = shallowRef(createKeyTrieNode<TRow>());
  return {
    arrive: (row) => {
      const key = table.keyOf(row);
      if (!checkIsNewerArrival(readKeyTrie(held.value, key), row)) return;

      writeKeyTrie(held.value, key, row);
      triggerRef(held);
    },
    list: () =>
      listKeyTrie(held.value)
        .map(([, row]) => row)
        .filter((row) => !row.deletedAt),
    table,
    versionOf: (key) => readKeyTrie(held.value, key)?.version,
  };
};
