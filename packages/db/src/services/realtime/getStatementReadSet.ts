import type { ReadSet, ReadSetJoin, ReadSetKey, ReadSetLevel, ReadSetScope } from "#src/models/realtime/ReadSet";
import type { SQLWrapper } from "drizzle-orm";

import { FilterSite } from "#src/models/realtime/FilterSite";
import { JoinKind } from "#src/models/realtime/JoinKind";
import { JoinSide } from "#src/models/realtime/JoinSide";
import { JsonArrayParam } from "#src/models/shared/JsonArrayParam";
import { getOccurrenceKey } from "#src/services/realtime/getOccurrenceKey";
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

// A table occurrence a level declares, and an occurrence an equality of its own scopes at a level
interface Declaration {
  level: ReadSetLevel;
  occurrence: string;
  table: string;
}

// A subquery the statement joins: its alias, the fields it selects, and the table its SQL reads first
interface DerivedSubquery {
  alias: string;
  base?: Table;
  selectedFields: Record<string, unknown>;
}

type DerivedSubqueryMap = Map<string, DerivedSubquery>;

// The join whose ON condition a chunk array is: whether it is a left join, and the relation it joins
interface JoinContext {
  isLeft: boolean;
  relation: string;
}

// A base table's column by the key its table definition gives it, which is the key a scope declaration names. `relation` is
// The name the reference reads the column through, which is the name a join's ON condition gives the relation it joins.
// `occurrence` is the table occurrence the column is read from: the alias or name the statement gives that table, or the base
// Occurrence a derived table reads the column from
interface ReadColumn {
  key: string;
  occurrence: string;
  owner: Table;
  relation: string;
}

interface ReadContext {
  // Whether the chunks walked are a WHERE or HAVING condition, which removes the rows it does not hold
  condition: boolean;
  // Every table occurrence the statement declares, and each one an equality scopes
  declared: Declaration[];
  derived: DerivedSubqueryMap;
  // Whether the chunks walked are a branch of an `or`. A row another branch holds is not this branch's value, so a condition
  // In it filters its table, as one under a `not` does
  inOr: boolean;
  join?: JoinContext | undefined;
  level: ReadSetLevel;
  // Whether the chunks walked sit under a `not`, so a condition in them removes the rows it holds, and filters its table
  negated: boolean;
  // The keys of the table occurrences a left join null-fills, at every level
  nullFilledKeys: Set<string>;
  readSet: ReadSet;
  scopedKeys: ScopedKey[];
}

interface ReadReference {
  columns: ReadColumn[];
  length: number;
  // Whether the column is read through a derived table, whose own level names its table
  throughSubquery: boolean;
}

// A column the read's own select returns, under the name it returns it by. A select is read in the statement's top level only, so
// Its level is that level, SELECT_LEVEL, and is not stored
interface ReadSelection extends Pick<ReadSetKey, "column" | "occurrence" | "table"> {
  selectedAs: string;
}

