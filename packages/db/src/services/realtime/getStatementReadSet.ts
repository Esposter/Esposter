import type { ReadSet, ReadSetJoin, ReadSetKey, ReadSetLevel, ReadSetScope } from "#src/models/realtime/ReadSet";
import type { SQLWrapper } from "drizzle-orm";

import { JoinKind } from "#src/models/realtime/JoinKind";
import { JoinSide } from "#src/models/realtime/JoinSide";
import { getStatementConfig } from "#src/services/realtime/getStatementConfig";
import { tableMap } from "#src/services/realtime/tableMap";
import { checkIsRecord } from "#src/util/object/checkIsRecord";
import { getTableScope } from "@esposter/db-schema";
import {
  chunkKindOf,
  chunkKinds,
  Column,
  getColumnTable,
  getOriginalColumnFromAlias,
  getTableColumns,
  getTableName,
  is,
  isSQLWrapper,
  Param,
  SQL,
  StringChunk,
  Subquery,
  Table,
} from "drizzle-orm";

// A table declared under an alias, in the flat chunk array it is written in. Its region is the parenthesised group it
// Sits in: a relation's subquery declares its own alias, which the group's references read, and no other group's
interface AliasDeclaration {
  alias: string;
  end: number;
  start: number;
  table: Table;
}

type DerivedFields = Map<string, DerivedSubquery>;

// A subquery the statement joins: its alias, the fields it selects, and the table its SQL reads first
interface DerivedSubquery {
  alias: string;
  base?: Table;
  selectedFields: Record<string, unknown>;
}

// The join whose ON condition a chunk array is: whether it is a left join, and the relation it joins
interface JoinContext {
  isLeft: boolean;
  relation: string;
}

// A base table's column by the key its table definition gives it, which is the key a scope declaration names. `relation` is
// The name the reference reads the column through, which is the name a join's ON condition gives the relation it joins
interface ReadColumn {
  key: string;
  owner: Table;
  relation: string;
}

interface ReadContext {
  derived: DerivedFields;
  join?: JoinContext | undefined;
  level: ReadSetLevel;
  readSet: ReadSet;
  selections: ReadSelection[];
}

interface ReadReference {
  columns: ReadColumn[];
  length: number;
  // Whether the column is read through a derived table, whose own level names its table
  throughSubquery: boolean;
}

interface ReadSelection extends ReadSetKey {
  selectedAs: string;
}

const checkIsStatementLike = (value: unknown): value is SQLWrapper =>
  isSQLWrapper(value) &&
  !is(value, SQL) &&
  !is(value, Column) &&
  !is(value, Subquery) &&
  getStatementConfig(value) !== undefined;

const getSelectedFields = (statement: unknown): Record<string, unknown> => {
  const fields = getStatementConfig(statement)?.fields;
  return checkIsRecord(fields) ? fields : {};
};

const getRelationalTable = (statement: unknown): Table | undefined =>
  typeof statement === "object" && statement !== null && "table" in statement && is(statement.table, Table)
    ? statement.table
    : undefined;

// A table reached through an alias answers for the base table its first column belongs to
const getBaseTable = (table: Table): Table => {
  const [firstColumn] = Object.values(getTableColumns(table));
  return firstColumn ? getColumnTable(getOriginalColumnFromAlias(firstColumn)) : table;
};

const getNameValue = (chunk: unknown): string | undefined =>
  chunkKindOf(chunk) === chunkKinds.name && checkIsRecord(chunk) && typeof chunk.value === "string"
    ? chunk.value
    : undefined;

const getOperatorText = (chunk: unknown): string | undefined =>
  is(chunk, StringChunk) ? chunk.value.replaceAll(/[()]/gu, "").trim().toLowerCase() : undefined;

// The base column a database column name names in a table, as a key of the table's definition
const getNamedColumns = (table: Table, name: string): ReadColumn[] => {
  const columns = getTableColumns(table);
  const key = Object.keys(columns).find((candidate) => columns[candidate]?.name === name);
  return key === undefined ? [] : [{ key, owner: getBaseTable(table), relation: getTableName(table) }];
};

