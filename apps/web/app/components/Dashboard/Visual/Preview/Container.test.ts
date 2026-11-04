// @vitest-environment nuxt
import { Visual } from "#shared/models/dashboard/data/Visual";
import { VisualType } from "#shared/models/dashboard/data/VisualType";
import { DatasetAggregationType } from "#shared/models/dataset/DatasetAggregationType";
import { DatasetProviderType } from "#shared/models/dataset/DatasetProviderType";
import { MimeType } from "#shared/models/file/MimeType";
import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import DashboardVisualPreviewContainer from "@/components/Dashboard/Visual/Preview/Container.vue";
import UiErrorState from "@/components/Ui/ErrorState.vue";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { downloadFile } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { TRPCError } from "@trpc/server";
import { flushPromises } from "@vue/test-utils";
import { describe, expect, test, vi } from "vitest";
import { CollisionMode, CompactType } from "vue-grid-layout-headless";

vi.mock(import("@esposter/shared"), async (importOriginal) => ({
  ...(await importOriginal()),
  downloadFile: vi.fn<typeof downloadFile>(),
}));

describe("dashboardVisualPreviewContainer", () => {
  const gridProps = { collision: CollisionMode.Push, compactType: CompactType.Vertical };
  const { trpcMsw } = setupMswTrpc();
  const menuLabel = '[aria-label="Visual actions"]';
  const responseColumn = "response";
  const createBoundVisual = () =>
    new Visual({
      dataset: {
        query: {
          series: [{ aggregation: DatasetAggregationType.Count, column: responseColumn }],
          xColumn: responseColumn,
        },
        reference: { id: crypto.randomUUID(), type: DatasetProviderType.Sheet },
      },
      type: VisualType.Card,
    });

  // The tile's menu offers the file of the rows its visual draws, once the read has answered
  test("a bound visual's menu downloads the CSV of the rows it draws", async () => {
    expect.hasAssertions();

    const { promise: readAnswered, resolve: onReadAnswered } = Promise.withResolvers<void>();
    trpcMsw.dataset.readDataset.query(() => {
      onReadAnswered();
      return {
        columns: [{ name: responseColumn, type: ColumnType.String }],
        rows: [{ [responseColumn]: "a" }, { [responseColumn]: "b" }],
      };
    });
    const wrapper = await mountSuspended(DashboardVisualPreviewContainer, {
      props: { ...gridProps, visual: createBoundVisual() },
    });
    await readAnswered;
    await flushPromises();
    await wrapper.get(menuLabel).trigger("keydown", { key: "ArrowDown" });
    await flushPromises();
    await wrapper
      .findAll('[role="menuitem"]')
      .find((item) => item.text() === "Export CSV")
      ?.trigger("click");

    expect(downloadFile).toHaveBeenCalledExactlyOnceWith(
      `${VisualType.Card}.csv`,
      `Count of ${responseColumn}\n2`,
      MimeType.Csv,
    );
  });

  // A static visual has no rows to export, since its values are typed into the chart rather than read from a dataset
  test("a static visual's menu offers no Export CSV", async () => {
    expect.hasAssertions();

    const wrapper = await mountSuspended(DashboardVisualPreviewContainer, {
      props: { ...gridProps, visual: new Visual({ type: VisualType.Card }) },
    });
    await wrapper.get(menuLabel).trigger("keydown", { key: "ArrowDown" });
    await flushPromises();

    expect(wrapper.findAll('[role="menuitem"]').map((item) => item.text())).not.toContain("Export CSV");
  });

  // A visual whose source is gone shows its error state, and there are no rows left to export
  test("a bound visual whose read fails offers no Export CSV", async () => {
    expect.hasAssertions();

    const { promise: readAnswered, resolve: onReadAnswered } = Promise.withResolvers<void>();
    trpcMsw.dataset.readDataset.query(() => {
      onReadAnswered();
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });
    const wrapper = await mountSuspended(DashboardVisualPreviewContainer, {
      props: { ...gridProps, visual: createBoundVisual() },
    });
    await readAnswered;
    await flushPromises();

    expect(wrapper.findComponent(UiErrorState).exists()).toBe(true);
    await wrapper.get(menuLabel).trigger("keydown", { key: "ArrowDown" });
    await flushPromises();

    expect(wrapper.findAll('[role="menuitem"]').map((item) => item.text())).not.toContain("Export CSV");
  });
});
