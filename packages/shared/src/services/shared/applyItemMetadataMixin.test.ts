import { applyItemMetadataMixin } from "@/services/shared/applyItemMetadataMixin";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe(applyItemMetadataMixin, () => {
  // The mixin stamps both timestamps from `new Date()`, so a frozen clock is what makes them exactly assertable
  beforeEach(() => {
    vi.useFakeTimers({ now: 0 });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("applies", () => {
    expect.hasAssertions();

    const ItemWithMetadata = applyItemMetadataMixin(
      class Base {
        void() {}
      },
    );
    const item = new ItemWithMetadata();

    expect(item.createdAt).toStrictEqual(new Date(0));
    expect(item.updatedAt).toStrictEqual(new Date(0));
    expect(item.deletedAt).toBeNull();
  });
});
