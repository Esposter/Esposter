import type { ResourceInResource } from "@esposter/db-schema";

import { isHeldResource } from "#src/services/resource/overlay/isHeldResource";

// The row of a resource the overlay holds, out of the rows it holds, so only a row a read or write has landed is taken
export const getHeldResource = <TRow extends { id: string; version?: number }>(rows: readonly TRow[], id: string) =>
  rows.find((row): row is ResourceInResource & TRow => row.id === id && isHeldResource(row));