// The first table a statement's SQL reads, which is the table a subquery over it selects from
const findFirstTable = (chunk: unknown): Table | undefined => {
  if (is(chunk, Table)) return getBaseTable(chunk);
  const chunks: unknown[] = Array.isArray(chunk) ? chunk : is(chunk, SQL) ? chunk.queryChunks : [];
  for (const item of chunks) {
    const found = findFirstTable(item);
    if (found) return found;
  }
  return undefined;
};

// A column a subquery selects reads the base column its selection names. A selection the subquery's own alias owns
// Reads the table the subquery selects from, since the alias is the subquery's name, not a table's
const getDerivedColumns = (subquery: DerivedSubquery, name: string, derived: DerivedFields): ReadColumn[] =>
  Object.values(subquery.selectedFields).flatMap((field) => {
    if (!is(field, Column) || field.name !== name) return [];
    const owner = getColumnTable(getOriginalColumnFromAlias(field));
    if (getTableName(owner) === subquery.alias) return subquery.base ? getNamedColumns(subquery.base, name) : [];
    return toReadColumns(field, derived);
  });

const toReadColumns = (column: Column, derived: DerivedFields): ReadColumn[] => {
  const baseColumn = getOriginalColumnFromAlias(column);
  const subquery = derived.get(getTableName(getColumnTable(baseColumn)));
  return subquery
    ? getDerivedColumns(subquery, baseColumn.name, derived)
    : getNamedColumns(getColumnTable(baseColumn), baseColumn.name);
};

const getScopeOf = ({ key, owner }: ReadColumn) => {
  const scope = getTableScope(owner);
  return {
    isScope: scope?.columns.includes(key) === true || scope?.secretColumns?.includes(key) === true,
    isSecret: scope?.secretColumns?.includes(key) === true,
  };
};

// A side of a join is selected when the read's own select returns that table column, under the name it returns it by
const toKey = ({ key, owner }: ReadColumn, selections: ReadSelection[]): ReadSetKey => {
  const table = getTableName(owner);
  const selection = selections.find((candidate) => candidate.table === table && candidate.column === key);
  return selection ? { column: key, selectedAs: selection.selectedAs, table } : { column: key, table };
};

// An equality names the rows its value selects. Through a derived table it narrows the subquery's rows, so it names them
// Without naming the table at this level, which the subquery's own level does
const addScopes = (columns: ReadColumn[], value: unknown, context: ReadContext, throughSubquery: boolean) => {
  for (const readColumn of columns) {
    const { isScope, isSecret } = getScopeOf(readColumn);
    if (!isScope) {
      addFilters([readColumn], context);
      continue;
    }
    const table = getTableName(readColumn.owner);
    const scope: ReadSetScope = { column: readColumn.key, table, value };
    context.readSet.scopes.push(isSecret ? { ...scope, secret: true } : scope);
    if (!throughSubquery) context.level.scopedTables.push(table);
  }
};

// A left join null-fills the side that reads its joined relation, when only that side does. Neither side, or both, is no
// Left join's null-filled side, so the join is read as an inner one
const getNullFilled = (left: ReadColumn, right: ReadColumn, relation: string): JoinSide | undefined => {
  const isLeftJoined = left.relation === relation;
  if (isLeftJoined === (right.relation === relation)) return undefined;
  return isLeftJoined ? JoinSide.Left : JoinSide.Right;
};

const toJoin = (left: ReadColumn, right: ReadColumn, context: ReadContext, isSubquery: boolean): ReadSetJoin => {
  const leftKey = toKey(left, context.selections);
  const rightKey = toKey(right, context.selections);
  if (isSubquery) return { kind: JoinKind.Subquery, left: leftKey, right: rightKey };
  const nullFilled = context.join?.isLeft ? getNullFilled(left, right, context.join.relation) : undefined;
  return nullFilled === undefined
    ? { kind: JoinKind.Inner, left: leftKey, right: rightKey }
    : { kind: JoinKind.Left, left: leftKey, nullFilled, right: rightKey };
};

