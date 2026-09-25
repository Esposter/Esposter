// @vitest-environment nuxt
import type { VisualDatasetBinding } from "#shared/models/dashboard/data/VisualDatasetBinding";

import { DatasetProviderType } from "#shared/models/dataset/DatasetProviderType";
import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import DashboardVisualPreviewDatasetBindingForm from "@/components/Dashboard/Visual/Preview/DatasetBindingForm.vue";
import DatasetReferencePicker from "@/components/Dataset/ReferencePicker.vue";
import { useSession } from "@/services/auth/authClient.test";
import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { describe, expect, test, vi } from "vitest";

vi.mock(import("@/services/auth/authClient"), () => import("@/services/auth/authClient.test"));

describe("dashboardVisualPreviewDatasetBindingForm", () => {
  const server = setupMswTrpc();

  // Picking a source reads it before binding it, so a slow read of the source picked first can land after the one
  // Picked second — bound then, the visual charts a source the reader has already moved off
  test("binds the source picked last when an earlier pick's read lands after it", async () => {
    expect.hasAssertions();

    const { promise: readGate, resolve: releaseRead } = Promise.withResolvers<void>();
    const firstReference = { id: crypto.randomUUID(), type: DatasetProviderType.Sheet };
    const secondReference = { id: crypto.randomUUID(), type: DatasetProviderType.Sheet };
    server.use(
      trpcMsw.dataset.readDataset.query(async ({ input }) => {
        if (input.id === firstReference.id) await readGate;
        return { columns: [{ name: "", type: ColumnType.String }], rows: [] };
      }),
    );
    useSession.mockReturnValue(ref({ data: { user: { id: crypto.randomUUID() } } }));
    const wrapper = await mountSuspended(DashboardVisualPreviewDatasetBindingForm, {
      props: { modelValue: undefined },
      shallow: true,
    });
    const picker = wrapper.findComponent(DatasetReferencePicker);
    picker.vm.$emit("update:modelValue", firstReference);
    picker.vm.$emit("update:modelValue", secondReference);
    await flushPromises();
    releaseRead();
    await flushPromises();
    const emittedBindings = wrapper.emitted<[VisualDatasetBinding | undefined]>("update:modelValue") ?? [];

    expect(emittedBindings.map(([binding]) => binding?.reference)).toStrictEqual([secondReference]);
  });
});
