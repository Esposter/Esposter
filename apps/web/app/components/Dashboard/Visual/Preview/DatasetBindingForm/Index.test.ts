// @vitest-environment nuxt
import type { VisualDatasetBinding } from "#shared/models/dashboard/data/VisualDatasetBinding";

import { DatasetAggregationType } from "#shared/models/dataset/DatasetAggregationType";
import { DatasetOrderDirection } from "#shared/models/dataset/DatasetOrderDirection";
import { DatasetProviderType } from "#shared/models/dataset/DatasetProviderType";
import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import DashboardVisualPreviewDatasetBindingForm from "#src/components/Dashboard/Visual/Preview/DatasetBindingForm/Index.vue";
import DatasetReferencePicker from "#src/components/Dataset/ReferencePicker.vue";
import { useSession } from "#src/services/auth/authClient.test";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { v7 } from "uuid";
import { assert, describe, expect, test } from "vitest";

describe("dashboardVisualPreviewDatasetBindingForm", () => {
  const { trpcMsw } = setupMswTrpc();

  // Picking a source reads it before binding it, so a slow read of the source picked first can land after the one
  // Picked second — bound then, the visual charts a source the reader has already moved off
  test("binds the source picked last when an earlier pick's read lands after it", async () => {
    expect.hasAssertions();

    const { promise: readGate, resolve: releaseRead } = Promise.withResolvers<void>();
    const { promise: firstReadReached, resolve: onFirstReadReached } = Promise.withResolvers<void>();
    const { promise: boundReadReached, resolve: onBoundReadReached } = Promise.withResolvers<void>();
    const firstReference = { id: v7(), type: DatasetProviderType.Sheet };
    const secondReference = { id: v7(), type: DatasetProviderType.Sheet };
    let secondReferenceReadCount = 0;
    trpcMsw.dataset.readDataset.query(async ({ input }) => {
      if (input.id === firstReference.id) {
        onFirstReadReached();
        await readGate;
      } else {
        secondReferenceReadCount += 1;
        // The pick reads the source once, and the bound source's columns read it again
        if (secondReferenceReadCount === 2) onBoundReadReached();
      }
      return { columns: [{ name: "", type: ColumnType.String }], rows: [] };
    });
    useSession.mockReturnValue(ref({ data: { user: { id: v7() } } }));
    const wrapper = await mountSuspended(DashboardVisualPreviewDatasetBindingForm, {
      props: { modelValue: undefined },
      shallow: true,
    });
    const picker = wrapper.findComponent(DatasetReferencePicker);
    picker.vm.$emit("update:modelValue", firstReference);
    picker.vm.$emit("update:modelValue", secondReference);
    await firstReadReached;
    await flushPromises();
    releaseRead();
    await flushPromises();
    await boundReadReached;
    const emittedBindings = wrapper.emitted<[undefined | VisualDatasetBinding]>("update:modelValue") ?? [];

    expect(emittedBindings.map(([binding]) => binding?.reference)).toStrictEqual([secondReference]);
  });

  // The Order control ranks the categories by one of the query's series, and the Direction control sets how
  test("the owner orders a bar chart by its series", async () => {
    expect.hasAssertions();

    trpcMsw.dataset.readDataset.query(() => ({
      columns: [
        { name: "x", type: ColumnType.String },
        { name: "y", type: ColumnType.Number },
      ],
      rows: [],
    }));
    useSession.mockReturnValue(ref({ data: { user: { id: v7() } } }));
    // Reactive, as the store holds a visual's binding, so an order written into it re-renders the form that shows it
    const binding: VisualDatasetBinding = reactive({
      query: {
        series: [
          { aggregation: DatasetAggregationType.Count, column: "x" },
          { aggregation: DatasetAggregationType.Sum, column: "y" },
        ],
        xColumn: "x",
      },
      reference: { id: v7(), type: DatasetProviderType.Sheet },
    });
    const wrapper = await mountSuspended(DashboardVisualPreviewDatasetBindingForm, {
      global: { stubs: { DatasetReferencePicker: true } },
      props: { modelValue: binding },
    });
    await flushPromises();
    const orderBy = wrapper
      .findAllComponents({ name: "UiSelect" })
      .find((select) => select.props("label") === "Order by");
    assert.exists(orderBy);
    orderBy.vm.$emit("update:modelValue", "1");
    await wrapper.vm.$nextTick();
    const direction = wrapper
      .findAllComponents({ name: "UiSelect" })
      .find((select) => select.props("label") === "Direction");
    assert.exists(direction);
    direction.vm.$emit("update:modelValue", DatasetOrderDirection.Descending);

    expect(binding.query.order).toStrictEqual({ direction: DatasetOrderDirection.Descending, seriesIndex: 1 });
  });
});