// A join is a fact when one of its columns is a scope column: the other side's rows are named by its values. A pair of
// Columns with no scope column between them is no join the topics name, so each of its columns filters its table
const addJoins = (left: ReadColumn[], right: ReadColumn[], context: ReadContext, isSubquery: boolean) => {
  for (const leftColumn of left)
    for (const rightColumn of right) {
      if (!getScopeOf(leftColumn).isScope && !getScopeOf(rightColumn).isScope) {
        addFilters([leftColumn, rightColumn], context);
        continue;
      }
      context.readSet.joins.push(toJoin(leftColumn, rightColumn, context, isSubquery));
    }
};

// A column a condition tests, other than by a scope equality or a join, filters its table, so a row the condition removes
// Is one the table's topics must still reach
const addFilters = (columns: ReadColumn[], { readSet }: ReadContext) => {
  for (const readColumn of columns)
    readSet.filters.push({ column: readColumn.key, table: getTableName(readColumn.owner) });
};

const getParenthesisDelta = (chunk: unknown): number => {
  if (!is(chunk, StringChunk)) return 0;
  return (chunk.value.match(/\(/gu)?.length ?? 0) - (chunk.value.match(/\)/gu)?.length ?? 0);
};

// The parenthesis depth in front of each chunk of a flat chunk array
const getDepths = (chunks: unknown[]): number[] => {
  let depth = 0;
  return chunks.map((chunk) => {
    const current = depth;
    depth += getParenthesisDelta(chunk);
    return current;
  });
};

// The alias a table is given in a statement's text, such as `"auth_users" as "d1"`, which is three chunks
const getDeclaredAlias = (chunks: unknown[], index: number): undefined | { alias: string; table: Table } => {
  const source = chunks[index];
  const connector = chunks[index + 1];
  const alias = getNameValue(chunks[index + 2]);
  if (alias === undefined || !is(connector, StringChunk) || connector.value.trim().toLowerCase() !== "as")
    return undefined;
  const name = getNameValue(source);
  if (name !== undefined) {
    const table = tableMap.get(name);
    return table ? { alias, table } : undefined;
  }
  return is(source, Table) ? { alias, table: getBaseTable(source) } : undefined;
};

const getAliasDeclarations = (chunks: unknown[], depths: number[]): AliasDeclaration[] =>
  chunks.flatMap((_chunk, index): AliasDeclaration[] => {
    const declared = getDeclaredAlias(chunks, index);
    if (!declared) return [];
    const depth = depths[index] ?? 0;
    let start = index;
    while (start > 0 && (depths[start - 1] ?? 0) >= depth) start -= 1;
    let end = index + 1;
    while (end < chunks.length && (depths[end] ?? 0) >= depth) end += 1;
    return [{ ...declared, end, start }];
  });

// The table an alias names at a chunk: the innermost declaration of it whose region holds the chunk, else the table of
// That name in the schema, which is how an unaliased reference names its table
const resolveAlias = (alias: string, index: number, declarations: AliasDeclaration[]): Table | undefined => {
  let found: AliasDeclaration | undefined;
  for (const declaration of declarations)
    if (
      declaration.alias === alias &&
      declaration.start <= index &&
      index < declaration.end &&
      (!found || declaration.start > found.start)
    )
      found = declaration;
  return found?.table ?? tableMap.get(alias);
};

// A column a chunk reads: a column object, or an alias and a column name written as text, such as `"d0"."userId"`
const readReferenceAt = (
  chunks: unknown[],
  index: number,
  declarations: AliasDeclaration[],
  context: ReadContext,
): ReadReference | undefined => {
  const chunk = chunks[index];
  let reference: ReadReference | undefined;
  if (is(chunk, Column)) {
    const relation = getTableName(getColumnTable(chunk));
    reference = {
      columns: toReadColumns(chunk, context.derived).map((readColumn) => ({ ...readColumn, relation })),
      length: 1,
      throughSubquery: context.derived.has(getTableName(getColumnTable(getOriginalColumnFromAlias(chunk)))),
    };
  } else {
    const alias = getNameValue(chunk);
    const dot = chunks[index + 1];
    const name = getNameValue(chunks[index + 2]);
    if (alias !== undefined && is(dot, StringChunk) && dot.value === "." && name !== undefined) {
      const table = resolveAlias(alias, index, declarations);
      const columns = table ? getNamedColumns(table, name) : [];
      reference = {
        columns: columns.map((readColumn) => ({ ...readColumn, relation: alias })),
        length: 3,
        throughSubquery: false,
      };
    }
  }
  return reference;
};

