import { useOnGridClick } from "#src/composables/dungeons/useOnGridClick";
import { Grid } from "#src/models/dungeons/Grid";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test, vi } from "vitest";

// The middle cell is one the grid does not validate, as a used-up item or an unavailable option is
const getGrid = () => new Grid({ grid: [["Fight", "Item", "Run"]], validate: ({ x }) => x !== 1 });

describe(useOnGridClick, () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  test("a click on a cell the grid does not validate does not move the cursor", () => {
    expect.hasAssertions();

    const grid = getGrid();
    useOnGridClick(grid, { x: 1, y: 0 })();

    expect(grid.position.value).toStrictEqual({ x: 0, y: 0 });
  });

  test("a click on the cursor's own cell does not confirm it when the grid does not validate it", () => {
    expect.hasAssertions();

    const grid = getGrid();
    grid.position.value = { x: 1, y: 0 };
    const onConfirm = vi.fn<() => void>();
    useOnGridClick(grid, { x: 1, y: 0 }, { onConfirm })();

    expect(onConfirm).not.toHaveBeenCalled();
  });

  test("a click on a cell the grid validates moves the cursor there", () => {
    expect.hasAssertions();

    const grid = getGrid();
    useOnGridClick(grid, { x: 2, y: 0 })();

    expect(grid.position.value).toStrictEqual({ x: 2, y: 0 });
  });
});
