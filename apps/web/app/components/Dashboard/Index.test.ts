// @vitest-environment nuxt
import { Visual } from "#shared/models/dashboard/data/Visual";
import { VisualType } from "#shared/models/dashboard/data/VisualType";
import { DatasetAggregationType } from "#shared/models/dataset/DatasetAggregationType";
import { DatasetProviderType } from "#shared/models/dataset/DatasetProviderType";
import { MimeType } from "#shared/models/file/MimeType";
import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import DashboardIndex from "@/components/Dashboard/Index.vue";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { downloadFile } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { CollisionMode, CompactType } from "vue-grid-layout-headless";

vi.mock(import("@esposter/shared"), async (importOriginal) => ({
  ...(await importOriginal()),
  downloadFile: vi.fn<typeof downloadFile>(),
}));

describe("dashboardIndex", () => {
  const { trpcMsw } = setupMswTrpc();
  const gridWidth = 970;
  const exportCsvLabel = '[aria-label="Export CSV"]';
  const responseColumn = "response";
  // A card bound to a snapshot of two rows, so the published page offers its export and the export reads the snapshot
  const createSnapshotCard = () =>
    new Visual({
      dataset: {
        query: { series: [{ aggregation: DatasetAggregationType.Count, column: responseColumn }], xColumn: "team" },
        reference: { id: crypto.randomUUID(), type: DatasetProviderType.Sheet },
        snapshot: {
          columns: [{ name: responseColumn, type: ColumnType.String }],
          rows: [{ [responseColumn]: "a" }, { [responseColumn]: "b" }],
        },
      },
      type: VisualType.Card,
    });

  // A DOM without layout never reports the grid's width, so the observer reports the width the test lays it out at
  beforeEach(() => {
    vi.stubGlobal(
      "ResizeObserver",
      class {
        readonly #callback: ResizeObserverCallback;

        constructor(callback: ResizeObserverCallback) {
          this.#callback = callback;
        }

        disconnect() {}
        observe(target: Element) {
          const entries = [{ contentRect: { height: 0, width: gridWidth }, target }] as ResizeObserverEntry[];
          queueMicrotask(() => {
            this.#callback(entries, this);
          });
        }
        unobserve() {}
      },
    );
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  // The published dashboard exports what it published, so a viewer's file is the snapshot's rows and no live read is made
  test("a published visual's CSV is the snapshot's rows, with no live read of the source", async () => {
    expect.hasAssertions();

    const readDataset = vi.fn<() => never>();
    trpcMsw.dataset.readDataset.query(readDataset);
    const visual = createSnapshotCard();
    const wrapper = await mountSuspended(DashboardIndex, {
      props: { collision: CollisionMode.Push, compactType: CompactType.Vertical, visuals: [visual] },
    });
    await flushPromises();
    await wrapper.get(exportCsvLabel).trigger("click");

    expect(readDataset).not.toHaveBeenCalled();
    expect(downloadFile).toHaveBeenCalledExactlyOnceWith(
      `${VisualType.Card}.csv`,
      `Count of ${responseColumn}\n2`,
      MimeType.Csv,
    );
  });

  // A group draws its children as the page does, so a bound child keeps its export and the group, which has no data, offers none
  test("a published group draws its bound child with the child's export", async () => {
    expect.hasAssertions();

    const group = new Visual({ type: VisualType.Group, visuals: [createSnapshotCard()] });
    const wrapper = await mountSuspended(DashboardIndex, {
      props: { collision: CollisionMode.Push, compactType: CompactType.Vertical, visuals: [group] },
    });
    await flushPromises();

    expect(wrapper.findAll(exportCsvLabel)).toHaveLength(1);
  });
});
