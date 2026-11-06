import type { Layout } from "#src/models/Layout";
import type { Region } from "#src/models/Region";

// The entries of a stored map that name a region of the layout, each value fitted to that region. An entry naming no region is dropped,
// And so is an entry whose value does not fit its region
export const fitRegionMap = <TValue>(
  layout: Layout,
  storedMap: Record<string, TValue>,
  fitValue: (region: Region, storedValue: TValue) => TValue | undefined,
): Record<string, TValue> =>
  Object.fromEntries(
    layout.regions.flatMap((region) => {
      const storedValue = storedMap[region.id];
      const fittedValue = storedValue === undefined ? undefined : fitValue(region, storedValue);
      return fittedValue === undefined ? [] : [[region.id, fittedValue] as const];
    }),
  );
