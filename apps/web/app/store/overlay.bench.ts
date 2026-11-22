import type { Entry } from "#src/models/shared/overlay/Entry";
import type { WriteResponse } from "#src/models/shared/overlay/WriteResponse";
import type { FriendInSocial } from "@esposter/db-schema";

import { createTable } from "#src/services/shared/overlay/createTable";
import { getHeldRowEntry } from "#src/services/shared/overlay/getHeldRowEntry";
import { useOverlayStore } from "#src/store/overlay";
import { friendsInSocial } from "@esposter/db-schema";
import { BENCHMARK_RUN_OPTIONS } from "@esposter/shared-node/bench";
import { createPinia, setActivePinia } from "pinia";
import { describe, test } from "vitest";

const table = createTable(friendsInSocial);
const epoch = new Date(0);
const neverSettles = () => new Promise<WriteResponse>(() => {});
const createFriend = (index: number, version: number): FriendInSocial => ({
  createdAt: epoch,
  deletedAt: null,
  id: String(index),
  receiverId: "receiverId",
  senderId: "senderId",
  updatedAt: epoch,
  version,
});
// Read-only input to every store, so the rows are built once and each store holds them by reference
const friends = Array.from({ length: 50 }, (_value, index) => createFriend(index, 1));
// Held at version 1, so this arrival is newer and replaces the row it names
const newerFriend = createFriend(0, 2);
// Each entry tombstones one row, the three over three different rows so no write waits behind another
const createDeleteEntry = (index: number): Entry =>
  getHeldRowEntry(table, [String(index)], (row) => ({ ...row, deletedAt: epoch }));
const deleteEntries = [0, 1, 2].map((index) => createDeleteEntry(index));
const readRowCount = (view: { readonly value: readonly unknown[] }) => view.value.length;
const createOverlay = (entries: Entry[]) => {
  setActivePinia(createPinia());
  const overlayStore = useOverlayStore();
  const { arrive, view: readView, writeOptimistic } = overlayStore;
  for (const friend of friends) arrive(table, friend);
  for (const entry of entries) writeOptimistic(neverSettles, { entry });
  const view = readView(table);
  // Read once, so the arrival in a unit dirties a view that holds a value and the unit's read recomputes it
  readRowCount(view);
  return { overlayStore, view };
};
type Overlay = ReturnType<typeof createOverlay>;
const recomputeAfterArrival = ({ overlayStore, view }: Overlay) => {
  const { arrive } = overlayStore;
  arrive(table, newerFriend);
  return readRowCount(view);
};

describe(useOverlayStore, () => {
  test("recompute a page of 50 friend rows with 3 pending entries", async ({ bench }) => {
    let withEntries: Overlay;
    let withoutEntries: Overlay;
    // The arrival mutates held state, so each unit starts from a fresh store, built outside the timing.
    // Compare needs a second task, so the baseline is the same unit with no entries pending.
    await bench.compare(
      bench(
        "with 3 pending entries",
        {
          beforeEach: () => {
            withEntries = createOverlay(deleteEntries);
          },
        },
        () => recomputeAfterArrival(withEntries),
      ),
      bench(
        "without pending entries",
        {
          beforeEach: () => {
            withoutEntries = createOverlay([]);
          },
        },
        () => recomputeAfterArrival(withoutEntries),
      ),
      BENCHMARK_RUN_OPTIONS,
    );
  });
});
