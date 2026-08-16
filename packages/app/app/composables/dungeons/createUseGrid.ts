import type { Grid } from "@/models/dungeons/Grid";

// The grid is a module singleton so every surface navigates the same cursor, but its rows come from stores
// That only exist once pinia is active — so the first call wires it up and the rest just take it
export const createUseGrid = <TGrid extends readonly (readonly unknown[])[]>(
  grid: Grid<TGrid>,
  initialize: (grid: Grid<TGrid>) => void,
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
