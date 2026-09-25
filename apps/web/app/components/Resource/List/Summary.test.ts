// @vitest-environment nuxt
import ResourceListSummary from "@/components/Resource/List/Summary.vue";
import UiSkeleton from "@/components/Ui/Skeleton.vue";
import { ResourceType } from "@esposter/db-schema";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test } from "vitest";

describe("resourceListSummary", () => {
  // A filter change re-reads the counts with the last read's cards still in hand — a skeleton over them hides what
  // The reader was just looking at for the length of a round trip
  test("keeps the cards it already has on screen while a read is out", async () => {
    expect.hasAssertions();

    const wrapper = await mountSuspended(ResourceListSummary, {
      props: { counts: [{ count: 0, type: ResourceType.Sheet }], error: "", isPending: true },
    });

    expect(wrapper.findComponent(UiSkeleton).exists()).toBe(false);
  });
});
