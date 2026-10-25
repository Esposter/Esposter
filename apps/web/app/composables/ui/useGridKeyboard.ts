import type { UiGridKeyboardOptions } from "@/models/ui/UiGridKeyboardOptions";

// The keyboard of a WAI-ARIA grid with one tab stop: a key the grid maps to another cell moves the stop there once the
// Grid has drawn it and focuses it, and every other key passes through. Only a key on the focused cell itself moves
// It, so the arrows on a button or a field inside a cell stay that control's
export const useGridKeyboard =
  <TCell>({ getCellSelector, getFocusedCell, getNextCell, root, setFocusedCell }: UiGridKeyboardOptions<TCell>) =>
  async (event: KeyboardEvent) => {
    const focusedCell = getFocusedCell();
    if (
      focusedCell === undefined ||
      !(event.target instanceof Element) ||
      !event.target.matches(getCellSelector(focusedCell))
    )
      return;
    const nextCell = getNextCell(event, focusedCell);
    if (nextCell === undefined) return;
    event.preventDefault();
    setFocusedCell(nextCell);
    await nextTick();
    const newFocusedCell = getFocusedCell();
    if (newFocusedCell !== undefined) root.value?.querySelector<HTMLElement>(getCellSelector(newFocusedCell))?.focus();
  };
