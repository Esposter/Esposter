// @vitest-environment nuxt

import { createResourceListItem } from "#shared/services/resource/list/createResourceListItem.test";
import { useRestoreResources } from "#src/composables/resource/useRestoreResources";
import { resourceTable } from "#src/services/resource/overlay/constants";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useOverlayStore } from "#src/store/overlay";
import { waitForSynchronizedFunctions } from "@esposter/shared";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

// The rows the overlay shows, which is what the list or the blade reads
const getLiveRows = () => {
  const overlayStore = useOverlayStore();
  const { view } = overlayStore;
  return view(resourceTable).value;
};

describe(useRestoreResources, () => {
  const { trpcMsw } = setupMswTrpc();

  // The held tombstone is read against the clock, and one past the retention counts as nothing held, so the clock is
  // Pinned at the epoch the tombstone is dated from
  beforeEach(() => {
    vi.useFakeTimers({ now: 0, toFake: ["Date"] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // The blade's undo of a delete restores a row the overlay holds as a tombstone, and nothing reads it again, so the row
  // Comes back into the view from the restore alone: as the restore is sent, and at the version its answer names
  test("shows a deleted resource in the view once it is restored, with no read", async () => {
    expect.hasAssertions();

    const resource = createResourceListItem();
    // The row as the delete's answer left it: a tombstone, one version on
    const overlayStore = useOverlayStore();
    const { arrive } = overlayStore;
    arrive(resourceTable, { ...resource, deletedAt: new Date(0), version: resource.version + 1 });
    trpcMsw.resource.restoreResources.mutation(() => [{ ...resource, deletedAt: null, version: resource.version + 2 }]);
    useRestoreResources().restoreResources([resource]);

    expect(getLiveRows()).toStrictEqual([{ ...resource, deletedAt: null, version: resource.version + 1 }]);
    await waitForSynchronizedFunctions();
    expect(getLiveRows()).toStrictEqual([{ ...resource, deletedAt: null, version: resource.version + 2 }]);
  });
});
