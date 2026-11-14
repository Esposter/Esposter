// @vitest-environment nuxt
import { Visual } from "#shared/models/dashboard/data/Visual";
import { VisualType } from "#shared/models/dashboard/data/VisualType";
import { DatasetAggregationType } from "#shared/models/dataset/DatasetAggregationType";
import { DatasetProviderType } from "#shared/models/dataset/DatasetProviderType";
import DashboardVisualCard from "@/components/Dashboard/Visual/Card.vue";
import DashboardVisualIndex from "@/components/Dashboard/Visual/Index.vue";
import DashboardVisualTable from "@/components/Dashboard/Visual/Table.vue";
import UiErrorState from "@/components/Ui/ErrorState.vue";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { TRPCError } from "@trpc/server";
import { flushPromises } from "@vue/test-utils";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";
import { CollisionMode, CompactType } from "vue-grid-layout-headless";

describe("dashboardVisualIndex", () => {
  const gridProps = { collision: CollisionMode.Push, compactType: CompactType.Vertical };
  const { trpcMsw } = setupMswTrpc();

  test("a table whose read fails shows the error state", async () => {
    expect.hasAssertions();

    // The read is answered after the mount, so the test waits for the answer to be sent before it asserts on the error
    const { promise: readAnswered, resolve: onReadAnswered } = Promise.withResolvers<void>();
    trpcMsw.dataset.readDataset.query(() => {
      onReadAnswered();
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });
    const visual = new Visual({
      dataset: {
        query: { series: [{ aggregation: DatasetAggregationType.Count, column: "x" }], xColumn: "x" },
        reference: { id: v7(), type: DatasetProviderType.Sheet },
      },
      type: VisualType.Table,
    });
    const wrapper = await mountSuspended(DashboardVisualIndex, { props: { ...gridProps, visual } });
    await readAnswered;
    await flushPromises();

    expect(wrapper.findComponent(UiErrorState).exists()).toBe(true);
    expect(wrapper.findComponent(DashboardVisualTable).exists()).toBe(false);
  });

  test("a card with no binding shows the demo value", async () => {
    expect.hasAssertions();

    const wrapper = await mountSuspended(DashboardVisualIndex, {
      props: { ...gridProps, visual: new Visual({ type: VisualType.Card }) },
    });

    expect(
      wrapper
        .findComponent(DashboardVisualCard)
        .findAll("span")
        .map((span) => span.text()),
    ).toStrictEqual(["412", "Count of Response"]);
  });
});
