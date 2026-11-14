import type { D1Statement } from "#src/models/cutover/D1Statement";
import type { MapperRowsOptions } from "#src/models/cutover/MapperRowsOptions";

import { writeStatements } from "#src/services/cutover/core/writeStatements";

// Sets the references of the rows that name another row, once every row they may name is written. Returns how many were set
export const linkMapperRows = async (options: MapperRowsOptions): Promise<number> => {
  const { coreTable, entities, executor, idMap, mapper, parents } = options;
  const statements: D1Statement[] = [];
  for await (const { entity, timestamp } of entities) {
    const link = mapper.link?.(entity, { idMap, parents, timestamp });
    if (link)
      statements.push({
        params: [link.referenceId, link.id],
        sql: `UPDATE "${coreTable.name}" SET "${link.column}" = ? WHERE "id" = ?`,
      });
  }
  await writeStatements(executor, statements);
  return statements.length;
};