// The first column a subquery selects, which is what an `in` compares its column against
const getFirstSelectedColumn = (statement: SQLWrapper): Column | undefined =>
  Object.values(getSelectedFields(statement)).find((field): field is Column => is(field, Column));

// A condition is a scope equality, a join or a filter. A `not in` over a subquery removes its rows, so it is a filter, and so
// Is any other operator the walker has no fact for
const readCondition = (
  chunks: unknown[],
  operatorIndex: number,
  reference: ReadReference,
  declarations: AliasDeclaration[],
  context: ReadContext,
) => {
  const operator = getOperatorText(chunks[operatorIndex]);
  const operand = chunks[operatorIndex + 1];
  if (operator === "=" && is(operand, Param))
    addScopes(reference.columns, operand.value, context, reference.throughSubquery);
  else if (operator === "=") {
    const other = readReferenceAt(chunks, operatorIndex + 1, declarations, context);
    if (other) addJoins(reference.columns, other.columns, context, false);
    else addFilters(reference.columns, context);
  } else if (operator === "in" && Array.isArray(operand)) {
    const values: unknown[] = operand;
    for (const value of values)
      if (is(value, Param)) addScopes(reference.columns, value.value, context, reference.throughSubquery);
  } else if (operator === "in" && checkIsStatementLike(operand)) {
    const selected = getFirstSelectedColumn(operand);
    if (selected) addJoins(reference.columns, toReadColumns(selected, context.derived), context, true);
    else addFilters(reference.columns, context);
  } else addFilters(reference.columns, context);
};

const joinKinds = new Set(["cross", "full", "inner", "left", "right"]);

// The relation a join names: a table, a subquery, or an aliased table, which is written as its name, ` as ` and its alias
const getJoinRelation = (chunk: unknown): string | undefined => {
  if (is(chunk, Table)) return getTableName(chunk);
  if (is(chunk, Subquery)) return chunk._.alias;
  return is(chunk, SQL) ? getNameValue(chunk.queryChunks.at(-1)) : undefined;
};

// A join is written as its kind, ` join `, the relation it joins and its ON condition, the chunk after the relation. The
// ON condition is walked as the join it is, so its conditions name the join's kind and relation
const getJoinContexts = (chunks: unknown[]): Map<number, JoinContext> =>
  new Map(
    chunks.flatMap((chunk, index): [number, JoinContext][] => {
      const kind = is(chunk, StringChunk) ? chunk.value.trim().toLowerCase() : undefined;
      const word = chunks[index + 1];
      const relation = getJoinRelation(chunks[index + 2]);
      return kind !== undefined &&
        joinKinds.has(kind) &&
        is(word, StringChunk) &&
        word.value.trim().toLowerCase() === "join" &&
        relation !== undefined
        ? [[index + 3, { isLeft: kind === "left", relation }]]
        : [];
    }),
  );

// The conditions of one flat chunk array are read against the aliases it declares, by region
const walkSiblings = (chunks: unknown[], context: ReadContext) => {
  const declarations = getAliasDeclarations(chunks, getDepths(chunks));
  const joins = getJoinContexts(chunks);
  for (const declaration of declarations) context.level.tables.push(getTableName(declaration.table));
  let index = 0;
  while (index < chunks.length) {
    const reference = readReferenceAt(chunks, index, declarations, context);
    if (reference) {
      readCondition(chunks, index + reference.length, reference, declarations, context);
      index += reference.length;
    } else {
      const join = joins.get(index);
      walkChunk(chunks[index], join ? { ...context, join } : context);
      index += 1;
    }
  }
};

// A statement nested in another is a level of its own, whose tables and equalities are read apart from the statement that
// Holds it, so an equality in the nested statement does not name its table for the outer one
const enterLevel = (context: ReadContext): ReadContext => {
  const level: ReadSetLevel = { scopedTables: [], tables: [] };
  context.readSet.levels.push(level);
  return { ...context, join: undefined, level };
};

