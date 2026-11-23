// @vitest-environment nuxt
import { createRow } from "#shared/models/resource/sheet/datasource/createRow.test";
import { createResourceListItem } from "#shared/services/resource/list/createResourceListItem.test";
import { useResourceStore } from "#src/store/resource/index";
import { useRowDialogStore } from "#src/store/resource/sheet/rowDialog";
import { describe, expect, test } from "vitest";

describe(useRowDialogStore, () => {
  // A duplicated sheet keeps its rows' ids, so an app-lifetime target would re-open the dialog over the copy's same
  // Rows
  test("keeps a sheet's dialog targets to that sheet", () => {
    expect.hasAssertions();

    const resourceStore = useResourceStore();
    const { applyResource } = resourceStore;
    applyResource(createResourceListItem(), null, null);
    const rowDialogStore = useRowDialogStore();
    const { deletingIds, editingId } = storeToRefs(rowDialogStore);
    const { id } = createRow({ "": 0 });
    editingId.value = id;
    deletingIds.value = [id];
    applyResource(createResourceListItem(), null, null);

    expect({ deletingIds: deletingIds.value, editingId: editingId.value }).toStrictEqual({
      deletingIds: [],
      editingId: "",
    });
  });
});
