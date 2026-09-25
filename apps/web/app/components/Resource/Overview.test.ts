// @vitest-environment nuxt
import ResourceOverview from "@/components/Resource/Overview.vue";
import UiSkeleton from "@/components/Ui/Skeleton.vue";
import { createResourceListItem } from "@/services/resource/list/createResourceListItem.test";
import { useResourceStore } from "@/store/resource";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test } from "vitest";

describe("resourceOverview", () => {
  // The blade mounts only over a resource already read, so a Refresh re-reads with its essentials in hand — a
  // Skeleton over them hides what the reader was just looking at for the length of a round trip
  test("keeps the essentials on screen while the resource is re-read", async () => {
    expect.hasAssertions();

    const resourceStore = useResourceStore();
    const { isPending } = storeToRefs(resourceStore);
    isPending.value = true;
    const wrapper = await mountSuspended(ResourceOverview, { props: { resource: createResourceListItem() } });

    expect(wrapper.findComponent(UiSkeleton).exists()).toBe(false);
  });
});