interface ScopedKey {
  level: ReadSetLevel;
  occurrence: string;
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
const getNamedColumns = (table: Table, name: string, occurrence = getTableName(table)): ReadColumn[] => {
  const columns = getTableColumns(table);
  const key = Object.keys(columns).find((candidate) => columns[candidate]?.name === name);
  return key === undefined ? [] : [{ key, occurrence, owner: getBaseTable(table), relation: getTableName(table) }];
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
const getDerivedColumns = (subquery: DerivedSubquery, name: string, derived: DerivedSubqueryMap): ReadColumn[] =>
  Object.values(subquery.selectedFields).flatMap((field) => {
    if (!is(field, Column) || field.name !== name) return [];
    const owner = getColumnTable(getOriginalColumnFromAlias(field));
    if (getTableName(owner) === subquery.alias) return subquery.base ? getNamedColumns(subquery.base, name) : [];
    return toReadColumns(field, derived);
  });

const toReadColumns = (column: Column, derived: DerivedSubqueryMap): ReadColumn[] => {
  const baseColumn = getOriginalColumnFromAlias(column);
  const subquery = derived.get(getTableName(getColumnTable(baseColumn)));
  return subquery
    ? getDerivedColumns(subquery, baseColumn.name, derived)
    : getNamedColumns(getColumnTable(baseColumn), baseColumn.name, getTableName(getColumnTable(column)));
};

const getScopeOf = ({ key, owner }: ReadColumn) => {
  const scope = getTableScope(owner);
  return {
    isScope: scope?.columns.includes(key) === true || scope?.secretColumns?.includes(key) === true,
    isSecret: scope?.secretColumns?.includes(key) === true,
  };
};

// The statement level a column is read in, numbered in the order the walk opens the statement's levels
const getLevelIndex = ({ level, readSet }: ReadContext): number => readSet.levels.indexOf(level);

const toKey = ({ key, occurrence, owner }: ReadColumn, level: number): ReadSetKey => ({
  column: key,
  level,
  occurrence,
  table: getTableName(owner),
});

// An equality names the rows its value selects. Through a derived table it narrows the subquery's rows, so it names them
// Without naming the table at this level, which the subquery's own level does
// A left join keeps the rows of the table it does not null-fill, whatever its ON clause tests, so a condition on that table
// Removes none of its rows and is a filter on it, not a scope
const checkIsKeptByLeftJoin = (readColumn: ReadColumn, join: JoinContext | undefined): boolean =>
  join?.isLeft === true && readColumn.relation !== join.relation;

const addScopes = (columns: ReadColumn[], value: unknown, context: ReadContext, throughSubquery: boolean) => {
  for (const readColumn of columns) {
    const { isScope, isSecret } = getScopeOf(readColumn);
    if (!isScope || checkIsKeptByLeftJoin(readColumn, context.join)) {
      addFilters([readColumn], context);
      continue;
    }
    const table = getTableName(readColumn.owner);
    const scope: ReadSetScope = { column: readColumn.key, table, value };
    context.readSet.scopes.push(isSecret ? { ...scope, secret: true } : scope);
    if (!throughSubquery) context.scopedKeys.push({ level: context.level, occurrence: readColumn.occurrence });
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
  const leftKey = toKey(left, getLevelIndex(context));
  // A subquery's selected column is read in the subquery's own level, which the walk has not opened yet: -1 is the level no
  // Declared occurrence holds, so that side is never named by its rows
  if (isSubquery) return { kind: JoinKind.Subquery, left: leftKey, right: toKey(right, -1) };
  const rightKey = toKey(right, getLevelIndex(context));
  const nullFilled = context.join?.isLeft ? getNullFilled(left, right, context.join.relation) : undefined;
  return nullFilled === undefined
    ? { kind: JoinKind.Inner, left: leftKey, right: rightKey }
    : { kind: JoinKind.Left, left: leftKey, nullFilled, right: rightKey };
};

// A left join null-fills the rows of its occurrence. A derived table's column names its base table, not an occurrence the statement
// Declares, so it records nothing: its key would be the key of an outer occurrence of the same table
const addNullFilled = (readColumn: ReadColumn, context: ReadContext) => {
  if (readColumn.relation !== readColumn.occurrence) return;
  context.nullFilledKeys.add(
    getOccurrenceKey({
      level: getLevelIndex(context),
      occurrence: readColumn.occurrence,
      table: getTableName(readColumn.owner),
    }),
  );
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
      const join = toJoin(leftColumn, rightColumn, context, isSubquery);
      context.readSet.joins.push(join);
      if (join.kind === JoinKind.Left)
        addNullFilled(join.nullFilled === JoinSide.Left ? leftColumn : rightColumn, context);
    }
};

// The clause a condition on a column sits in: the ON clause of a left join on the table that join brings, another ON clause,
// Or the WHERE clause, where no join context is set
const getFilterSite = (readColumn: ReadColumn, join: JoinContext | undefined): FilterSite => {
  if (!join) return FilterSite.Where;
  return join.isLeft && readColumn.relation === join.relation ? FilterSite.LeftJoinOn : FilterSite.JoinOn;
};

// A column a condition tests, other than by a scope equality or a join, filters its table, so a row the condition removes
// Is one the table's topics must still reach
// A column in the select list or a group or order clause is no condition, so it removes no row and filters nothing
const addFilters = (columns: ReadColumn[], context: ReadContext) => {
  const { condition, join, readSet } = context;
  if (!condition && !join) return;
  for (const readColumn of columns)
    readSet.filters.push({
      column: readColumn.key,
      level: getLevelIndex(context),
      occurrence: readColumn.occurrence,
      site: getFilterSite(readColumn, join),
      table: getTableName(readColumn.owner),
    });
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
        columns: columns.map((readColumn) => ({ ...readColumn, occurrence: alias, relation: alias })),
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
// Is any other operator the walker has no fact for. Returns the chunks after the operator that the condition read as its
// Other operand, which the walker does not read again as a column of its own
const readCondition = (
  chunks: unknown[],
  operatorIndex: number,
  reference: ReadReference,
  declarations: AliasDeclaration[],
  context: ReadContext,
): number => {
  // A condition under a `not`, or in a branch of an `or`, does not hold the rows its value selects alone, so every column it
  // Names filters its table
  if (context.negated || context.inOr) {
    addFilters(reference.columns, context);
    return 0;
  }
  const operator = getOperatorText(chunks[operatorIndex]);
  const operand = chunks[operatorIndex + 1];
  // A list bound as one JSON array is the IN list over the values it holds, so each value is a scope of the column
  if (is(operand, JsonArrayParam))
    for (const value of operand.values) addScopes(reference.columns, value, context, reference.throughSubquery);
  else if (operator === "=" && is(operand, Param))
    addScopes(reference.columns, operand.value, context, reference.throughSubquery);
  else if (operator === "=") {
    const other = readReferenceAt(chunks, operatorIndex + 1, declarations, context);
    if (other) {
      addJoins(reference.columns, other.columns, context, false);
      return 1 + other.length;
    }
    addFilters(reference.columns, context);
  } else if (operator === "in" && Array.isArray(operand)) {
    const values: unknown[] = operand;
    for (const value of values)
      if (is(value, Param)) addScopes(reference.columns, value.value, context, reference.throughSubquery);
  } else if (operator === "in" && checkIsStatementLike(operand)) {
    const selected = getFirstSelectedColumn(operand);
    if (selected) addJoins(reference.columns, toReadColumns(selected, context.derived), context, true);
    else addFilters(reference.columns, context);
  } else addFilters(reference.columns, context);
  return 0;
};

const joinKinds = new Set(["cross", "full", "inner", "left", "right"]);

// The relation a join names: a table, a subquery, or a table under an alias, which the statement writes as the aliased table
// Itself. An unaliased table is written as its name, so its relation is that name
const getJoinRelation = (chunk: unknown): string | undefined => {
  if (is(chunk, Table)) return getTableName(chunk);
  if (is(chunk, Subquery)) return chunk._.alias;
  if (!is(chunk, SQL)) return undefined;
  const last = chunk.queryChunks.at(-1);
  return is(last, Table) ? getTableName(last) : getNameValue(last);
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

// Whether a clause keyword's text opens a condition, or a clause that only shapes the rows a statement returns. Text that
// Opens neither leaves the clause in force as it was
const getClauseCondition = (text: string): boolean | undefined => {
  if (/\b(?:where|having)\b/iu.test(text)) return true;
  if (/\b(?:select|from|group\s+by|order\s+by|limit|offset)\b/iu.test(text)) return false;
  return undefined;
};

// The conditions of one flat chunk array are read against the aliases it declares, by region. A clause keyword in the array
// Sets whether the chunks after it are conditions, so a WHERE's references filter their table and a select list's do not
// Which chunks a `not` negates. Drizzle writes `not (condition)` for a condition, so the chunks inside the parentheses that follow
// `not (` are negated, and `not column` for a column, so the chunk after a bare `not` is
const getNegatedAt = (chunks: unknown[], depths: number[]): boolean[] => {
  const groupDepths: number[] = [];
  let negatesNext = false;
  return chunks.map((chunk, index) => {
    const depth = depths[index] ?? 0;
    while (groupDepths.length > 0 && depth < (groupDepths.at(-1) ?? 0)) groupDepths.pop();
    const negated = negatesNext || groupDepths.length > 0;
    negatesNext = false;
    const text = is(chunk, StringChunk) ? chunk.value : "";
    if (/\bnot\s*\(+\s*$/iu.test(text)) groupDepths.push(depth + getParenthesisDelta(chunk));
    else if (/\bnot\s*$/iu.test(text)) negatesNext = true;
    return negated;
  });
};

// The separator between the branches of an `or`, which drizzle writes into the one flat chunk array its branches are joined in
const checkIsOrSeparator = (chunk: unknown): boolean => is(chunk, StringChunk) && /\bor\b/iu.test(chunk.value);

const walkSiblings = (chunks: unknown[], parent: ReadContext) => {
  const context: ReadContext = { ...parent, inOr: parent.inOr || chunks.some((chunk) => checkIsOrSeparator(chunk)) };
  const depths = getDepths(chunks);
  const declarations = getAliasDeclarations(chunks, depths);
  const negatedAt = getNegatedAt(chunks, depths);
  const joins = getJoinContexts(chunks);
  for (const declaration of declarations)
    declareOccurrence(context, declaration.alias, getTableName(declaration.table));
  let condition = context.condition;
  let index = 0;
  while (index < chunks.length) {
    const reference = readReferenceAt(chunks, index, declarations, context);
    if (reference) {
      const consumed = readCondition(chunks, index + reference.length, reference, declarations, {
        ...context,
        condition,
        negated: context.negated || (negatedAt[index] ?? false),
      });
      index += reference.length + consumed;
    } else {
      const chunk = chunks[index];
      const clause = is(chunk, StringChunk) ? getClauseCondition(chunk.value) : undefined;
      if (clause !== undefined) condition = clause;
      const join = joins.get(index);
      walkChunk(chunk, {
        ...context,
        condition,
        negated: context.negated || (negatedAt[index] ?? false),
        ...(join ? { join } : {}),
      });
      index += 1;
    }
  }
};

// A table occurrence a level declares, once: its alias or name in the statement, and the table it reads
const declareOccurrence = (context: ReadContext, occurrence: string, table: string) => {
  context.level.tables.push(table);
  if (
    context.declared.some(
      (declared) => declared.level === context.level && declared.occurrence === occurrence && declared.table === table,
    )
  )
    return;
  context.declared.push({ level: context.level, occurrence, table });
};

// A statement nested in another is a level of its own, whose tables and equalities are read apart from the statement that
// Holds it, so an equality in the nested statement does not name its table for the outer one
const enterLevel = (context: ReadContext): ReadContext => {
  const level: ReadSetLevel = { tables: [] };
  context.readSet.levels.push(level);
  return { ...context, condition: false, join: undefined, level };
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
  else if (is(chunk, Table)) declareOccurrence(context, getTableName(chunk), getTableName(getBaseTable(chunk)));
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

// The statement's own select is its top level, which the walk opens first, so a selection's level is zero
const SELECT_LEVEL = 0;

// Drizzle's column config picks its mode from the values in it: any `true` selects only the `true` columns, while a
// Config of only `false`s selects every other column. A config with no value at all selects none
const checkIsSelectedColumn = (configured: unknown, key: string): boolean => {
  if (!checkIsRecord(configured)) return true;
  const values = Object.values(configured);
  if (values.includes(true)) return configured[key] === true;
  return values.includes(false) && configured[key] !== false;
};

// The columns a select list names, under the name it selects them by, read in the occurrence the column belongs to
const toSelections = (column: Column, selectedAs: string): ReadSelection[] =>
  toReadColumns(column, new Map()).map((readColumn) => ({
    column: readColumn.key,
    occurrence: readColumn.occurrence,
    selectedAs,
    table: getTableName(readColumn.owner),
  }));

// The alias a relational query gives its root table in its own FROM, such as `from "message_usersToRooms" as "d0"`, which its
// Selected columns are read through. It is the declaration at the statement's top level, not one a nested relation declares
const getRootAlias = (statement: SQLWrapper, table: Table): string | undefined => {
  const chunks: unknown[] = statement.getSQL().queryChunks;
  const depths = getDepths(chunks);
  const tableName = getTableName(getBaseTable(table));
  return getAliasDeclarations(chunks, depths).find(
    ({ start, table: declared }) => (depths[start] ?? 0) === 0 && getTableName(getBaseTable(declared)) === tableName,
  )?.alias;
};

// A relational query selects its root table's columns, or the ones its config names. They are read through the root's alias,
// So a statement that does not declare one names no key
const getRelationalSelections = (statement: SQLWrapper, table: Table): ReadSelection[] => {
  const occurrence = getRootAlias(statement, table);
  if (occurrence === undefined) return [];
  const configured = getStatementConfig(statement)?.columns;
  return Object.keys(getTableColumns(table))
    .filter((key) => checkIsSelectedColumn(configured, key))
    .map((key) => ({ column: key, occurrence, selectedAs: key, table: getTableName(getBaseTable(table)) }));
};

const getSelections = (statement: SQLWrapper): ReadSelection[] => {
  const fields = getSelectedFields(statement);
  if (Object.keys(fields).length > 0)
    return Object.entries(fields).flatMap(([selectedAs, field]) =>
      is(field, Column) ? toSelections(field, selectedAs) : [],
    );
  const table = getRelationalTable(statement);
  return table ? getRelationalSelections(statement, table) : [];
};

// The selection of a join side's own column of its own occurrence, at the statement's top level, under the name it returns it by
const findOwnSelection = (key: ReadSetKey, selections: ReadSelection[]): ReadSelection | undefined =>
  key.level === SELECT_LEVEL
    ? selections.find(
        (candidate) =>
          candidate.table === key.table && candidate.column === key.column && candidate.occurrence === key.occurrence,
      )
    : undefined;

// The same column of another top-level occurrence, which names the side when no left join null-fills that occurrence: its value
// Is then in every row the read returns, where the side's own value is absent for the rows its left join leaves unmatched
const findBorrowedSelection = (
  key: ReadSetKey,
  selections: ReadSelection[],
  nullFilledKeys: Set<string>,
): ReadSelection | undefined =>
  selections.find(
    (candidate) =>
      candidate.table === key.table &&
      candidate.column === key.column &&
      !nullFilledKeys.has(getOccurrenceKey({ ...candidate, level: SELECT_LEVEL })),
  );

// The name a join side's value is returned under: its own selection, else a borrowed one
const toSelectedKey = (key: ReadSetKey, selections: ReadSelection[], nullFilledKeys: Set<string>): ReadSetKey => {
  const selection = findOwnSelection(key, selections) ?? findBorrowedSelection(key, selections, nullFilledKeys);
  return selection ? { ...key, selectedAs: selection.selectedAs } : key;
};

// A subquery's selected column holds the outer column's value in every row the outer read returns, since the two are compared
// For equality, so it takes the name of the outer column's own selection, and no borrowed one
const toSelectedJoin = (join: ReadSetJoin, selections: ReadSelection[], nullFilledKeys: Set<string>): ReadSetJoin => {
  const left = toSelectedKey(join.left, selections, nullFilledKeys);
  if (join.kind !== JoinKind.Subquery)
    return { ...join, left, right: toSelectedKey(join.right, selections, nullFilledKeys) };
  const outer = findOwnSelection(join.left, selections);
  return outer === undefined
    ? { ...join, left }
    : { ...join, left, right: { ...join.right, selectedAs: outer.selectedAs } };
};

// The read set of one statement the handle recorded: the tables it reads, the scope values it tests, the joins whose
// Rows are named by a scope column, and the columns it tests for null
export const getStatementReadSet = (statement: SQLWrapper): ReadSet => {
  const readSet: ReadSet = { filters: [], joins: [], levels: [], occurrences: [], scopes: [], tables: [] };
  const level: ReadSetLevel = { tables: [] };
  readSet.levels.push(level);
  const declared: Declaration[] = [];
  const scopedKeys: ScopedKey[] = [];
  const nullFilledKeys = new Set<string>();
  walkChunk(statement.getSQL(), {
    condition: false,
    declared,
    derived: new Map(),
    inOr: false,
    join: undefined,
    level,
    negated: false,
    nullFilledKeys,
    readSet,
    scopedKeys,
  });
  const selections = getSelections(statement);
  readSet.joins = readSet.joins.map((join) => toSelectedJoin(join, selections, nullFilledKeys));
  // Every level the walk opened is kept, an empty one too, so an occurrence's level is its position in `levels`
  const levels = readSet.levels.map(({ tables }) => ({ tables: [...new Set(tables)].toSorted() }));
  // A declaration is scoped by an equality of its own in its level, so the scope is read from the level it was declared in
  const occurrences = declared.map(({ level: declaredLevel, occurrence, table }) => ({
    level: readSet.levels.indexOf(declaredLevel),
    occurrence,
    scoped: scopedKeys.some((scopedKey) => scopedKey.level === declaredLevel && scopedKey.occurrence === occurrence),
    table,
  }));
  return { ...readSet, levels, occurrences, tables: [...new Set(levels.flatMap(({ tables }) => tables))].toSorted() };
};
