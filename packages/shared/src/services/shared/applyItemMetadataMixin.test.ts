import { applyItemMetadataMixin } from "@/services/shared/applyItemMetadataMixin";
import { describe, expect, test } from "vitest";

describe(applyItemMetadataMixin, () => {
  test("applies", () => {
    expect.hasAssertions();

    const ItemWithMetadata = applyItemMetadataMixin(
      class Base {
        void() {}
      },
    );
    const item = new ItemWithMetadata();

    expect(item.createdAt).toBeInstanceOf(Date);
    expect(item.updatedAt).toBeInstanceOf(Date);
    expect(item.deletedAt).toBeNull();
  });
});
