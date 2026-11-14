import type { CoreTable } from "#src/models/cutover/CoreTable";
import type { IdMap } from "#src/models/cutover/IdMap";
import type { D1Value } from "#src/services/cutover/core/toD1Value";

import { toD1Value } from "#src/services/cutover/core/toD1Value";
import { inviteTableName, tokenColumnsByTableName } from "#src/services/cutover/ids/credentialColumns";
import { requireNoReadableTokenColumn } from "#src/services/cutover/ids/requireNoReadableTokenColumn";
import { requireReissuedTokenHash } from "#src/services/cutover/ids/requireReissuedTokenHash";
import { isOldId } from "#src/services/cutover/ids/rewriteOldIds";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The D1 values of one Postgres row, by column name: each through the copy's transform, every old UUID in it replaced by its new id, every
// bearer token replaced by the hash it was re-issued as, and an invite's code by the one it was re-issued as. A row whose id was never given
// a new one is refused, since writing it under its old id would leave its references pointing at nothing the copy wrote
export const toCoreRecord = (table: CoreTable, row: Record<string, unknown>, idMap: IdMap): Record<string, D1Value> => {
  requireNoReadableTokenColumn(table);
  const oldId = row.id;
  if (typeof oldId === "string" && isOldId(oldId) && idMap.newIdOf(oldId) === undefined)
    throw new InvalidOperationError(
      Operation.Read,
      table.name,
      `has the row ${oldId} with no new id: assign-ids must run first`,
    );

  const tokenColumns = tokenColumnsByTableName.get(table.name) ?? [];
  const record: Record<string, D1Value> = {};
  for (const column of table.columns) {
    const tokenColumn = tokenColumns.find(({ column: name }) => name === column.name);
    if (tokenColumn) {
      const oldToken = row[tokenColumn.oldColumn];
      if (typeof oldToken !== "string")
        throw new InvalidOperationError(Operation.Read, table.name, `has a ${tokenColumn.oldColumn} that is not text`);
      record[column.name] = requireReissuedTokenHash(idMap, oldToken, table.name);
      continue;
    }
    if (table.name === inviteTableName && column.name === "id") {
      const newCode = typeof oldId === "string" ? idMap.inviteCodeOf(oldId) : undefined;
      if (newCode === undefined)
        throw new InvalidOperationError(Operation.Read, table.name, `has the invite ${String(oldId)} with no new code`);
      record[column.name] = newCode;
      continue;
    }
    const value = toD1Value(column, row[column.name]);
    record[column.name] = typeof value === "string" ? idMap.rewrite(value) : value;
  }
  return record;
};
