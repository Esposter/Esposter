// @vitest-environment nuxt
import { createResourceListItem } from "#shared/services/resource/list/createResourceListItem.test";
import { setupCommandTest } from "#src/composables/resource/sheet/commands/setupCommandTest.test";
import { setupWithDataSource } from "#src/composables/resource/sheet/commands/setupWithDataSource.test";
import { useResourceStore } from "#src/store/resource/index";
import { useCellStore } from "#src/store/resource/sheet/cell";
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
