// @vitest-environment nuxt
import { createResourceListItem } from "@/services/resource/list/createResourceListItem.test";
import { useResourceStore } from "@/store/resource";
import { useColumnDialogStore } from "@/store/resource/sheet/columnDialog";
import { describe, expect, test } from "vitest";

describe(useColumnDialogStore, () => {
  // A target is a column name, which the next sheet very likely has too — carried across, the dialog would re-open
  // Over that sheet's same-named column
  test("keeps a sheet's dialog targets to that sheet", () => {
    expect.hasAssertions();

    const resourceStore = useResourceStore();
    const { resource } = storeToRefs(resourceStore);
    resource.value = createResourceListItem();
    const columnDialogStore = useColumnDialogStore();
    const { chartingColumnName, editingColumnName } = storeToRefs(columnDialogStore);
    chartingColumnName.value = "name";
    editingColumnName.value = "name";
    resource.value = createResourceListItem();

    expect({ chartingColumnName: chartingColumnName.value, editingColumnName: editingColumnName.value }).toStrictEqual({
      chartingColumnName: "",
      editingColumnName: "",
    });
  });
});
