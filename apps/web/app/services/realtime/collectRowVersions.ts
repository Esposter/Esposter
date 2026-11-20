import type { RowVersion } from "@esposter/db-schema";

import { withFinalizer } from "@esposter/shared";

// The row versions the mutation in flight collects, set while a mutation starts its calls. A tRPC call runs its links
// As it is made, so the row versions link takes this collector then and adds each row its answer names
let activeRowVersions: RowVersion[] | undefined;

export const readActiveRowVersions = (): RowVersion[] | undefined => activeRowVersions;

// Runs a mutation and collects the row versions every tRPC call it starts synchronously answers with. A call started
// After the mutation's first await is outside the collection, so a mutation that must be watched starts its calls
// Before awaiting anything
export const collectRowVersions = async <T>(
  call: () => Promise<T>,
): Promise<{ result: T; rowVersions: RowVersion[] }> => {
  const rowVersions: RowVersion[] = [];
  const previousRowVersions = activeRowVersions;
  activeRowVersions = rowVersions;
  const callPromise = withFinalizer(call, () => {
    activeRowVersions = previousRowVersions;
  });
  const result = await callPromise;
  return { result, rowVersions };
};
