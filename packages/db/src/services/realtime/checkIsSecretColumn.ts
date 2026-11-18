import { tableMap } from "#src/services/realtime/tableMap";
import { getTableScope } from "@esposter/db-schema";

// Whether a column of a table is a bearer secret, whose value a topic names by its digest. A table the schema does not
// Hold declares no secret
export const checkIsSecretColumn = (tableName: string, column: string): boolean => {
  const table = tableMap.get(tableName);
  return table ? (getTableScope(table)?.secretColumns?.includes(column) ?? false) : false;
};