// A relational query's nested relation is a parenthesised select written into the query's own text, not a builder, so it
// Is recognised by the select it opens with
const checkIsNestedSelect = (chunk: SQL): boolean => {
  const [first] = chunk.queryChunks;
  return is(first, StringChunk) && /^\s*\(\s*select\b/iu.test(first.value);
};

// Every chunk of a statement is walked: its text's sibling chunks are read as conditions, and a nested statement or
// Subquery is walked as its own level
const walkChunk = (chunk: unknown, context: ReadContext): void => {
  if (Array.isArray(chunk)) {
    const chunks: unknown[] = chunk;
    walkSiblings(chunks, context);
  } else if (is(chunk, SQL))
    walkSiblings(chunk.queryChunks, checkIsNestedSelect(chunk) ? enterLevel(context) : context);
  else if (is(chunk, Table)) context.level.tables.push(getTableName(getBaseTable(chunk)));
  else if (is(chunk, Subquery)) {
    const base = findFirstTable(chunk._.sql);
    context.derived.set(chunk._.alias, {
      alias: chunk._.alias,
      selectedFields: chunk._.selectedFields,
      ...(base ? { base } : {}),
    });
    walkChunk(chunk._.sql, enterLevel(context));
  } else if (checkIsStatementLike(chunk)) walkChunk(chunk.getSQL(), enterLevel(context));
};

const toTableKey = (readColumn: ReadColumn): ReadSetKey => ({
  column: readColumn.key,
  table: getTableName(readColumn.owner),
});

// Drizzle's column config picks its mode from the values in it: any `true` selects only the `true` columns, while a
// Config of only `false`s selects every other column. A config with no value at all selects none
const checkIsSelectedColumn = (configured: unknown, key: string): boolean => {
  if (!checkIsRecord(configured)) return true;
  const values = Object.values(configured);
  if (values.includes(true)) return configured[key] === true;
  return values.includes(false) && configured[key] !== false;
};

// What the statement's own select returns, by the key each column is selected under. A relational query selects its
// Table's columns, or the ones its config names
const getSelections = (statement: SQLWrapper): ReadSelection[] => {
  const fields = getSelectedFields(statement);
  if (Object.keys(fields).length > 0)
    return Object.entries(fields).flatMap(([selectedAs, field]) =>
      is(field, Column)
        ? toReadColumns(field, new Map()).map((readColumn) => ({ ...toTableKey(readColumn), selectedAs }))
        : [],
    );
  const table = getRelationalTable(statement);
  if (!table) return [];
  const configured = getStatementConfig(statement)?.columns;
  return Object.entries(getTableColumns(table))
    .filter(([key]) => checkIsSelectedColumn(configured, key))
    .flatMap(([key, column]) =>
      toReadColumns(column, new Map()).map((readColumn) => ({ ...toTableKey(readColumn), selectedAs: key })),
    );
};

// The read set of one statement the handle recorded: the tables it reads, the scope values it tests, the joins whose
// Rows are named by a scope column, and the columns it tests for null
export const getStatementReadSet = (statement: SQLWrapper): ReadSet => {
  const readSet: ReadSet = { filters: [], joins: [], levels: [], scopes: [], tables: [] };
  const level: ReadSetLevel = { scopedTables: [], tables: [] };
  readSet.levels.push(level);
  walkChunk(statement.getSQL(), {
    derived: new Map(),
    join: undefined,
    level,
    readSet,
    selections: getSelections(statement),
  });
  // A level a statement opens with nothing in it, such as a relation that selects only its own columns, names nothing
  const levels = readSet.levels
    .map(({ scopedTables, tables }) => ({
      scopedTables: [...new Set(scopedTables)].toSorted(),
      tables: [...new Set(tables)].toSorted(),
    }))
    .filter(({ scopedTables, tables }) => scopedTables.length + tables.length > 0);
  return { ...readSet, levels, tables: [...new Set(levels.flatMap(({ tables }) => tables))].toSorted() };
};
