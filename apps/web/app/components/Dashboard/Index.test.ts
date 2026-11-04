// @vitest-environment nuxt
import { Visual } from "#shared/models/dashboard/data/Visual";
import { VisualType } from "#shared/models/dashboard/data/VisualType";
import { DatasetAggregationType } from "#shared/models/dataset/DatasetAggregationType";
import { DatasetProviderType } from "#shared/models/dataset/DatasetProviderType";
import { MimeType } from "#shared/models/file/MimeType";
import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import DashboardIndex from "@/components/Dashboard/Index.vue";
import { stubGridWidth } from "@/services/dashboard/grid/stubGridWidth.test";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { downloadFile } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { afterEach, assert, beforeEach, describe, expect, test, vi } from "vitest";
import { CollisionMode, CompactType } from "vue-grid-layout-headless";

vi.mock(import("@esposter/shared"), async (importOriginal) => ({
  ...(await importOriginal()),
  downloadFile: vi.fn<typeof downloadFile>(),
}));

describe("dashboardIndex", () => {
  const { trpcMsw } = setupMswTrpc();
  const gridWidth = 970;
  const phoneWidth = 320;
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

  beforeEach(() => {
    stubGridWidth(gridWidth);
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

  // A dashboard laid out over the editor's twelve columns takes the two a phone has
  // The visual spanning the width fills them, and the one at the right edge moves in to the left column, beneath the first
  test("opening a dashboard on a phone", async () => {
    expect.hasAssertions();

    stubGridWidth(phoneWidth);
    const wrapper = await mountSuspended(DashboardIndex, {
      props: {
        collision: CollisionMode.Push,
        compactType: CompactType.Vertical,
        visuals: [
          new Visual({ h: 2, type: VisualType.Card, w: 2, x: 8, y: 0 }),
          new Visual({ h: 2, type: VisualType.Card, w: 6, x: 0, y: 0 }),
        ],
      },
    });
    await flushPromises();

    expect(
      wrapper.findAll(".dashboard-grid-tile").map((tile) => {
        assert(tile.element instanceof HTMLElement);

        return {
          height: tile.element.style.height,
          left: tile.element.style.left,
          top: tile.element.style.top,
          width: tile.element.style.width,
        };
      }),
    ).toStrictEqual([
      { height: "110px", left: "10px", top: "10px", width: "300px" },
      { height: "110px", left: "10px", top: "130px", width: "300px" },
    ]);
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
