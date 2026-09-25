// @vitest-environment nuxt
import type { ResourceActivityEntity } from "@esposter/db-schema";

import { CursorPaginationData } from "#shared/models/pagination/cursor/CursorPaginationData";
import ResourceActivityLog from "@/components/Resource/ActivityLog.vue";
import UiSkeleton from "@/components/Ui/Skeleton.vue";
import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { useActivityStore } from "@/store/resource/activity";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

describe("resourceActivityLog", () => {
  const server = setupMswTrpc();

  // The store outlives the blade, so reopening a resource's Activity re-reads with the last read's rows in hand — a
  // Skeleton over them hides what the reader was just looking at for the length of a round trip
  test("keeps the rows it already has on screen while a read is out", async () => {
    expect.hasAssertions();

    const resourceId = crypto.randomUUID();
    const { promise: readGate, resolve: releaseRead } = Promise.withResolvers<void>();
    const data = Object.assign(new CursorPaginationData<ResourceActivityEntity>(), {
      items: [{ rowKey: crypto.randomUUID() } as ResourceActivityEntity],
    });
    server.use(
      trpcMsw.resource.readActivities.query(async () => {
        await readGate;
        return data;
      }),
    );
    const wrapper = await mountSuspended(ResourceActivityLog, { props: { resourceId }, shallow: true });
    // Set on the route after the mount, which lands on its own route, and through triggerRef since currentRoute is a
    // ShallowRef
    const router = useRouter();
    router.currentRoute.value.params.id = resourceId;
    triggerRef(router.currentRoute);
    const activityStore = useActivityStore();
    const { readItems } = activityStore;
    await readItems(() => Promise.resolve(data));
    await nextTick();

    expect(wrapper.findComponent(UiSkeleton).exists()).toBe(false);

    releaseRead();
    await flushPromises();
  });
});
