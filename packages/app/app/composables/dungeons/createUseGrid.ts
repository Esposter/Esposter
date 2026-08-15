import type { Grid } from "@/models/dungeons/Grid";

// The grid is a module singleton so every surface navigates the same cursor, but its rows come from stores
// That only exist once pinia is active — so the first call wires it up and the rest just take it
export const createUseGrid = <TValue, TGrid extends readonly (readonly TValue[])[]>(
  grid: Grid<TValue, TGrid>,
  initialize: (grid: Grid<TValue, TGrid>) => void,
) => {
  let isInitialized = false;
  return () => {
    if (!isInitialized) {
      initialize(grid);
      isInitialized = true;
    }
    return grid;
  };
};
