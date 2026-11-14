import type { MapperEntity } from "#src/models/cutover/MapperEntity";
import type { MapperRowsOptions } from "#src/models/cutover/MapperRowsOptions";
import type { D1Value } from "#src/services/cutover/core/toD1Value";

import { KEYSET_PAGE_SIZE } from "#src/services/cutover/constants";
import { buildUpsertStatements } from "#src/services/cutover/core/buildUpsertStatements";
import { writeStatements } from "#src/services/cutover/core/writeStatements";
import { toRowArray } from "#src/services/cutover/tables/toRowArray";

// Upserts the row of every entity, a page at a time. Each page's new ids are flushed to the archive before its rows are written, so
// a row is never written under an id a re-run could not find. Returns how many rows were written and how many entities were left
// out because a parent is gone
export const copyMapperRows = async (
  options: MapperRowsOptions,
): Promise<{ copied: number; skipped: number }> => {
  const { coreTable, entities, executor, idMap, mapper, parents } = options;
  let copied = 0;
  let skipped = 0;
  let page: MapperEntity[] = [];

  const writePage = async (): Promise<void> => {
    const rows: D1Value[][] = [];
    for (const { entity, timestamp } of page) {
      const values = mapper.map(entity, { idMap, parents, timestamp });
      if (values) rows.push(toRowArray(coreTable, values));
      else skipped += 1;
    }
    page = [];
    await idMap.flush(mapper.azureTable);
    await writeStatements(executor, buildUpsertStatements(coreTable, rows));
    copied += rows.length;
  };

  for await (const entity of entities) {
    page.push(entity);
    // oxlint-disable-next-line no-await-in-loop -- a page is written before the next is read, so each page's ids are flushed first
    if (page.length === KEYSET_PAGE_SIZE) await writePage();
  }
  if (page.length > 0) await writePage();
  return { copied, skipped };
};
