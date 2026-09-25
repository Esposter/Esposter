import type { ShallowRef } from "vue";

interface GridKeyboardOptions<TCell> {
  // The selector of the element a cell is focused through
  getCellSelector: (cell: TCell) => string;
  getFocusedCell: () => TCell;
  // The cell a key moves the focus to, or nothing for a key the grid leaves alone
  getNextCell: (event: KeyboardEvent, cell: TCell) => TCell | undefined;
  root: Readonly<ShallowRef<HTMLElement | null>>;
  // Moves the grid's one tab stop, which may redraw the grid around the cell before it is focused
  setFocusedCell: (cell: TCell) => void;
}

// The keyboard of a WAI-ARIA grid with one tab stop: a key the grid maps to another cell moves the stop there once the
// Grid has drawn it and focuses it, and every other key passes through. Only a key on the focused cell itself moves
// It, so the arrows on a button inside a cell stay that button's
export const useGridKeyboard =
  <TCell>({ getCellSelector, getFocusedCell, getNextCell, root, setFocusedCell }: GridKeyboardOptions<TCell>) =>
  async (event: KeyboardEvent) => {
    if (!(event.target instanceof Element) || !event.target.matches(getCellSelector(getFocusedCell()))) return;
    const nextCell = getNextCell(event, getFocusedCell());
    if (nextCell === undefined) return;
    event.preventDefault();
    setFocusedCell(nextCell);
    await nextTick();
    root.value?.querySelector<HTMLElement>(getCellSelector(getFocusedCell()))?.focus();
  };
