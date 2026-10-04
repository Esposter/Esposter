// @vitest-environment nuxt
import { createResourceListItem } from "#shared/services/resource/list/createResourceListItem.test";
import { SnapshotChannelDefinitionMap } from "#shared/services/resource/SnapshotChannelDefinitionMap";
import ResourceOverview from "@/components/Resource/Overview.vue";
import UiSkeleton from "@/components/Ui/Skeleton.vue";
import { useResourceStore } from "@/store/resource";
import { SnapshotChannel } from "@esposter/db-schema";
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

  // Every revision expires with its age while the counter never goes back down, so a resource untouched past the age
  // Has nothing left to return to and must not say it does
  test.each([
    ["claims a restore point while the newest revision is within its age", 1, true],
    ["claims none once the newest revision has expired", -1, false],
  ])("%s", async (_title, direction, isAvailable) => {
    expect.hasAssertions();

    const { maxAgeMs } = SnapshotChannelDefinitionMap[SnapshotChannel.Revisions];
    const revisionTakenAt = new Date(Date.now() - maxAgeMs + direction * maxAgeMs * 0.5);
    const wrapper = await mountSuspended(ResourceOverview, {
      props: { resource: createResourceListItem({ revisionTakenAt, revisionVersion: 1 }) },
    });

    expect(wrapper.text().includes("Restore point available")).toBe(isAvailable);
  });
});
