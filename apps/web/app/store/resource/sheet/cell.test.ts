// @vitest-environment nuxt
import { setupCommandTest } from "@/composables/resource/sheet/commands/setupCommandTest.test";
import { setupWithDataSource } from "@/composables/resource/sheet/commands/setupWithDataSource.test";
import { createResourceListItem } from "@/services/resource/list/createResourceListItem.test";
import { useResourceStore } from "@/store/resource";
import { useCellStore } from "@/store/resource/sheet/cell";
import { describe, expect, test } from "vitest";

describe(useCellStore, () => {
  setupCommandTest();

  // A cell is addressed by coordinates every sheet has, so a selection carried over would select the same cells
  // In the next sheet opened
  test("keeps a sheet's cell selection to that sheet", () => {
    expect.hasAssertions();

    setupWithDataSource();
    const resourceStore = useResourceStore();
    const { resource } = storeToRefs(resourceStore);
    const cellStore = useCellStore();
    const { selectedCellRange } = storeToRefs(cellStore);
    const { startCellSelection } = cellStore;
    startCellSelection(0, 0);
    resource.value = createResourceListItem();

    expect(selectedCellRange.value).toBeUndefined();
  });
});
