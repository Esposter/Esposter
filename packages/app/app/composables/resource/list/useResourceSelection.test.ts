// @vitest-environment nuxt
import { useResourceSelection } from "@/composables/resource/list/useResourceSelection";
import { describe, expect, test } from "vitest";

describe(useResourceSelection, () => {
  const firstPage = [{ id: "1" }, { id: "2" }];
  const secondPage = [{ id: "3" }];

  test("resolves selected rows from the current page", () => {
    expect.hasAssertions();

    const items = ref([...firstPage]);
    const { selectedIds, selectedResources, updateSelection } = useResourceSelection(items);
    updateSelection(["1"]);

    expect(selectedIds.value).toStrictEqual(["1"]);
    expect(selectedResources.value).toStrictEqual([{ id: "1" }]);
  });

  test("keeps rows selected on other pages", () => {
    expect.hasAssertions();

    const items = ref([...firstPage]);
    const { selectedResources, updateSelection } = useResourceSelection(items);
    updateSelection(["1"]);
    items.value = [...secondPage];
    updateSelection(["1", "3"]);

    expect(selectedResources.value).toStrictEqual([{ id: "1" }, { id: "3" }]);
  });

  test("drops deselected rows", () => {
    expect.hasAssertions();

    const items = ref([...firstPage]);
    const { selectedResources, updateSelection } = useResourceSelection(items);
    updateSelection(["1", "2"]);
    updateSelection(["2"]);

    expect(selectedResources.value).toStrictEqual([{ id: "2" }]);
  });

  test("clears the selection", () => {
    expect.hasAssertions();

    const items = ref([...firstPage]);
    const { clearSelection, selectedIds, selectedResources, updateSelection } = useResourceSelection(items);
    updateSelection(["1"]);
    clearSelection();

    expect(selectedIds.value).toStrictEqual([]);
    expect(selectedResources.value).toStrictEqual([]);
  });
});
