import { getSchemaTables } from "#src/services/realtime/getSchemaTables";
import { getTableColumns, getTableName } from "drizzle-orm";

// The name of every column of every table, which a bare word in a statement's SQL may be
const schemaColumnNames = new Set(
  getSchemaTables().flatMap((table) => Object.values(getTableColumns(table)).map(({ name }) => name)),
);

// The text of each parenthesised group a statement holds, without the groups nested in it. A quoted name holds no parenthesis
const getGroupTexts = (sql: string): string[] => {
  const groups = [""];
  const openGroups = [0];
  let isQuoted = false;
  for (const char of sql) {
    if (char === '"') isQuoted = !isQuoted;
    if (!isQuoted && char === "(") {
      groups.push("");
      openGroups.push(groups.length - 1);
    } else if (!isQuoted && char === ")") openGroups.pop();
    else groups[openGroups.at(-1) ?? 0] += char;
  }
  return groups;
};

// The tables a text reads from or joins, by their quoted names
const getTableNamesOf = (text: string) =>
  Array.from(text.matchAll(/\b(?:from|join) "(?<name>[^"]+)"/gu), (match) => match.groups?.name ?? "");

// Whether a column's quoted name stands bare in a text, outside a qualified name after a dot
const hasBareQuotedName = (text: string, name: string) =>
  new RegExp(String.raw`(?<!\.)"${RegExp.escape(name)}"`, "u").test(text);

// The columns of a table that a statement's SQL names. A column is named by its quoted name after one of the table's own
// Qualifiers, its name or an alias the statement gives it. Drizzle leaves a column bare when a group selects from one table
// Alone, so a bare quoted name belongs to the table its own group reads from, and to every table the statement reads when that
// Group reads from several or none. A raw fragment names its columns in bare text, outside the quoted names, so when a bare word
// Is a column of any table, every column of this table is named. A table the schema does not register (a Durable Object's own
// SQLite, which the core schema does not hold) has no columns known here, so it is named by every column: a watch of it wakes
// On any update, which over-wakes and never misses one. `undefined` is that every column
export const getReferencedColumns = (sql: string, tableName: string, aliases: string[]): string[] | undefined => {
  const table = getSchemaTables().find((schemaTable) => getTableName(schemaTable) === tableName);
  if (!table) return undefined;
  const columnNames = Object.values(getTableColumns(table)).map(({ name }) => name);
  const bareWords = sql.replaceAll(/"[^"]*"/gu, " ").match(/[A-Za-z_]\w*/gu) ?? [];
  if (bareWords.some((word) => schemaColumnNames.has(word))) return columnNames;

  const groupTexts = getGroupTexts(sql);
  const statementTables = getTableNamesOf(sql);
  const bareGroupTexts = groupTexts.filter((text) => {
    const readTables = getTableNamesOf(text);
    return readTables.length === 1 ? readTables[0] === tableName : statementTables.includes(tableName);
  });
  const qualifiers = [tableName, ...aliases].map((qualifier) => `"${qualifier}".`);
  return columnNames.filter(
    (name) =>
      qualifiers.some((qualifier) => sql.includes(`${qualifier}"${name}"`)) ||
      bareGroupTexts.some((text) => hasBareQuotedName(text, name)),
  );
};
