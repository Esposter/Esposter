// @vitest-environment nuxt
import { createResourceListItem } from "#shared/services/resource/list/createResourceListItem.test";
import { useResourceStore } from "#src/store/resource/index";
import { useColumnDialogStore } from "#src/store/resource/sheet/columnDialog";
import { describe, expect, test } from "vitest";

describe(useColumnDialogStore, () => {
  // A target is a column name, which the next sheet very likely has too — carried across, the dialog would re-open
  // Over that sheet's same-named column
  test("keeps a sheet's dialog targets to that sheet", () => {
    expect.hasAssertions();

    const resourceStore = useResourceStore();
    const { applyResource } = resourceStore;
    applyResource(createResourceListItem(), null, null);
    const columnDialogStore = useColumnDialogStore();
    const { chartingColumnName, editingColumnName } = storeToRefs(columnDialogStore);
    chartingColumnName.value = "name";
    editingColumnName.value = "name";
    applyResource(createResourceListItem(), null, null);

    expect({ chartingColumnName: chartingColumnName.value, editingColumnName: editingColumnName.value }).toStrictEqual({
      chartingColumnName: "",
      editingColumnName: "",
    });
  });
});
