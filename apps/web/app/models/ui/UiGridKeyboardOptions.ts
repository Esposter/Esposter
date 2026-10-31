export interface UiGridKeyboardOptions<TCell> {
  // The selector of the element a cell is focused through
  getCellSelector: (cell: TCell) => string;
  // The cell holding the tab stop, or nothing while the grid has no cells
  getFocusedCell: () => TCell | undefined;
  // The cell a key moves the focus to, or nothing for a key the grid leaves alone
  getNextCell: (event: KeyboardEvent, cell: TCell) => TCell | undefined;
  root: Readonly<ShallowRef<HTMLElement | null>>;
  // Moves the grid's one tab stop, which may redraw the grid around the cell before it is focused
  setFocusedCell: (cell: TCell) => void;
}
