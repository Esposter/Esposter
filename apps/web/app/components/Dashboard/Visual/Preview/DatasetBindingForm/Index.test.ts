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
import { assert, describe, expect, test, vi } from "vitest";

describe("dashboardVisualPreviewDatasetBindingForm", () => {
  const { trpcMsw } = setupMswTrpc();

  // Picking a source reads it once, and that read is the one the bound source's columns come from. A slow read of the
  // Source picked first can land after the one picked second, and must not bind over it
  test("reads a picked source once and binds the source picked last when an earlier read lands after it", async () => {
    expect.hasAssertions();

    const { promise: readGate, resolve: releaseRead } = Promise.withResolvers<void>();
    const { promise: firstReadReached, resolve: onFirstReadReached } = Promise.withResolvers<void>();
    const firstReference = { id: v7(), type: DatasetProviderType.Sheet };
    const secondReference = { id: v7(), type: DatasetProviderType.Sheet };
    let secondReferenceReadCount = 0;
    trpcMsw.dataset.readDataset.query(async ({ input }) => {
      if (input.id === firstReference.id) {
        onFirstReadReached();
        await readGate;
      } else secondReferenceReadCount += 1;
      return { columns: [{ name: "", type: ColumnType.String }], rows: [] };
    });
    useSession.mockReturnValue(ref({ data: { user: { id: v7() } } }));
    const wrapper = await mountSuspended(DashboardVisualPreviewDatasetBindingForm, {
      props: { modelValue: undefined },
      shallow: true,
    });
    const picker = wrapper.findComponent(DatasetReferencePicker);
    picker.vm.$emit("update:modelValue", firstReference);
    await firstReadReached;
    picker.vm.$emit("update:modelValue", secondReference);
    await flushPromises();
    releaseRead();
    await flushPromises();
    const emittedBindings = wrapper.emitted<[undefined | VisualDatasetBinding]>("update:modelValue");
    assert.exists(emittedBindings);

    expect(emittedBindings.map(([binding]) => binding?.reference)).toStrictEqual([secondReference]);
    expect(secondReferenceReadCount).toBe(1);
  });

  // A pick is a run of its own read, so the source picked before it is aborted rather than left to land and be dropped
  test("aborts the read of a source once a second source is picked", async () => {
    expect.hasAssertions();

    const { promise: readGate, resolve: releaseRead } = Promise.withResolvers<void>();
    const { promise: firstReadReached, resolve: onFirstReadReached } = Promise.withResolvers<void>();
    const firstReference = { id: v7(), type: DatasetProviderType.Sheet };
    const secondReference = { id: v7(), type: DatasetProviderType.Sheet };
    trpcMsw.dataset.readDataset.query(async ({ input }) => {
      if (input.id === firstReference.id) {
        onFirstReadReached();
        await readGate;
      }
      return { columns: [{ name: "", type: ColumnType.String }], rows: [] };
    });
    // The read's request carries the signal its call was given, which is what an abort reaches
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    useSession.mockReturnValue(ref({ data: { user: { id: v7() } } }));
    const wrapper = await mountSuspended(DashboardVisualPreviewDatasetBindingForm, {
      props: { modelValue: undefined },
      shallow: true,
    });
    const picker = wrapper.findComponent(DatasetReferencePicker);
    picker.vm.$emit("update:modelValue", firstReference);
    await firstReadReached;
    picker.vm.$emit("update:modelValue", secondReference);
    await flushPromises();

    const [, firstReadInit] =
      fetchSpy.mock.calls.find(([url]) =>
        (typeof url === "string" ? url : url instanceof URL ? url.href : url.url).includes(firstReference.id),
      ) ?? [];
    expect(firstReadInit?.signal?.aborted).toBe(true);

    releaseRead();
    await flushPromises();
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
