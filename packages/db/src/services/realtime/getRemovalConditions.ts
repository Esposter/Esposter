import type { ReferencingColumn, ReferencingKey } from "#src/models/realtime/ReferencingKey";
import type { Database } from "@esposter/db-schema";
import type { SQL, Table } from "drizzle-orm";

import { tableNameReferencingKeysMap } from "#src/services/realtime/tableNameReferencingKeysMap";
import { walkCascade } from "#src/services/realtime/walkCascade";
import { getOrCreate } from "@esposter/shared";
import { getTableName, or, sql } from "drizzle-orm";

// A cascading key from a table a delete removes rows from, into the table that holds it
interface IncomingKey {
  key: ReferencingKey;
  parent: Table;
}

// The condition a table's rows must meet to be removed by a delete, or undefined when none of them is
type RemovalCondition = SQL | undefined;

// The condition over each table a delete removes rows from, as a subquery over the delete's own WHERE and its parents'
// Conditions. A child's rows are those whose key holds a referenced value of a removed parent row, so a condition reads
// Only its parents' conditions, and no value an earlier statement returned: the reads can sit in one batch before the
// Delete they precede. A self-reference (a reply's parent is a post) is the one cycle, and its rows are the closure of the
// Rows the other keys remove, which a recursive subquery reads. A cycle through other tables is not walked, so its tables
// Have no condition and are not read
export const getRemovalConditions = (database: Database, table: Table, where: SQL | undefined) => {
  const rootName = getTableName(table);
  const { removedTables } = walkCascade(table);
  const removedNames = new Set(removedTables.map((removedTable) => getTableName(removedTable)));
  const tableNameIncomingKeysMap = new Map<string, IncomingKey[]>();
  for (const parent of removedTables)
    for (const key of tableNameReferencingKeysMap.get(getTableName(parent)) ?? [])
      if (key.action === "cascade" && removedNames.has(getTableName(key.table)))
        getOrCreate(tableNameIncomingKeysMap, getTableName(key.table), () => []).push({ key, parent });

  const conditions = new Map<string, RemovalCondition>();
  const visiting = new Set<string>();
  const conditionOf = (target: Table): RemovalCondition => {
    const name = getTableName(target);
    if (conditions.has(name)) return conditions.get(name);
    if (visiting.has(name)) return undefined;
    visiting.add(name);
    const incomingKeys = tableNameIncomingKeysMap.get(name) ?? [];
    const seed = or(
      name === rootName ? (where ?? sql`true`) : undefined,
      ...incomingKeys
        .filter(({ parent }) => getTableName(parent) !== name)
        .map(({ key, parent }) => getKeyCondition(database, key, parent, conditionOf(parent))),
    );
    const selfKeys = incomingKeys.filter(({ parent }) => getTableName(parent) === name).map(({ key }) => key);
    const condition =
      selfKeys.length === 0 ? seed : or(...selfKeys.map((key) => getClosureCondition(database, target, key, seed)));
    visiting.delete(name);
    conditions.set(name, condition);
    return condition;
  };
  return { conditionOf, removedTables };
};

// The rows of a child table whose key columns hold the referenced columns of a removed parent row
const getKeyCondition = (
  database: Database,
  key: ReferencingKey,
  parent: Table,
  parentCondition: RemovalCondition,
): RemovalCondition => {
  if (parentCondition === undefined) return undefined;
  const parentKeys = database.select(getReferencedFields(key.columns)).from(parent).where(parentCondition);
  return sql`(${sql.join(getChildColumns(key.columns), sql`, `)}) in ${parentKeys}`;
};

// The rows of a self-referencing table: the seed's rows, and every row whose self-reference names a row already in the
// Closure, which is the recursive subquery that names the removed rows of a reply tree at any depth
const getClosureCondition = (
  database: Database,
  table: Table,
  key: ReferencingKey,
  seed: RemovalCondition,
): RemovalCondition => {
  if (seed === undefined) return undefined;
  const removedKeys = sql.join(
    key.columns.map((_column, index) => sql.raw(getRemovedKeyName(index))),
    sql`, `,
  );
  const seedKeys = database.select(getReferencedFields(key.columns)).from(table).where(seed);
  const closure = sql.join(
    [
      sql`with recursive closure(${removedKeys}) as (`,
      seedKeys.getSQL(),
      sql` union select `,
      sql.join(getReferencedColumns(key.columns), sql`, `),
      sql` from ${table} inner join closure on `,
      sql.join(
        key.columns.map(({ childColumn }, index) => sql`${childColumn} = closure.${sql.raw(getRemovedKeyName(index))}`),
        sql` and `,
      ),
      sql`) select ${removedKeys} from closure`,
    ],
    sql``,
  );
  return sql`(${sql.join(getReferencedColumns(key.columns), sql`, `)}) in (${closure})`;
};

const getChildColumns = (columns: ReferencingColumn[]) => columns.map(({ childColumn }) => childColumn);

const getReferencedColumns = (columns: ReferencingColumn[]) => columns.map(({ referencedColumn }) => referencedColumn);

// The name a removed row's referenced value takes, by its position in a self-reference's key
const getRemovedKeyName = (index: number) => `removedKey${index}`;

// The referenced columns a subquery selects, each under the name its position takes
const getReferencedFields = (columns: ReferencingColumn[]) =>
  Object.fromEntries(columns.map(({ referencedColumn }, index) => [getRemovedKeyName(index), referencedColumn]));
