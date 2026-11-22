import type { Arrival } from "#src/models/shared/overlay/Arrival";
import type { AwaitedWriteOptions } from "#src/models/shared/overlay/AwaitedWriteOptions";
import type { Draft } from "#src/models/shared/overlay/Draft";
import type { Entry } from "#src/models/shared/overlay/Entry";
import type { OptimisticWriteOptions } from "#src/models/shared/overlay/OptimisticWriteOptions";
import type { Table } from "#src/models/shared/overlay/Table";
import type { Versioned } from "#src/models/shared/overlay/Versioned";
import type { listOverlayRows } from "#src/services/shared/overlay/listOverlayRows";
import type { useOverlayStore } from "#src/store/overlay";

import { AwaitedReason } from "#src/models/shared/AwaitedReason";
import { describe, expect, expectTypeOf, test } from "vitest";

type OverlayStore = ReturnType<typeof useOverlayStore>;

interface TestRow extends Versioned {
  id: string;
  name: string;
}

declare const table: Table<TestRow>;

const noop = () => {};
const acceptOptimisticOptions = (options: OptimisticWriteOptions) => options;
const acceptAwaitedOptions = (options: AwaitedWriteOptions) => options;
const entry: Entry = noop;

describe("overlayStore type", () => {
  test("an optimistic write names its entry, and no queue key or rollback", () => {
    expect.hasAssertions();
    // @ts-expect-error A write's queue key comes from its entry, so a caller names none
    acceptOptimisticOptions({ entry, key: "" });
    // @ts-expect-error A dropped entry restores nothing, so a rollback is not a member
    acceptOptimisticOptions({ entry, rollback: noop });
  });

  test("an awaited write takes no key and no entry", () => {
    expect.hasAssertions();

    // @ts-expect-error An awaited write has no entry to queue by, and takes no key
    acceptAwaitedOptions({ key: "" });
    // @ts-expect-error An awaited write has no entry
    acceptAwaitedOptions({ entry });
  });

  test("arrivals are rows with their version, so a row without one is refused", () => {
    expect.hasAssertions();

    // @ts-expect-error A row arrives with the version the server gave it
    expectTypeOf<OverlayStore["arrive"]>().toBeCallableWith(table, { id: "", name: "" });
  });

  test("the view is a readonly list of rows", () => {
    expect.hasAssertions();

    expectTypeOf<ReturnType<typeof listOverlayRows<TestRow>>>().toEqualTypeOf<readonly Readonly<Draft<TestRow>>[]>();
  });

  test("an awaited write's response is the list of its arrivals", () => {
    expect.hasAssertions();

    expectTypeOf<OverlayStore["writeAwaited"]>().parameter(0).returns.toEqualTypeOf<Promise<Arrival[]>>();
  });

  test("an awaited write names the reason the server answers it", () => {
    expect.hasAssertions();

    expectTypeOf<OverlayStore["writeAwaited"]>().toBeCallableWith(() => Promise.resolve([]), {
      awaitedBecause: AwaitedReason.ServerIssuedValue,
    });
    // @ts-expect-error An awaited write names why it waits, since nothing else in the call says the screen holds
    expectTypeOf<OverlayStore["writeAwaited"]>().toBeCallableWith(() => Promise.resolve([]), { onError: noop });
  });
});
