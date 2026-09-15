// @vitest-environment nuxt
import { useResourceSelection } from "@/composables/resource/list/useResourceSelection";
import { describe, expect, test } from "vitest";

describe(useResourceSelection, () => {
  const id = crypto.randomUUID();
  const otherId = crypto.randomUUID();
  const nextPageId = crypto.randomUUID();
  const firstPage = [{ id }, { id: otherId }];
  const secondPage = [{ id: nextPageId }];

  test("resolves selected rows from the current page", () => {
    expect.hasAssertions();

    const items = ref([...firstPage]);
    const { selectedIds, selectedResources, updateSelection } = useResourceSelection(items);
    updateSelection([id]);

    expect(selectedIds.value).toStrictEqual([id]);
    expect(selectedResources.value).toStrictEqual([{ id }]);
  });

  test("keeps rows selected on other pages", () => {
    expect.hasAssertions();

    const items = ref([...firstPage]);
    const { selectedResources, updateSelection } = useResourceSelection(items);
    updateSelection([id]);
    items.value = [...secondPage];
    updateSelection([id, nextPageId]);

    expect(selectedResources.value).toStrictEqual([{ id }, { id: nextPageId }]);
  });

  test("drops deselected rows", () => {
    expect.hasAssertions();

    const items = ref([...firstPage]);
    const { selectedResources, updateSelection } = useResourceSelection(items);
    updateSelection([id, otherId]);
    updateSelection([otherId]);

    expect(selectedResources.value).toStrictEqual([{ id: otherId }]);
  });

  test("clears the selection", () => {
    expect.hasAssertions();

    const items = ref([...firstPage]);
    const { clearSelection, selectedIds, selectedResources, updateSelection } = useResourceSelection(items);
    updateSelection([id]);
    clearSelection();

    expect(selectedIds.value).toStrictEqual([]);
    expect(selectedResources.value).toStrictEqual([]);
  });
});
