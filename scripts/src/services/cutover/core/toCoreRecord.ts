import type { CoreTable } from "#src/models/cutover/CoreTable";
import type { IdMap } from "#src/models/cutover/IdMap";
import type { MessageNumberColumn } from "#src/services/cutover/core/columnSources";
import type { D1Value } from "#src/services/cutover/core/toD1Value";

import {
  tableNameMessageNumberColumnsMap,
  tableNameUnsourcedColumnsMap,
} from "#src/services/cutover/core/columnSources";
import { toD1Value } from "#src/services/cutover/core/toD1Value";
import { inviteTableName, tableNameTokenColumnsMap } from "#src/services/cutover/ids/credentialColumns";
import { requireNoReadableTokenColumn } from "#src/services/cutover/ids/requireNoReadableTokenColumn";
import { requireReissuedTokenHash } from "#src/services/cutover/ids/requireReissuedTokenHash";
import { checkIsOldId } from "#src/services/cutover/ids/rewriteOldIds";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The D1 values of one Postgres row, by column name: each through the copy's transform, and each old UUID in it replaced by its new id.
// Every bearer token is replaced by the hash it was re-issued as, and an invite's code by the one it was re-issued as.
// A thread root's row key becomes the number its room's object gave the root, and a column Postgres never held is NULL.
// A row whose id was never given a new one is refused, since writing it under its old id would leave its references pointing at nothing the copy wrote
export const toCoreRecord = (table: CoreTable, row: Record<string, unknown>, idMap: IdMap): Record<string, D1Value> => {
  requireNoReadableTokenColumn(table);
  const oldId = row.id;
  if (typeof oldId === "string" && checkIsOldId(oldId) && idMap.newIdOf(oldId) === undefined)
    throw new InvalidOperationError(
      Operation.Read,
      table.name,
      `has the row ${oldId} with no new id: assign-ids must run first`,
    );

  const tokenColumns = tableNameTokenColumnsMap.get(table.name) ?? [];
  const messageNumberColumns = tableNameMessageNumberColumnsMap.get(table.name) ?? [];
  const unsourcedColumnNames = tableNameUnsourcedColumnsMap.get(table.name) ?? [];
  const record: Record<string, D1Value> = {};
  for (const column of table.columns) {
    if (unsourcedColumnNames.includes(column.name)) {
      record[column.name] = null;
      continue;
    }
    const messageNumberColumn = messageNumberColumns.find(({ column: name }) => name === column.name);
    if (messageNumberColumn) {
      record[column.name] = toMessageNumber(table, row, messageNumberColumn, idMap);
      continue;
    }
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

// The number a thread root was given in its room, from the row key Postgres named it by: 0 for the room's own call, which
// Names no root. A root its room never numbered is refused, since the row would name a thread the copy did not write
const toMessageNumber = (
  table: CoreTable,
  row: Record<string, unknown>,
  { oldColumn, roomColumn }: MessageNumberColumn,
  idMap: IdMap,
): number => {
  const rowKey = row[oldColumn];
  if (rowKey === "") return 0;
  const roomOldId = row[roomColumn];
  const number =
    typeof rowKey === "string" && typeof roomOldId === "string"
      ? idMap.getMessageNumber(idMap.rewrite(roomOldId), rowKey)
      : undefined;
  if (number === undefined)
    throw new InvalidOperationError(
      Operation.Read,
      table.name,
      `names the thread root ${String(rowKey)} in room ${String(roomOldId)}, which was never numbered: assign-ids must run first`,
    );
  return number;
};
